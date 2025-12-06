export interface SubmitAnswerInput {
  simulationId: string
  questionId: string
  alternativeId: string
}

export interface SubmitAnswerOutput {
  isCorrect: boolean
  currentScore: number
  totalAnswered: number
}
