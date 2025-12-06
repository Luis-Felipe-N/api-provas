import * as cheerio from 'cheerio'
import { scraperSettings } from '../config/scraper-settings'
import { ScrapedExam } from './exam-scraper.interface'
import { BaseScraper } from './base-scraper'

export class PciConcursosScraper extends BaseScraper {
  parseExamList(html: string): ScrapedExam[] {
    const $ = cheerio.load(html)
    const exams: ScrapedExam[] = []

    $('tr.lk_link[data-url]').each((_, row) => {
      try {
        const $row = $(row)
        const cols = $row.find('td')

        if (cols.length < 5) {
          return
        }

        const nameLink = $row.find('a.prova_download')
        const name = nameLink.text().trim()
        const pageUrl = $row.attr('data-url') || ''

        exams.push({
          pageUrl,
          name,
          year: $(cols[1]).text().trim(),
          organization: $(cols[2]).text().trim(),
          institution: $(cols[3]).text().trim(),
          level: $(cols[4]).text().trim(),
          download: {
            examUrl: null,
            answerKeyUrl: null,
          },
        })
      } catch (error) {
        console.error('Failed to parse row:', error)
      }
    })

    return exams
  }

  parseDownloadPage(
    html: string
  ): { examUrl: string | null; answerKeyUrl: string | null } {
    const $ = cheerio.load(html)
    let examUrl: string | null = null
    let answerKeyUrl: string | null = null

    $('a[href$=".pdf"]').each((_, link) => {
      const href = $(link).attr('href') || ''

      if (href.toLowerCase().includes('gabarito')) {
        if (!answerKeyUrl) {
          answerKeyUrl = href
        }
      } else if (!examUrl) {
        examUrl = href
      }
    })

    return { examUrl, answerKeyUrl }
  }

  async *scrapeAll(baseUrl: string): AsyncGenerator<ScrapedExam, void, unknown> {
    let page = 1

    while (true) {
      const url = page === 1 ? baseUrl : `${baseUrl}/${page}`
      console.log(`Fetching page ${page}: ${url}`)

      try {
        const html = await this.fetch(url)
        const exams = this.parseExamList(html)

        if (exams.length === 0) {
          console.log(`No more exams found at page ${page}`)
          break
        }

        for (const exam of exams) {
          yield exam
        }

        page++
        await this.delay(scraperSettings.delayBetweenRequests)
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error)
        break
      }
    }
  }
}
