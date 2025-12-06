import { UniqueEntityId } from '@/core/entities'
import { ISimulationRepository } from '@/domain/repositories'
import { ResourceNotFoundError } from '@/domain/errors'
import { SubmitAnswerInput, SubmitAnswerOutput } from '../dtos/submit-answer-dto'

export class SubmitAnswerUseCase {
  constructor(private simulationRepository: ISimulationRepository) { }

  async execute(input: SubmitAnswerInput): Promise<SubmitAnswerOutput> {
    const simulation = await this.simulationRepository.findById(input.simulationId)

    if (!simulation) {
      throw new ResourceNotFoundError('Simulation')
    }

    if (simulation.isFinished) {
      throw new Error('Simulation is already finished')
    }

    const question = simulation.questions
      .getItems()
      .find(q => q.questionId.toString() === input.questionId)

    if (!question) {
      throw new ResourceNotFoundError('Question in simulation')
    }

    const isCorrect = question.correctAlternativeId.toString() === input.alternativeId

    simulation.answers.add({
      questionId: new UniqueEntityId(input.questionId),
      alternativeId: new UniqueEntityId(input.alternativeId),
    })

    await this.simulationRepository.save(simulation)

    return {
      isCorrect,
      currentScore: simulation.score,
      totalAnswered: simulation.answers.getItems().length,
    }
  }
}
