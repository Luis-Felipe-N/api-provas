import { Exam } from '../entities/exam'

export interface IExamRepository {
  create(exam: Exam): Promise<void>
  findById(id: string): Promise<Exam | null>
  findByOrganization(organization: string): Promise<Exam[]>
  findMany(params: { page: number; perPage: number }): Promise<Exam[]>
  save(exam: Exam): Promise<void>
  delete(id: string): Promise<void>
}
