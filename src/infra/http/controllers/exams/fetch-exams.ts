import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { ExamPresenter } from '../../presenters/exam-presenter'
import { makeFetchExamsUseCase } from '../../factories/make-fetch-exams-use-case'

const fetchExamsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  title: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  institution: z.string().trim().optional(),
  level: z.string().trim().optional(),
  year: z.coerce.number().int().optional(),
})

export async function fetchExams(request: FastifyRequest, reply: FastifyReply) {
  const validationResult = fetchExamsQuerySchema.safeParse(request.query ?? {})

  if (!validationResult.success) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: validationResult.error.format() })
  }

  const { page, title, organization, institution, level, year } = validationResult.data

  const useCase = makeFetchExamsUseCase()

  const response = await useCase.execute({
    page,
    title,
    organization,
    institution,
    level,
    year
  })

  if (response.isLeft()) {
    return reply.status(400).send({ message: "Unable to fetch exams" })
  }

  const { exams } = response.value

  return reply.status(200).send({
    exams: exams.map(ExamPresenter.toHTTP),
  })
}