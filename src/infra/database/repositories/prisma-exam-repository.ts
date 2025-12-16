import { prisma } from '../prisma'
import { Exam } from '../../../domain/entities'
import { IExamRepository, type IQuestionRepository } from '../../../domain/repositories'
import { PrismaExamMapper } from './mappers/prisma-exam-mapper'
import type { IExamRepositoryFindManyParams } from '../../../domain/repositories/exam-repository'
import type { Prisma } from '@prisma/client'

export class PrismaExamRepository implements IExamRepository {
  constructor(private questionRepository: IQuestionRepository) { }

  async create(exam: Exam): Promise<void> {
    const data = PrismaExamMapper.toPrisma(exam)

    await prisma.exam.create({ data })
    if (exam.questions.getItems().length > 0) {
      await this.questionRepository.createMany(
        exam.questions.getItems(),
        exam.id.toString()
      )
    }
  }

  async findById(id: string): Promise<Exam | null> {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            alternatives: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!exam) return null

    return PrismaExamMapper.toDomain(exam)
  }

  async findByOrganization(organization: string): Promise<Exam[]> {
    const exams = await prisma.exam.findMany({
      where: { organization },
      orderBy: { year: 'desc' },
    })

    return exams.map(PrismaExamMapper.toDomain)
  }

  async findMany(params: IExamRepositoryFindManyParams): Promise<Exam[]> {
    const PER_PAGE = 20
    const { page = 1, organization, institution, title, level, year } = params

    const where: Prisma.ExamWhereInput = {
      organization: organization ? { contains: organization, mode: 'insensitive' } : undefined,
      institution: institution ? { contains: institution, mode: 'insensitive' } : undefined,
      title: title ? { contains: title, mode: 'insensitive' } : undefined,
      level: level ? { equals: level, mode: 'insensitive' } : undefined,
      year: year,
    }

    const exams = await prisma.exam.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      orderBy: { createdAt: 'desc' },
    })

    return exams.map(PrismaExamMapper.toDomain)
  }

  async save(exam: Exam): Promise<void> {
    const data = PrismaExamMapper.toPrisma(exam)
    await prisma.exam.update({
      where: { id: exam.id.toString() },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.exam.delete({
      where: { id },
    })
  }
}
