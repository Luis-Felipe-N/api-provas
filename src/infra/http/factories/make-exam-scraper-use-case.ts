import { ScrapeExamsUseCase } from '@/application/use-cases'
import { PrismaExamRepository, PrismaQuestionRepository, PrismaAlternativeRepository } from '@/infra/database'
import { PciConcursosScraper } from '@/infra/scrapers'

export function makeExamScraperUseCase() {
  const examRepository = new PrismaExamRepository()
  const questionRepository = new PrismaQuestionRepository()
  const alternativeRepository = new PrismaAlternativeRepository()
  const scraper = new PciConcursosScraper()
  return new ScrapeExamsUseCase(scraper, examRepository, questionRepository, alternativeRepository)
}