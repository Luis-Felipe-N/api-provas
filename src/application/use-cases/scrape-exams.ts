import { ScrapeExamsInput, ScrapeExamsOutput, ScrapedExamOutput } from '../dtos/scrape-exams-dto'
import { IExamScraper } from '@/infra/scrapers/exam-scraper.interface'
import { IExamRepository } from '@/domain/repositories'
import { Exam } from '@/domain/entities'

export class ScrapeExamsUseCase {
  constructor(
    private scraper: IExamScraper,
    private examRepository?: IExamRepository
  ) { }

  async execute(input: ScrapeExamsInput): Promise<ScrapeExamsOutput> {
    const exams: ScrapedExamOutput[] = []
    let count = 0
    const maxExams = input.maxExams ?? 100

    for await (const exam of this.scraper.scrapeAll(input.sourceUrl)) {
      if (count >= maxExams) break

      const enrichedExam = await this.scraper.enrichExam(exam)

      const scrapedExam: ScrapedExamOutput = {
        title: enrichedExam.name,
        year: enrichedExam.year,
        organization: enrichedExam.organization,
        institution: enrichedExam.institution,
        level: enrichedExam.level,
        sourceUrl: enrichedExam.pageUrl,
        examPdfUrl: enrichedExam.download.examUrl,
        answerKeyUrl: enrichedExam.download.answerKeyUrl,
      }

      exams.push(scrapedExam)

      // Save to database if repository is provided
      if (this.examRepository) {
        const examEntity = Exam.create({
          title: enrichedExam.name,
          year: parseInt(enrichedExam.year) || new Date().getFullYear(),
          organization: enrichedExam.organization,
          institution: enrichedExam.institution,
          level: enrichedExam.level,
          sourceUrl: enrichedExam.pageUrl,
          originalPdfUrl: enrichedExam.download.examUrl,
          answerKeyUrl: enrichedExam.download.answerKeyUrl,
        })

        await this.examRepository.create(examEntity)
      }

      count++
    }

    return {
      exams,
      totalScraped: count,
      sourceName: input.sourceName,
    }
  }
}
