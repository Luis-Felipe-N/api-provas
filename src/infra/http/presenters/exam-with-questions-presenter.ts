import { Exam } from '../../../domain/entities'

export class ExamWithQuestionsPresenter {
  static toHTTP(exam: Exam) {
    return {
      id: exam.id.toString(),
      title: exam.title,
      year: exam.year,
      organization: exam.organization,
      institution: exam.institution,
      level: exam.level,
      sourceUrl: exam.sourceUrl ?? null,
      originalPdfUrl: exam.originalPdfUrl ?? null,
      answerKeyUrl: exam.answerKeyUrl ?? null,
      questions: exam.questions.getItems().map(question => ({
        id: question.id.toString(),
        statement: question.statement,
        subject: question.subject,
        organization: question.organization,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt ?? question.createdAt,
        alternatives: question.alternatives.getItems().map(alternative => ({
          id: alternative.id.toString(),
          text: alternative.text,
          isCorrect: alternative.isCorrect,
        }))
      })),
      questionCount: exam.questions.getItems().length,
      hasQuestions: exam.hasQuestions,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt ?? exam.createdAt,
    }
  }
}
