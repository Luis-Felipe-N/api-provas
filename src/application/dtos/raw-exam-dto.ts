export interface RawExamDTO {
  title: string
  year: number
  organization: string
  institution: string
  level: string
  sourceUrl: string
  pdfUrl?: string
  answerKeyUrl?: string
  content?: {
    text?: string
    questionsBlock?: string
  }
}
