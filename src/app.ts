import { ZodError } from 'zod'
import { env } from './infra/env'

import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
})

app.register(cors, {
  origin: '*',
  // credentials: true
})

app.setErrorHandler((error, _, reply) => {
  try {
    return reply
      .status(error.statusCode || 500)
      .send({ message: error.message })
  } catch (error) { }
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation Error', issues: error.format() })
  }

  if (env.NODE_ENV !== 'prod') {
    console.error(error)
  } else {
    // Mandar o error para algum serviço de tratamento
  }

  return reply.status(500).send({ message: 'Internal server error' })
})