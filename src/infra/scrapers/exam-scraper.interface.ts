import { RawExamDTO } from '../../application/dtos/raw-exam-dto'

export interface ScrapedExam {
  pageUrl: string
  name: string
  year: string
  organization: string
  institution: string
  level: string
  download: {
    examUrl: string | null
    answerKeyUrl: string | null
  }
}

export interface IExamScraper {
  scrapeAll(baseUrl: string): AsyncGenerator<RawExamDTO, void, unknown>
}
