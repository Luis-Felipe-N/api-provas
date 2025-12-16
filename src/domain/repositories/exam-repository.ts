import { Exam } from '../entities/exam'

export interface IExamRepositoryFindManyParams {
  page?: number
  title?: string
  organization?: string
  institution?: string
  level?: string
  year?: number
}

export interface IExamRepository {
  create(exam: Exam): Promise<void>
  findById(id: string): Promise<Exam | null>
  findByOrganization(organization: string): Promise<Exam[]>
  findMany(params: IExamRepositoryFindManyParams): Promise<Exam[]>
  save(exam: Exam): Promise<void>
  delete(id: string): Promise<void>
}
