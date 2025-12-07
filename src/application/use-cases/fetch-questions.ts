import { type Either, success } from '../../core'
import { Question } from '../../domain/entities'
import { IQuestionRepository } from '../../domain/repositories'

interface FetchQuestionsUseCaseRequest {
  page?: number
  perPage?: number
  subject?: string
  organization?: string
}

type FetchQuestionsUseCaseResponse = Either<null, {
  questions: Question[]
}>

export class FetchQuestionsUseCase {
  constructor(private readonly questionRepository: IQuestionRepository) { }

  async execute({
    page = 1,
    perPage = 20,
    subject,
    organization,
  }: FetchQuestionsUseCaseRequest = {}): Promise<FetchQuestionsUseCaseResponse> {
    const questions = await this.questionRepository.findMany({
      page,
      perPage,
      subject,
      organization,
    })

    return success({ questions })
  }
}
