import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeFetchQuestionsUseCase } from '../../factories/make-fetch-questions-use-case'
import { QuestionPresenter } from '../../presenters/question-presenter'

const fetchQuestionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  subject: z.string().trim().optional(),
  organization: z.string().trim().optional(),
})

export async function fetchQuestions(request: FastifyRequest, reply: FastifyReply) {
  const validationResult = fetchQuestionsQuerySchema.safeParse(request.query ?? {})

  if (!validationResult.success) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: validationResult.error.format() })
  }

  const { page, perPage, subject, organization } = validationResult.data

  const useCase = makeFetchQuestionsUseCase()
  const response = await useCase.execute({ page, perPage, subject, organization })

  if (response.isLeft()) {
    return reply.status(400).send({ message: 'Unable to fetch questions' })
  }

  const { questions } = response.value

  return reply.status(200).send({
    questions: questions.map(QuestionPresenter.toHTTP),
  })
}
