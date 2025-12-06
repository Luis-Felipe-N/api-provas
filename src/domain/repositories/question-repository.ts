import { Question } from '../entities/question'

export interface IQuestionRepository {
  create(question: Question): Promise<void>
  findById(id: string): Promise<Question | null>
  findByExamId(examId: string): Promise<Question[]>
  findBySubject(subject: string): Promise<Question[]>
  findByOrganization(organization: string): Promise<Question[]>
  findMany(params: { page: number; perPage: number }): Promise<Question[]>
  save(question: Question): Promise<void>
  delete(id: string): Promise<void>
}
