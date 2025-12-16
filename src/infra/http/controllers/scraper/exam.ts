import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeExamScraperUseCase } from "../../factories/make-exam-scraper-use-case";
import { ScraperSource } from "../../../../application/use-cases/scrape-exams";

export async function examScraper(request: FastifyRequest, reply: FastifyReply) {

  // if (!request.user || !request.user.sub) {
  //   return reply.status(401).send({ message: 'Unauthorized.' })
  // }

  const examScraperBodySchema = z.object({
    source: z.nativeEnum(ScraperSource),
    urls: z.array(z.url()).min(1),
  })


  const validationResult = examScraperBodySchema.safeParse(request.body)

  if (!validationResult.success) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: validationResult.error.format() })
  }

  const { source, urls } = validationResult.data

  const usecase = makeExamScraperUseCase()

  const result = await usecase.execute({ source, urls })

  if (result.isLeft()) {
    const error = result.value
    return reply.status(400).send({ message: error.message })
  }

  // Envie o resultado de volta
  return reply.status(200).send(result.value)
}