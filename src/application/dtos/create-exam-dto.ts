export interface CreateExamInput {
  title: string
  year: number
  organization: string
  institution: string
  level: string
  sourceUrl?: string
  originalPdfUrl?: string
  answerKeyUrl?: string
}

export interface CreateExamOutput {
  examId: string
}
