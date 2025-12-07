import type { Question, IQuestionRepository, IQuestionRepositoryFindManyParams } from '../../src/domain'

export class InMemoryQuestionRepository implements IQuestionRepository {
  public items: Question[] = []

  async create(question: Question): Promise<void> {
    this.items.push(question)
  }

  async createMany(questions: Question[], examId: string): Promise<void> {
    questions.forEach(question => {
      this.items.push(question)
    })
    return Promise.resolve()
  }

  async findById(id: string): Promise<Question | null> {
    const question = this.items.find(item => item.id.toString() === id)
    return question ?? null
  }

  async findByExamId(_examId: string): Promise<Question[]> {
    return []
  }

  async findBySubject(subject: string): Promise<Question[]> {
    return this.items.filter(item => item.subject === subject)
  }

  async findByOrganization(organization: string): Promise<Question[]> {
    return this.items.filter(item => item.organization === organization)
  }

  async findMany(params: IQuestionRepositoryFindManyParams = {}): Promise<Question[]> {
    const {
      page = 1,
      perPage = 20,
      subject,
      organization,
    } = params

    const filtered = this.items.filter(item => {
      if (subject && !item.subject.toLowerCase().includes(subject.toLowerCase())) {
        return false
      }

      if (organization && !item.organization.toLowerCase().includes(organization.toLowerCase())) {
        return false
      }

      return true
    })

    const start = (page - 1) * perPage
    const end = start + perPage
    return filtered.slice(start, end)
  }

  async save(question: Question): Promise<void> {
    const index = this.items.findIndex(item => item.id.equals(question.id))
    if (index >= 0) {
      this.items[index] = question
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex(item => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}
