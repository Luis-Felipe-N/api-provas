import { UniqueEntityId } from '../../core'
import { Alternative, AlternativeList, Exam, Question, QuestionList } from '../entities'
import { RawExamDTO } from '../../application/dtos/raw-exam-dto'
import { PdfExtractor, AnswerKey, QuestionBlock } from '../../infra/scrapers/pdf-extractor'

export class ExamProcessorService {
  private pdfExtractor: PdfExtractor

  constructor() {
    this.pdfExtractor = new PdfExtractor()
  }

  async process(rawExam: RawExamDTO): Promise<Exam> {
    const exam = Exam.create({
      title: rawExam.title,
      year: rawExam.year,
      organization: rawExam.organization,
      institution: rawExam.institution,
      level: rawExam.level,
      sourceUrl: rawExam.sourceUrl,
      originalPdfUrl: rawExam.pdfUrl,
      answerKeyUrl: rawExam.answerKeyUrl,
      questions: new QuestionList(),
    })

    let rawQuestions: QuestionBlock[] = []

    if (rawExam.pdfUrl) {
      try {
        // If content is already provided, use it, otherwise fetch
        let text = rawExam.content?.text
        if (!text) {
          const pdfContent = await this.pdfExtractor.extractFromUrl(rawExam.pdfUrl)
          text = pdfContent.text
        }
        rawQuestions = this.pdfExtractor.extractQuestions(text)
      } catch (pdfErr) {
        console.error(`   ❌ Erro ao processar PDF da prova ${rawExam.title}:`, pdfErr)
      }
    } else {
      console.warn(`   ⚠️ Prova ${rawExam.title} não possui link de PDF disponível.`)
    }

    let answerKeys: AnswerKey[] = []

    if (rawExam.answerKeyUrl) {
      try {
        answerKeys = await this.pdfExtractor.extractAnswerKeysFromUrl(rawExam.answerKeyUrl)
      } catch (err) {
        console.warn(`   ⚠️ Erro ao extrair gabarito de ${rawExam.answerKeyUrl}:`, err)
      }
    } else {
      console.warn(`   ⚠️ Prova ${rawExam.title} sem link de gabarito na página de download.`)
    }

    const selectedAnswerKey = this.pickBestAnswerKey(rawExam.title, answerKeys, rawQuestions)
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

    return exam
  }

  private normalizeForComparison(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  }

  private tokenize(value: string) {
    return this.normalizeForComparison(value)
      .split(" ")
      .filter((token) => token.length > 2)
  }

  private pickBestAnswerKey(
    examTitle: string,
    keys: AnswerKey[],
    questions: QuestionBlock[],
  ): AnswerKey | null {
    if (keys.length === 0) return null

    const questionNumbers = new Set(questions.map((question) => question.number))
    const examTokens = this.tokenize(examTitle)
    const examTokenSet = new Set(examTokens)

    return keys.reduce<{ key: AnswerKey | null, score: number }>((best, key) => {
      const keyTokens = this.tokenize(key.examName)
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
}
