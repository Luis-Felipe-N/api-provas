import type { Alternative, IAlternativeRepository } from '../../src/domain'

export class InMemoryAlternativeRepository implements IAlternativeRepository {
  public items: Alternative[] = []

  async create(alternative: Alternative): Promise<void> {
    this.items.push(alternative)
  }

  async createMany(alternatives: Alternative[]): Promise<void> {
    this.items.push(...alternatives)
  }

  async findById(id: string): Promise<Alternative | null> {
    const alternative = this.items.find(item => item.id.toString() === id)
    return alternative ?? null
  }

  async findByQuestionId(questionId: string): Promise<Alternative[]> {
    return this.items.filter(item => item.questionId.toString() === questionId)
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex(item => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    this.items = this.items.filter(item => item.questionId.toString() !== questionId)
  }
}
