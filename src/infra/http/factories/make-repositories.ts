import { PrismaAlternativeRepository, PrismaExamRepository, PrismaQuestionRepository } from '../../database'

export function makeQuestionRepository() {
  const alternativeRepository = new PrismaAlternativeRepository()
  return new PrismaQuestionRepository(alternativeRepository)
}

export function makeExamRepository() {
  return new PrismaExamRepository(makeQuestionRepository())
}
