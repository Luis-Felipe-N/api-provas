import { failure, success, type Either, UniqueEntityId } from "../../core"
import { Alternative, AlternativeList, Exam, IAlternativeRepository, IExamRepository, IQuestionRepository, Question, QuestionList } from "../../domain"
import { PciConcursosScraper } from "../../infra"
import { AnswerKey, PdfExtractor, QuestionBlock } from "../../infra/scrapers/pdf-extractor"

export enum ScraperSource {
  PCICONCURSOS = 'PCICONCURSOS',
  QCONCURSOS = 'QCONCURSOS',
}

interface ScrapeExamsUseCaseRequest {
  urls: string[]
  source: ScraperSource
}

type ScrapeExamsUseCaseResponse = Either<Error, {
  exams: Exam[]
}>

const normalizeForComparison = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const tokenize = (value: string) =>
  normalizeForComparison(value)
    .split(" ")
    .filter((token) => token.length > 2)

const mergeAnswerKeys = (current: AnswerKey[], incoming: AnswerKey[]) => {
  const merged = new Map<string, AnswerKey>()

  const addKey = (key: AnswerKey) => {
    const identity = `${normalizeForComparison(key.examName)}::${key.tipo}`
    const existing = merged.get(identity)

    if (!existing || Object.keys(key.answers).length > Object.keys(existing.answers).length) {
      merged.set(identity, key)
    }
  }

  current.forEach(addKey)
  incoming.forEach(addKey)

  return Array.from(merged.values())
}

const pickBestAnswerKey = (
  examTitle: string,
  keys: AnswerKey[],
  questions: QuestionBlock[],
): AnswerKey | null => {
  if (keys.length === 0) return null

  const questionNumbers = new Set(questions.map((question) => question.number))
  const examTokens = tokenize(examTitle)
  const examTokenSet = new Set(examTokens)

  return keys.reduce<{ key: AnswerKey | null, score: number }>((best, key) => {
    const keyTokens = tokenize(key.examName)
    const overlap = keyTokens.filter((token) => examTokenSet.has(token)).length
    const matched = Object.keys(key.answers).reduce((count, answer) => {
      const questionNumber = Number(answer)
      return questionNumbers.has(questionNumber) ? count + 1 : count
    }, 0)
    const coverage = questions.length > 0 ? matched / questions.length : 0
    const answerWeight = Math.log(1 + Object.keys(key.answers).length)
    const score = coverage * 5 + overlap + answerWeight * 0.1

    if (!best.key || score > best.score) {
      return { key, score }
    }

    return best
  }, { key: null, score: 0 }).key
}

export class ScrapeExamsUseCase {
  constructor(
    private examRepository: IExamRepository,
    private questionRepository: IQuestionRepository,
    private alternativeRepository: IAlternativeRepository,
  ) { }

  async execute({
    urls, source
  }: ScrapeExamsUseCaseRequest): Promise<ScrapeExamsUseCaseResponse> {
    const scraper = this.resolveScraper(source)
    const pdfExtractor = new PdfExtractor()

    if (!scraper) {
      return failure(new Error('Unsupported scraper source'))
    }

    const savedExams: Exam[] = []

    for (const url of urls) {
      try {
        console.log(`\n🔍 Iniciando scraping na URL: ${url}`)

        for await (const scrapedExam of scraper.scrapeAll(url)) {
          const enrichedExam = await scraper.enrichExam(scrapedExam)
          console.log(`   📄 Processando prova: ${enrichedExam.name}`)

          const exam = Exam.create({
            title: enrichedExam.name,
            year: parseInt(enrichedExam.year) || new Date().getFullYear(),
            organization: enrichedExam.organization,
            institution: enrichedExam.institution,
            level: enrichedExam.level,
            sourceUrl: enrichedExam.pageUrl,
            originalPdfUrl: enrichedExam.download.examUrl,
            answerKeyUrl: enrichedExam.download.answerKeyUrl,
            questions: new QuestionList(),
          })

          if (enrichedExam.download.examUrl) {
            try {
              const pdfContent = await pdfExtractor.extractFromUrl(enrichedExam.download.examUrl)

              const rawQuestions = pdfExtractor.extractQuestions(pdfContent.text)

              let answerKeys = pdfExtractor.extractAnswerKeys(pdfContent.text)

              if (enrichedExam.download.answerKeyUrl) {
                try {
                  const answerKeyContent = await pdfExtractor.extractFromUrl(enrichedExam.download.answerKeyUrl)
                  const externalKeys = pdfExtractor.extractAnswerKeys(answerKeyContent.text)
                  answerKeys = mergeAnswerKeys(answerKeys, externalKeys)
                } catch (akErr) {
                  console.warn(`   ⚠️ Falha ao baixar gabarito separado: ${akErr}`)
                }
              }

              const selectedAnswerKey = pickBestAnswerKey(enrichedExam.name, answerKeys, rawQuestions)
              const bestAnswerKey = selectedAnswerKey?.answers ?? {}
              const matchedQuestions = rawQuestions.filter((question) => Boolean(bestAnswerKey[question.number])).length
              const coverage = rawQuestions.length > 0
                ? ((matchedQuestions / rawQuestions.length) * 100).toFixed(1)
                : "0.0"

              console.log(`   🎯 Gabarito encontrado: ${matchedQuestions}/${rawQuestions.length} questões (${coverage}%) usando ${answerKeys.length} fonte(s)`)

              const questionsEntities = rawQuestions.map(q => {
                const letters = ['A', 'B', 'C', 'D', 'E']
                const questionId = new UniqueEntityId()

                const alternativesList: Alternative[] = letters.map(letter => {
                  const isCorrect = bestAnswerKey[q.number] === letter

                  return Alternative.create({
                    questionId,
                    text: `Alternativa ${letter}`,
                    isCorrect,
                    createdAt: new Date(),
                  })
                })

                return Question.create({
                  statement: q.text,
                  organization: exam.organization,
                  subject: 'Geral',
                  alternatives: new AlternativeList(alternativesList),
                  createdAt: new Date(),
                }, questionId)
              })

              exam.questions = new QuestionList(questionsEntities)

            } catch (pdfErr) {
              console.error(`   ❌ Erro ao processar PDF da prova ${scrapedExam.name}:`, pdfErr)
            }
          }

          await this.examRepository.create(exam)

          if (exam.questions.getItems().length > 0) {
            for (const question of exam.questions.getItems()) {
              // Garante vínculo de ID
              // question.examId = exam.id (se tivesse set)

              // No seu schema.prisma, Question tem examId.
              // Precisamos garantir que o repositório lide com isso ou fazer update.
              // Como estamos criando do zero, o fluxo ideal é salvar Exam -> Salvar Questions com examId.

              // Simulação de salvamento em cascata manual se necessário:
              // await this.questionRepository.create(question, exam.id)
            }
          }

          savedExams.push(exam)
          console.log(`   ✅ Prova salva: ${exam.title} (${exam.questions.currentItems.length} questões)`)
        }
      } catch (error) {
        console.error(`Erro fatal ao processar URL ${url}:`, error)
        // Não retorna failure para não parar o processo de outras URLs, apenas loga
      }
    }

    return success({
      exams: savedExams
    })
  }

  private resolveScraper(source: ScraperSource): PciConcursosScraper | null {
    switch (source) {
      case ScraperSource.PCICONCURSOS:
        return new PciConcursosScraper()
      case ScraperSource.QCONCURSOS:
        // return new QConcursosScraper()
        return null
      default:
        return null
    }
  }
}