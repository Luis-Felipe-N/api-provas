import { PdfExtractor } from '../src/infra/scrapers/pdf-extractor'

const DEFAULT_PDF = 'https://www.pciconcursos.com.br/provas/28691568/8e264dfb3fd4/2_tenente_bombeiro_militar.pdf'
const DEFAULT_ANSWER_KEY = 'https://www.pciconcursos.com.br/provas/28691568/7d020d29869d/gabarito_definitivo.pdf'

async function analyzePdf(url: string, label: string) {
  const extractor = new PdfExtractor()
  const content = await extractor.extractFromUrl(url)
  const questions = extractor.extractQuestions(content.text)
  const answerKeys = extractor.extractAnswerKeys(content.text)

  console.log(`\n=== ${label} ===`)
  console.log(`URL: ${url}`)
  console.log(`Pages: ${content.numPages}`)
  console.log(`Questions detected: ${questions.length}`)
  console.log(`Answer key candidates: ${answerKeys.length}`)

  answerKeys.slice(0, 3).forEach((key, index) => {
    console.log(`  [${index}] ${key.examName} (tipo ${key.tipo}) -> ${Object.keys(key.answers).length} respostas`)
  })

  const bestKey = answerKeys[0]?.answers ?? {}
  const matched = questions.filter(question => bestKey[question.number]).length
  const coverage = questions.length ? ((matched / questions.length) * 100).toFixed(1) : '0.0'

  console.log(`Coverage using best key: ${matched}/${questions.length} (${coverage}%)`)
  const missing = questions.filter(question => !bestKey[question.number]).map(q => q.number)
  console.log('Missing question numbers:', missing.slice(0, 50).join(', ') || 'Nenhum')
}

async function main() {
  const examPdf = process.env.PDF_URL ?? DEFAULT_PDF
  const answerKeyPdf = process.env.ANSWER_PDF_URL ?? DEFAULT_ANSWER_KEY

  await analyzePdf(examPdf, 'Exam PDF')
  await analyzePdf(answerKeyPdf, 'Answer Key PDF')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
