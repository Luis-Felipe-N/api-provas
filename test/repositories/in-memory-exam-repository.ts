import type { Exam, IExamRepository } from "../../src/domain"
import type { IExamRepositoryFindManyParams } from "../../src/domain/repositories/exam-repository"

export class InMemoryExamRepository implements IExamRepository {
  public items: Exam[] = []

  async create(exam: Exam): Promise<void> {
    this.items.push(exam)
  }

  async findById(id: string): Promise<Exam | null> {
    const exam = this.items.find(item => item.id.toString() === id)
    return exam ?? null
  }

  async findByOrganization(organization: string): Promise<Exam[]> {
    return this.items.filter(item => item.organization === organization)
  }

  async findMany(params: IExamRepositoryFindManyParams): Promise<Exam[]> {
    const PER_PAGE = 20
    const {
      page = 1,
      title,
      organization,
      institution,
      level,
      year,
    } = params

    const withFilters = this.items.filter((exam) => {
      const matchesTitle = title
        ? exam.title.toLowerCase().includes(title.toLowerCase())
        : true
      const matchesOrganization = organization
        ? exam.organization.toLowerCase().includes(organization.toLowerCase())
        : true
      const matchesInstitution = institution
        ? exam.institution.toLowerCase().includes(institution.toLowerCase())
        : true
      const matchesLevel = level
        ? exam.level.toLowerCase() === level.toLowerCase()
        : true
      const matchesYear = typeof year === 'number'
        ? exam.year === year
        : true

      return matchesTitle && matchesOrganization && matchesInstitution && matchesLevel && matchesYear
    })

    const start = (page - 1) * PER_PAGE
    const end = start + PER_PAGE

    return withFilters.slice(start, end)
  }

  async save(exam: Exam): Promise<void> {
    const index = this.items.findIndex(item => item.id.equals(exam.id))
    if (index >= 0) {
      this.items[index] = exam
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex(item => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}