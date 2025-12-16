import { failure, success, type Either } from "../../core"
import type { Exam } from "../../domain/entities"
import type { IExamRepository } from "../../domain"
import { ResourceNotFoundError } from "../errors/resource-not-found-error"

interface GetExamUseCaseRequest {
  id: string
}

type GetExamUseCaseResponse = Either<ResourceNotFoundError, {
  exam: Exam
}>

export class GetExamUseCase {
  constructor(private readonly examRepository: IExamRepository) { }

  async execute({ id }: GetExamUseCaseRequest): Promise<GetExamUseCaseResponse> {
    const exam = await this.examRepository.findById(id)

    if (!exam) {
      return failure(new ResourceNotFoundError())
    }

    return success({ exam })
  }
}