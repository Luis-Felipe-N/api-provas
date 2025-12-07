import { Question } from '../entities/question'

export interface IQuestionRepositoryFindManyParams {
  page?: number
  perPage?: number
  subject?: string
  organization?: string
}

export interface IQuestionRepository {
  create(question: Question): Promise<void>
  createMany(questions: Question[], examId: string): Promise<void>
  findById(id: string): Promise<Question | null>
  findByExamId(examId: string): Promise<Question[]>
  findBySubject(subject: string): Promise<Question[]>
  findByOrganization(organization: string): Promise<Question[]>
  findMany(params: IQuestionRepositoryFindManyParams): Promise<Question[]>
  save(question: Question): Promise<void>
  delete(id: string): Promise<void>
}
