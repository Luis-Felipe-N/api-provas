import { Exam as PrismaExam } from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities'
import { Exam, QuestionList } from '../../../../domain/entities'
import { PrismaQuestionMapper, type PrismaQuestionWithAlternatives } from './prisma-question-mapper'

type PrismaExamWithRelations = PrismaExam & {
  questions?: PrismaQuestionWithAlternatives[]
}

export class PrismaExamMapper {
  static toDomain(raw: PrismaExamWithRelations): Exam {
    const questionEntities = raw.questions
      ? raw.questions.map(PrismaQuestionMapper.toDomain)
      : []

    return Exam.create(
      {
        title: raw.title,
        year: raw.year,
        organization: raw.organization,
        institution: raw.institution,
        level: raw.level,
        sourceUrl: raw.sourceUrl,
        originalPdfUrl: raw.examPdfUrl,
        answerKeyUrl: raw.answerKeyUrl,
        questions: new QuestionList(questionEntities),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(exam: Exam) {
    return {
      id: exam.id.toString(),
      title: exam.title,
      year: exam.year,
      organization: exam.organization,
      institution: exam.institution,
      level: exam.level,
      sourceUrl: exam.sourceUrl ?? null,
      examPdfUrl: exam.originalPdfUrl ?? null,
      answerKeyUrl: exam.answerKeyUrl ?? null,
    }
  }
}
