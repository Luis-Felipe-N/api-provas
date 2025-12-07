import fastify, { type FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchQuestions } from './fetch-questions'
import * as makeFetchQuestionsUseCaseFactory from '../../factories/make-fetch-questions-use-case'
import { FetchQuestionsUseCase } from '../../../../application/use-cases/fetch-questions'
import { InMemoryQuestionRepository } from '../../../../../test/repositories/in-memory-question-repository'
import { Question } from '../../../../domain/entities'

const inMemoryQuestionRepository = new InMemoryQuestionRepository()

describe('Fetch questions controller (e2e)', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    inMemoryQuestionRepository.items = []
    app = fastify()
    app.get('/questions', fetchQuestions)
    await app.ready()

    vi.spyOn(makeFetchQuestionsUseCaseFactory, 'makeFetchQuestionsUseCase').mockImplementation(() => {
      return new FetchQuestionsUseCase(inMemoryQuestionRepository)
    })
  })

  afterEach(async () => {
    await app.close()
    vi.restoreAllMocks()
  })

  it('should return a list of questions', async () => {
    const question = Question.create({
      statement: 'Who discovered Brazil?',
      organization: 'CESPE',
      subject: 'History',
    })

    await inMemoryQuestionRepository.create(question)

    const response = await app.inject({
      method: 'GET',
      url: '/questions?page=1&perPage=10',
    })

    expect(response.statusCode).toBe(200)

    const payload = response.json()

    expect(payload.questions).toHaveLength(1)
    expect(payload.questions[0].id).toBe(question.id.toString())
    expect(payload.questions[0].alternatives).toEqual([])
  })

  it('should return 400 when validation fails', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/questions?page=0',
    })

    expect(response.statusCode).toBe(400)
  })
})
