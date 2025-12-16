
import { ScrapeExamsUseCase } from "../../../application/use-cases/scrape-exams"
import { ExamProcessorService } from "../../../domain/services/exam-processor-service"
import { PrismaAlternativeRepository, PrismaExamRepository, PrismaQuestionRepository } from "../../database"

export function makeExamScraperUseCase() {
  const alternativeRepository = new PrismaAlternativeRepository()
  const questionRepository = new PrismaQuestionRepository(alternativeRepository)
  const examRepository = new PrismaExamRepository(questionRepository)
  const examProcessorService = new ExamProcessorService()
  return new ScrapeExamsUseCase(examRepository, examProcessorService)
}