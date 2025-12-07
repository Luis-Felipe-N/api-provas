import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { FetchExamsUseCase } from './fetch-exams'
import type { IExamRepository } from '../../domain'
import { QuestionList } from '../../domain/entities'
import { makeExam } from '../factories/make-exam'

let examRepository: IExamRepository
let sut: FetchExamsUseCase
let findManyMock: Mock

const exam = {
  organization: 'FGV',
  year: 2024,
  institution: 'TJSP',
  level: 'Superior',
  questions: new QuestionList(),
  sourceUrl: `https://example.com/exam1`,
  createdAt: new Date(),
}

describe('Fetch exams use case', () => {
  beforeEach(() => {
    findManyMock = vi.fn().mockResolvedValue([])

    examRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOrganization: vi.fn(),
      findMany: findManyMock,
      save: vi.fn(),
      delete: vi.fn(),
    }

    sut = new FetchExamsUseCase(examRepository)
  })

  it('should return exams resolved by the repository', async () => {
    const expectedExams = [
      makeExam({ ...exam, title: 'Exam 1' }),
      makeExam({ ...exam, title: 'Exam 2' }),
    ]

    findManyMock.mockResolvedValueOnce(expectedExams)

    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.exams).toEqual(expectedExams)
    }
  })

  it('should forward provided filters to the repository', async () => {
    const filters = {
      page: 2,
      title: 'FGV',
      organization: 'FGV',
      institution: 'TJSP',
      level: 'Superior',
      year: 2024,
    }

    await sut.execute(filters)

    expect(findManyMock).toHaveBeenCalledWith(filters)
  })

  it('should default to the first page when no params are provided', async () => {
    await sut.execute()

    expect(findManyMock).toHaveBeenCalledWith({
      page: 1,
      title: undefined,
      organization: undefined,
      institution: undefined,
      level: undefined,
      year: undefined,
    })
  })
})
