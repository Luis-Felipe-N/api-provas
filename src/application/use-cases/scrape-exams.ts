import { failure, success, type Either } from "../../core"
import { Exam, IExamRepository } from "../../domain"
import { ScraperFactory } from "../factories/scraper-factory"
import { ExamProcessorService } from "../../domain/services/exam-processor-service"

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

export class ScrapeExamsUseCase {
  constructor(
    private examRepository: IExamRepository,
    private examProcessor: ExamProcessorService,
  ) { }

  async execute({
    urls, source
  }: ScrapeExamsUseCaseRequest): Promise<ScrapeExamsUseCaseResponse> {
    const scraper = ScraperFactory.create(source)

    const savedExams: Exam[] = []

    for (const url of urls) {
      try {
        console.log(`\n🔍 Iniciando scraping na URL: ${url}`)

        for await (const rawExam of scraper.scrapeAll(url)) {
          try {
            console.log(`   📄 Processando prova: ${rawExam.title}`)

            const examEntity = await this.examProcessor.process(rawExam)

            await this.examRepository.create(examEntity)

            savedExams.push(examEntity)
            console.log(`   ✅ Prova salva: ${examEntity.title} (${examEntity.questions.currentItems.length} questões)`)

          } catch (error) {
            console.error(`Error processing exam ${rawExam.title}:`, error)
          }
        }
      } catch (error) {
        console.error(`Erro fatal ao processar URL ${url}:`, error)
      }
    }

    return success({
      exams: savedExams
    })
  }
}
