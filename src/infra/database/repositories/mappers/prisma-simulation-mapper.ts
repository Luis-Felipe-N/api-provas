import { Simulation as PrismaSimulation, SimulationAnswer as PrismaSimulationAnswer } from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities'
import { Simulation, SimulationAnswerList, SimulationQuestionList } from '../../../../domain/entities'

type PrismaSimulationWithAnswers = PrismaSimulation & {
  answers: PrismaSimulationAnswer[]
}

export class PrismaSimulationMapper {
  static toDomain(raw: PrismaSimulationWithAnswers): Simulation {
    const answers = raw.answers.map(answer => ({
      questionId: new UniqueEntityId(answer.questionId),
      alternativeId: new UniqueEntityId(answer.alternativeId),
    }))

    return Simulation.create(
      {
        studentId: new UniqueEntityId(raw.studentId),
        title: raw.title,
        questions: new SimulationQuestionList(), // Questions need to be loaded separately
        answers: new SimulationAnswerList(answers),
        createdAt: raw.createdAt,
        finishedAt: raw.finishedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(simulation: Simulation) {
    return {
      id: simulation.id.toString(),
      studentId: simulation.studentId.toString(),
      title: simulation.title,
      finishedAt: simulation.finishedAt ?? null,
    }
  }
}
