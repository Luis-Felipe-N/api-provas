import { Exam } from '../../../domain/entities'

export class ExamPresenter {
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
      questionCount: exam.questions.getItems().length,
      hasQuestions: exam.hasQuestions,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt ?? exam.createdAt,
    }
  }
}
