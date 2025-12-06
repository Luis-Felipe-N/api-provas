import { UniqueEntityId } from '@/core/entities'
import { Simulation, SimulationQuestionList, SimulationQuestionItem } from '@/domain/entities'
import { ISimulationRepository, IQuestionRepository } from '@/domain/repositories'
import { ResourceNotFoundError } from '@/domain/errors'
import { CreateSimulationInput, CreateSimulationOutput } from '../dtos/create-simulation-dto'

export class CreateSimulationUseCase {
  constructor(
    private simulationRepository: ISimulationRepository,
    private questionRepository: IQuestionRepository,
  ) { }

  async execute(input: CreateSimulationInput): Promise<CreateSimulationOutput> {
    const questions: SimulationQuestionItem[] = []

    for (const questionId of input.questionIds) {
      const question = await this.questionRepository.findById(questionId)

      if (!question) {
        throw new ResourceNotFoundError(`Question ${questionId}`)
      }

      const correctAlternative = question.alternatives
        .getItems()
        .find(alt => alt.isCorrect)

      if (!correctAlternative) {
        throw new ResourceNotFoundError(`Correct alternative for question ${questionId}`)
      }

      questions.push({
        questionId: new UniqueEntityId(questionId),
        correctAlternativeId: correctAlternative.id,
      })
    }

    const questionList = new SimulationQuestionList(questions)

    const simulation = Simulation.create({
      studentId: new UniqueEntityId(input.studentId),
      title: input.title,
      questions: questionList,
    })

    await this.simulationRepository.create(simulation)

    return {
      simulationId: simulation.id.toString(),
    }
  }
}
