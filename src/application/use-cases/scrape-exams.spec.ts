
import { ScrapeExamsUseCase, ScraperSource } from './scrape-exams'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryExamRepository } from '../../../test/repositories/in-memory-exam-repository'
import { InMemoryQuestionRepository } from '../../../test/repositories/in-memory-question-repository'
import { InMemoryAlternativeRepository } from '../../../test/repositories/in-memory-alternative-repository'

vi.mock('../../infra', () => {
  return {
    PciConcursosScraper: vi.fn().mockImplementation(() => ({
      scrapeAll: vi.fn().mockImplementation(async function* () {
        yield {
          name: 'Prova Teste 2025',
          year: '2025',
          organization: 'Vunesp',
          institution: 'TJSP',
          level: 'Superior',
          pageUrl: 'http://url.com',
          download: { examUrl: 'https://arq.pciconcursos.com.br/provas/29659023/afb87e96ff5e/escriturario_agente_de_tecnologia.pdf', answerKeyUrl: 'https://arq.pciconcursos.com.br/provas/29659023/15b400c9130a/gabarito.pdf' },
        }
      }),
      enrichExam: vi.fn().mockImplementation(async exam => exam),
    })),
  }
})

let inMemoryExamRepository: InMemoryExamRepository
let inMemoryQuestionRepository: InMemoryQuestionRepository
let inMemoryAlternativeRepository: InMemoryAlternativeRepository
let sut: ScrapeExamsUseCase

describe('Scrape Exams Use Case', () => {
  beforeEach(() => {
    inMemoryExamRepository = new InMemoryExamRepository()
    inMemoryQuestionRepository = new InMemoryQuestionRepository()
    inMemoryAlternativeRepository = new InMemoryAlternativeRepository()

    sut = new ScrapeExamsUseCase(
      inMemoryExamRepository,
      inMemoryQuestionRepository,
      inMemoryAlternativeRepository
    )
  })

  it('should be able to scrape and save exams', async () => {
    const result = await sut.execute({
      source: ScraperSource.PCICONCURSOS,
      urls: ['https://www.pciconcursos.com.br/provas/vunesp'],
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.exams).toHaveLength(1)
      expect(result.value.exams[0].title).toBe('Prova Teste 2025')

      expect(inMemoryExamRepository.items).toHaveLength(1)
      expect(inMemoryExamRepository.items[0].organization).toBe('Vunesp')
    }
  })
}, {
  timeout: 30000
})