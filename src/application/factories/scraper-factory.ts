import { IExamScraper } from '../../infra/scrapers/exam-scraper.interface'
import { PciConcursosScraper } from '../../infra/scrapers/pci-concursos-scraper'

export class ScraperFactory {
  static create(source: string): IExamScraper {
    const scrapers: Record<string, IExamScraper> = {
      'PCICONCURSOS': new PciConcursosScraper(),
    }

    const scraper = scrapers[source.toUpperCase()]
    if (!scraper) throw new Error(`Scraper ${source} not implemented`)

    return scraper
  }
}
