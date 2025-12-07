import { ScrapeExamsUseCase, ScraperSource } from '../src/application/use-cases/scrape-exams'
import { InMemoryExamRepository } from '../test/repositories/in-memory-exam-repository'
import { InMemoryQuestionRepository } from '../test/repositories/in-memory-question-repository'
import { InMemoryAlternativeRepository } from '../test/repositories/in-memory-alternative-repository'

async function main() {
  const useCase = new ScrapeExamsUseCase(
    new InMemoryExamRepository(),
    new InMemoryQuestionRepository(),
    new InMemoryAlternativeRepository()
  )

  const result = await useCase.execute({
    source: ScraperSource.PCICONCURSOS,
    urls: ['https://www.pciconcursos.com.br/provas/fgv'],
  })

  if (result.isLeft()) {
    console.error(result.value)
    return
  }

  for (const exam of result.value.exams.slice(0, 3)) {
    const questions = exam.questions.getItems()
    const validQuestions = questions.filter(question => question.isValid)
    const coverage = questions.length > 0
      ? ((validQuestions.length / questions.length) * 100).toFixed(1)
      : '0.0'

    console.log(`Exam: ${exam.title}`)
    console.log(`  Questions: ${questions.length}`)
    console.log(`  Questions with answer key: ${validQuestions.length} (${coverage}%)`)

    const invalid = questions.filter(question => !question.isValid)
    if (invalid.length) {
      console.warn(`  ⚠️  ${invalid.length} questions missing a correct alternative`)
    }
  }

  const firstExam = result.value.exams[0]
  if (firstExam) {
    console.log('\nFirst exam PDF URL:', firstExam.originalPdfUrl ?? 'N/A')
    console.log('First exam answer key URL:', firstExam.answerKeyUrl ?? 'N/A')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
