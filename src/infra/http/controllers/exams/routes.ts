import type { FastifyInstance } from 'fastify'
import { fetchExams } from './fetch-exams'
import { getExam } from './get-exam'

export async function examsRoutes(app: FastifyInstance) {
  app.get('/exams', fetchExams)
  app.get('/exams/:id', getExam)
}
