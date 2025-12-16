import { type Either, success } from '../../core'
import { Exam } from '../../domain/entities'
import { IExamRepository } from '../../domain/repositories'

interface FetchExamsUseCaseRequest {
  page?: number
  title?: string
  organization?: string
  institution?: string
  level?: string
  year?: number
}

type FetchExamsUseCaseResponse = Either<null, {
  exams: Exam[]
}>

export class FetchExamsUseCase {
  constructor(private readonly examRepository: IExamRepository) { }

  async execute({
    page = 1,
    title,
    organization,
    institution,
    level,
    year,
  }: FetchExamsUseCaseRequest = {}): Promise<FetchExamsUseCaseResponse> {

    const exams = await this.examRepository.findMany({
      page,
      title,
      organization,
      institution,
      level,
      year,
    })

    return success({ exams })
  }
}