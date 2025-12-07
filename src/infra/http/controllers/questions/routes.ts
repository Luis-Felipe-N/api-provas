import type { FastifyInstance } from 'fastify'
import { fetchQuestions } from './fetch-questions'

export async function questionsRoutes(app: FastifyInstance) {
  app.get('/questions', fetchQuestions)
}
