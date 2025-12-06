import { prisma } from '../prisma'
import { Simulation } from '@/domain/entities'
import { ISimulationRepository } from '@/domain/repositories'
import { PrismaSimulationMapper } from './mappers/prisma-simulation-mapper'

export class PrismaSimulationRepository implements ISimulationRepository {
  async create(simulation: Simulation): Promise<void> {
    const data = PrismaSimulationMapper.toPrisma(simulation)
    await prisma.simulation.create({ data })
  }

  async findById(id: string): Promise<Simulation | null> {
    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: { answers: true },
    })

    if (!simulation) return null

    return PrismaSimulationMapper.toDomain(simulation)
  }

  async findByStudentId(studentId: string): Promise<Simulation[]> {
    const simulations = await prisma.simulation.findMany({
      where: { studentId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    })

    return simulations.map(PrismaSimulationMapper.toDomain)
  }

  async findMany(params: { page: number; perPage: number }): Promise<Simulation[]> {
    const simulations = await prisma.simulation.findMany({
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    })

    return simulations.map(PrismaSimulationMapper.toDomain)
  }

  async save(simulation: Simulation): Promise<void> {
    const data = PrismaSimulationMapper.toPrisma(simulation)

    await prisma.simulation.update({
      where: { id: simulation.id.toString() },
      data: {
        title: data.title,
        finishedAt: data.finishedAt,
      },
    })

    // Update answers
    const answers = simulation.answers.getNewItems()
    if (answers.length > 0) {
      await prisma.simulationAnswer.createMany({
        data: answers.map(answer => ({
          simulationId: simulation.id.toString(),
          questionId: answer.questionId.toString(),
          alternativeId: answer.alternativeId.toString(),
        })),
      })
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.simulation.delete({
      where: { id },
    })
  }
}
