import { beforeEach, describe, expect, it } from 'vitest'
import { GetExamUseCase } from './get-exam'
import { InMemoryExamRepository } from '../../../test/repositories/in-memory-exam-repository'
import { Exam, Question, QuestionList } from '../../domain/entities'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let examRepository: InMemoryExamRepository
let sut: GetExamUseCase

describe('Get exam use case', () => {
  beforeEach(() => {
    examRepository = new InMemoryExamRepository()
    sut = new GetExamUseCase(examRepository)
  })

  it('should return an exam with its questions', async () => {
    const question = Question.create({
      statement: 'What is 2 + 2?',
      organization: 'FGV',
      subject: 'Matemática',
    })

    const exam = Exam.create({
      title: 'Exam 1',
      year: 2024,
      organization: 'FGV',
      institution: 'TJSP',
      level: 'Superior',
      questions: new QuestionList([question]),
      sourceUrl: 'https://example.com/exam',
    })

    await examRepository.create(exam)

    const result = await sut.execute({ id: exam.id.toString() })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.exam.id.equals(exam.id)).toBe(true)
      expect(result.value.exam.questions.getItems()).toHaveLength(1)
      expect(result.value.exam.questions.getItems()[0].statement).toBe('What is 2 + 2?')
    }
  })

  it('should return a resource not found error when exam does not exist', async () => {
    const result = await sut.execute({ id: 'non-existent-id' })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
