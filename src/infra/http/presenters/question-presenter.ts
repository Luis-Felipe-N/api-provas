import { Question } from '../../../domain/entities'

export class QuestionPresenter {
  static toHTTP(question: Question) {
    return {
      id: question.id.toString(),
      statement: question.statement,
      subject: question.subject,
      organization: question.organization,
      alternatives: question.alternatives.getItems().map(alternative => ({
        id: alternative.id.toString(),
        text: alternative.text,
        isCorrect: alternative.isCorrect,
      })),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt ?? question.createdAt,
    }
  }
}
