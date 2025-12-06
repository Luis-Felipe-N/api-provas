export interface ScrapeExamsInput {
  sourceUrl: string
  sourceName: string
  maxExams?: number
}

export interface ScrapedExamOutput {
  title: string
  year: string
  organization: string
  institution: string
  level: string
  sourceUrl: string
  examPdfUrl: string | null
  answerKeyUrl: string | null
}

export interface ScrapeExamsOutput {
  exams: ScrapedExamOutput[]
  totalScraped: number
  sourceName: string
}
