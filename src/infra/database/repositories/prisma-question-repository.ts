import { prisma } from '../prisma'
import { Question } from '../../../domain/entities'
import { IQuestionRepository, type IAlternativeRepository } from '../../../domain/repositories'
import { PrismaQuestionMapper } from './mappers/prisma-question-mapper'
import type { IQuestionRepositoryFindManyParams } from '../../../domain/repositories/question-repository'
import type { Prisma } from '@prisma/client'

export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private alternativeRepository: IAlternativeRepository) { }

  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question)

    await prisma.question.create({ data })

    await this.alternativeRepository.createMany(question.alternatives.getItems())
  }

  async createMany(questions: Question[], examId: string): Promise<void> {
    for (const question of questions) {
      const data = PrismaQuestionMapper.toPrisma(question)

      await prisma.question.create({
        data: {
          ...data,
          examId: examId
        }
      })

      const alternatives = question.alternatives.getItems().map(alt => {
        return alt
      })

      await this.alternativeRepository.createMany(alternatives)
    }
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

  async findMany(params: IQuestionRepositoryFindManyParams = {}): Promise<Question[]> {
    const {
      page = 1,
      perPage = 20,
      subject,
      organization,
    } = params

    const where: Prisma.QuestionWhereInput = {
      subject: subject ? { contains: subject, mode: 'insensitive' } : undefined,
      organization: organization ? { contains: organization, mode: 'insensitive' } : undefined,
    }

    const questions = await prisma.question.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
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
