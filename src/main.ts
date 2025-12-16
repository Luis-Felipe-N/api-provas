
import { PciConcursosScraper } from './infra/scrapers'
import { PrismaAlternativeRepository, PrismaExamRepository, PrismaQuestionRepository } from './infra/database/repositories'
import { prisma } from './infra/database/prisma'
import { ScrapeExamsUseCase } from './application/use-cases/scrape-exams'

interface ExamSource {
  name: string
  baseUrl: string
}

const EXAM_SOURCES: ExamSource[] = [
  {
    name: 'PCI Concursos : FGV',
    baseUrl: 'https://www.pciconcursos.com.br/provas/fgv',
  },
]

async function main(): Promise<void> {
  const scraper = new PciConcursosScraper()
  const alternativeRepository = new PrismaAlternativeRepository()
  const questionRepository = new PrismaQuestionRepository(alternativeRepository)
  const examRepository = new PrismaExamRepository(questionRepository)
  const scrapeExamsUseCase = new ScrapeExamsUseCase(
    examRepository,
    questionRepository,
    alternativeRepository,
  )

  for (const source of EXAM_SOURCES) {
    console.log(`\n🚀 Starting scrape from: ${source.name}`)

    const result = await scrapeExamsUseCase.execute({
      sourceUrl: source.baseUrl,
      sourceName: source.name,
      maxExams: 10, // Limite para teste
    })

    console.log(`\n📊 Results from ${result.sourceName}:`)
    console.log(`Total scraped: ${result.totalScraped}`)
    console.log(`✅ Exams saved to database!`)

    for (const exam of result.exams.slice(0, 3)) {
      console.log(`\n📝 ${exam.title} (${exam.year}) - ${exam.organization}`)
      console.log(`   Institution: ${exam.institution}`)
      console.log(`   Level: ${exam.level}`)
      console.log(`   Exam URL: ${exam.examPdfUrl}`)
      console.log(`   Answer Key: ${exam.answerKeyUrl}`)
    }
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
