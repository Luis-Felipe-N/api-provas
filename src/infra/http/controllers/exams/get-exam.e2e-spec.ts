import fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getExam } from './get-exam'
import * as makeGetExamUseCaseFactory from '../../factories/make-get-exam-use-case'
import { GetExamUseCase } from '../../../../application/use-cases/get-exam'
import { InMemoryExamRepository } from '../../../../../test/repositories/in-memory-exam-repository'
import { Exam, Question, QuestionList, Alternative, AlternativeList } from '../../../../domain/entities'
import { UniqueEntityId } from '../../../../core/entities'

const inMemoryExamRepository = new InMemoryExamRepository()

describe('Get exam controller (e2e)', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    inMemoryExamRepository.items = []
    app = fastify()
    app.get('/exams/:id', getExam)
    await app.ready()

    vi.spyOn(makeGetExamUseCaseFactory, 'makeGetExamUseCase').mockImplementation(() => {
      return new GetExamUseCase(inMemoryExamRepository)
    })
  })

  afterEach(async () => {
    await app.close()
    vi.restoreAllMocks()
  })

  it('should return an exam with its nested questions and alternatives', async () => {
    const questionId = new UniqueEntityId()
    const alternatives = new AlternativeList([
      Alternative.create({ questionId, text: '4', isCorrect: true }),
      Alternative.create({ questionId, text: '5', isCorrect: false }),
    ])

    const question = Question.create({
      statement: 'What is 2 + 2?',
      organization: 'FGV',
      subject: 'Mathematics',
      alternatives,
    }, questionId)

    const exam = Exam.create({
      title: 'Math Exam',
      year: 2024,
      organization: 'FGV',
      institution: 'TJSP',
      level: 'Superior',
      questions: new QuestionList([question]),
      sourceUrl: 'https://example.com/exams/math',
    })

    await inMemoryExamRepository.create(exam)

    const response = await app.inject({
      method: 'GET',
      url: `/exams/${exam.id.toString()}`,
    })

    expect(response.statusCode).toBe(200)

    const payload = response.json()

    expect(payload.exam.id).toBe(exam.id.toString())
    expect(payload.exam.questions).toHaveLength(1)
    expect(payload.exam.questions[0].alternatives).toHaveLength(2)
    expect(payload.exam.questions[0].alternatives[0].isCorrect).toBe(true)
  })

  it('should return 404 when exam is not found', async () => {
    const missingExamId = new UniqueEntityId().toString()

    const response = await app.inject({
      method: 'GET',
      url: `/exams/${missingExamId}`,
    })

    expect(response.statusCode).toBe(404)
  })
})
