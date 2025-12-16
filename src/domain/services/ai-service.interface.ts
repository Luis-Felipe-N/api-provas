export interface QuestionAnalysis {
  subject: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  explanation: string
}

export interface IAIService {
  analyzeQuestion(
    statement: string,
    alternatives: string[],
    correctAnswer: string
  ): Promise<QuestionAnalysis>
}