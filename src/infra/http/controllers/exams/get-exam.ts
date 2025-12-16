import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { ExamWithQuestionsPresenter } from '../../presenters/exam-with-questions-presenter'
import { makeGetExamUseCase } from '../../factories/make-get-exam-use-case'

const getExamParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function getExam(request: FastifyRequest, reply: FastifyReply) {
  const validationResult = getExamParamsSchema.safeParse(request.params ?? {})

  if (!validationResult.success) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: validationResult.error.format() })
  }

  const { id } = validationResult.data

  const useCase = makeGetExamUseCase()
  const response = await useCase.execute({ id })

  if (response.isLeft()) {
    return reply.status(404).send({ message: response.value.message })
  }

  return reply.status(200).send({ exam: ExamWithQuestionsPresenter.toHTTP(response.value.exam) })
}
