import type { FastifyReply, FastifyRequest } from "fastify";
import { url } from "inspector";
import z from "zod";

export function examScraper(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user || !request.user.sub) {
    return reply.status(401).send({ message: 'Unauthorized.' })
  }

  const examScraperBodySchema = z.object({
    from: z.string().min(1),
    urls: z.array(z.url()).min(1),
  })

  const validationResult = examScraperBodySchema.safeParse(request.body)

  if (!validationResult.success) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: validationResult.error.format() })
  }

  const { from, urls } = validationResult.data
}