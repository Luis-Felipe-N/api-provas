import { Alternative } from '../entities/alternative'

export interface IAlternativeRepository {
  create(alternative: Alternative): Promise<void>
  createMany(alternatives: Alternative[]): Promise<void>
  findById(id: string): Promise<Alternative | null>
  findByQuestionId(questionId: string): Promise<Alternative[]>
  delete(id: string): Promise<void>
  deleteManyByQuestionId(questionId: string): Promise<void>
}
