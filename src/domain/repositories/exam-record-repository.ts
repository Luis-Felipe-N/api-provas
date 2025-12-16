import { ExamRecord } from '../entities'

export interface ExamRecordFindManyParams {
  page?: number
  perPage?: number
  year?: number
  level?: string
  available?: boolean
}

export interface IExamRecordRepository {
  create(examRecord: ExamRecord): Promise<void>
  findByExternalId(externalId: number): Promise<ExamRecord | null>
  findBySlug(slug: string): Promise<ExamRecord | null>
  findMany(params?: ExamRecordFindManyParams): Promise<ExamRecord[]>
  save(examRecord: ExamRecord): Promise<void>
}
