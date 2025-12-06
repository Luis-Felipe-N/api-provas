import { Exam as PrismaExam } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities'
import { Exam } from '@/domain/entities'

export class PrismaExamMapper {
  static toDomain(raw: PrismaExam): Exam {
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
