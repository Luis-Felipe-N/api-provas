import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import { FetchQuestionsUseCase } from './fetch-questions'
import type { IQuestionRepository } from '../../domain'
import { Question } from '../../domain/entities'

let questionRepository: IQuestionRepository
let sut: FetchQuestionsUseCase
let findManyMock: Mock

const defaultQuestion = Question.create({
  statement: 'What is 2 + 2?',
  organization: 'FGV',
  subject: 'Mathematics',
})

describe('Fetch questions use case', () => {
  beforeEach(() => {
    findManyMock = vi.fn().mockResolvedValue([])

    questionRepository = {
      create: vi.fn(),
      createMany: vi.fn(),
      findById: vi.fn(),
      findByExamId: vi.fn(),
      findBySubject: vi.fn(),
      findByOrganization: vi.fn(),
      findMany: findManyMock,
      save: vi.fn(),
      delete: vi.fn(),
    }

    sut = new FetchQuestionsUseCase(questionRepository)
  })

  it('should return questions resolved by the repository', async () => {
    findManyMock.mockResolvedValueOnce([defaultQuestion])

    const result = await sut.execute({ page: 1, perPage: 10 })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.questions).toHaveLength(1)
      expect(result.value.questions[0]).toEqual(defaultQuestion)
    }
  })

  it('should forward provided filters to the repository', async () => {
    const filters = {
      page: 2,
      perPage: 50,
      subject: 'Portuguese',
      organization: 'FGV',
    }

    await sut.execute(filters)

    expect(findManyMock).toHaveBeenCalledWith(filters)
  })

  it('should default page and perPage when params are not provided', async () => {
    await sut.execute()

    expect(findManyMock).toHaveBeenCalledWith({
      page: 1,
      perPage: 20,
      subject: undefined,
      organization: undefined,
    })
  })
})
