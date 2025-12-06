import { prisma } from '../prisma'
import { Question } from '@/domain/entities'
import { IQuestionRepository } from '@/domain/repositories'
import { PrismaQuestionMapper } from './mappers/prisma-question-mapper'

export class PrismaQuestionRepository implements IQuestionRepository {
  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question)
    await prisma.question.create({ data })
  }

  async findById(id: string): Promise<Question | null> {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { alternatives: true },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findByExamId(examId: string): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: { examId },
      include: { alternatives: true },
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async findBySubject(subject: string): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: { subject },
      include: { alternatives: true },
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async findByOrganization(organization: string): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      where: { organization },
      include: { alternatives: true },
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async findMany(params: { page: number; perPage: number }): Promise<Question[]> {
    const questions = await prisma.question.findMany({
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: { alternatives: true },
      orderBy: { createdAt: 'desc' },
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async save(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question)
    await prisma.question.update({
      where: { id: question.id.toString() },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.question.delete({
      where: { id },
    })
  }
}
