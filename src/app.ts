import { ZodError } from 'zod'
import { env } from './infra/env'

import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { scraperRoutes } from './infra/http/controllers/scraper/routes'
import { examsRoutes } from './infra/http/controllers/exams/routes'
import { questionsRoutes } from './infra/http/controllers/questions/routes'
console.log('ENV', env.NODE_ENV)
export const app = fastify()

app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
})

app.register(cors, {
  origin: '*',
  // credentials: true
})

app.register(scraperRoutes)
app.register(examsRoutes)
app.register(questionsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: error.format() })
  }

  try {
    const err = error as any
    return reply
      .status(err.statusCode || 500)
      .send({ message: err.message })
  } catch (err) { }

  if (env.NODE_ENV !== 'prod') {
    console.error(error)
  } else {
    // Mandar o error para algum serviço de tratamento
  }

  return reply.status(500).send({ message: 'Internal server error' })
})