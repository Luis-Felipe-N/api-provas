import type { FastifyInstance } from "fastify";
import { examScraper } from "./exam";

export async function scraperRoutes(app: FastifyInstance) {
  app.post('/scraper', examScraper)
}
