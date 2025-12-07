import type { FastifyInstance } from "fastify";
import { examScraper } from "./exam";

export async function ScraperRoutes(app: FastifyInstance) {
  app.post('/scraper', examScraper)
}