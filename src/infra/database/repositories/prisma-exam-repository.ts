import { prisma } from '../prisma'
import { Exam } from '@/domain/entities'
import { IExamRepository } from '@/domain/repositories'
import { PrismaExamMapper } from './mappers/prisma-exam-mapper'

export class PrismaExamRepository implements IExamRepository {
  async create(exam: Exam): Promise<void> {
    const data = PrismaExamMapper.toPrisma(exam)
    await prisma.exam.create({ data })
  }

  async findById(id: string): Promise<Exam | null> {
    const exam = await prisma.exam.findUnique({
      where: { id },
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

  async findMany(params: { page: number; perPage: number }): Promise<Exam[]> {
    const exams = await prisma.exam.findMany({
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
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
