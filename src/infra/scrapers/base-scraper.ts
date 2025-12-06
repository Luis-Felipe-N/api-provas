import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import pLimit from 'p-limit'
import { scraperSettings } from '../config/scraper-settings'
import { ScrapedExam, IExamScraper } from './exam-scraper.interface'

export abstract class BaseScraper implements IExamScraper {
  protected client: AxiosInstance
  protected limit: ReturnType<typeof pLimit>

  constructor(
    timeout: number = scraperSettings.timeout,
    userAgent: string = scraperSettings.userAgent,
    maxConcurrent: number = scraperSettings.maxConcurrentRequests
  ) {
    this.client = axios.create({
      timeout,
      headers: {
        'User-Agent': userAgent,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    axiosRetry(this.client, {
      retries: scraperSettings.retryAttempts,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: error => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.code === 'ECONNABORTED'
        )
      },
      onRetry: (retryCount, _error, requestConfig) => {
        console.log(`Retry ${retryCount} for ${requestConfig.url}`)
      },
    })

    this.limit = pLimit(maxConcurrent)
  }

  protected async fetch(url: string): Promise<string> {
    return this.limit(async () => {
      const response = await this.client.get<string>(url)
      return response.data
    })
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  abstract parseExamList(html: string): ScrapedExam[]

  abstract parseDownloadPage(
    html: string
  ): { examUrl: string | null; answerKeyUrl: string | null }

  abstract scrapeAll(baseUrl: string): AsyncGenerator<ScrapedExam, void, unknown>

  async enrichExam(exam: ScrapedExam): Promise<ScrapedExam> {
    try {
      const html = await this.fetch(exam.pageUrl)
      const { examUrl, answerKeyUrl } = this.parseDownloadPage(html)
      exam.download.examUrl = examUrl
      exam.download.answerKeyUrl = answerKeyUrl
    } catch (error) {
      console.error(`Failed to enrich exam ${exam.name}:`, error)
    }
    return exam
  }
}
