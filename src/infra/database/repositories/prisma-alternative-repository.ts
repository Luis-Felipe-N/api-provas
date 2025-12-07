import { prisma } from '../prisma'
import { Alternative } from '@/domain/entities'
import { IAlternativeRepository } from '@/domain/repositories'
import { PrismaAlternativeMapper } from './mappers/prisma-alternative-mapper'

export class PrismaAlternativeRepository implements IAlternativeRepository {
  async create(alternative: Alternative): Promise<void> {
    const data = PrismaAlternativeMapper.toPrisma(alternative)
    await prisma.alternative.create({ data })
  }

  async createMany(alternatives: Alternative[]): Promise<void> {
    if (!alternatives.length) {
      return
    }

    const data = alternatives.map(PrismaAlternativeMapper.toPrisma)

    await prisma.alternative.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async findById(id: string): Promise<Alternative | null> {
    const alternative = await prisma.alternative.findUnique({
      where: { id },
    })

    if (!alternative) {
      return null
    }

    return PrismaAlternativeMapper.toDomain(alternative)
  }

  async findByQuestionId(questionId: string): Promise<Alternative[]> {
    const alternatives = await prisma.alternative.findMany({
      where: { questionId },
      orderBy: { createdAt: 'asc' },
    })

    return alternatives.map(PrismaAlternativeMapper.toDomain)
  }

  async delete(id: string): Promise<void> {
    await prisma.alternative.delete({
      where: { id },
    })
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    await prisma.alternative.deleteMany({
      where: { questionId },
    })
  }
}
