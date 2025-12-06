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
  scrapeAll(baseUrl: string): AsyncGenerator<ScrapedExam, void, unknown>
  enrichExam(exam: ScrapedExam): Promise<ScrapedExam>
}
