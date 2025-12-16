import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { ExamRecord } from '../../../domain/entities'
import { ExamRecordFindManyParams, type IExamRecordRepository } from '../../../domain/repositories'
import { PrismaExamRecordMapper, type PrismaExamRecordWithRelations } from './mappers/prisma-exam-record-mapper'

export class PrismaExamRecordRepository implements IExamRecordRepository {
  private readonly includes = {
    organization: true,
    board: true,
    position: true,
    notice: true,
    careers: {
      include: {
        career: true,
      },
    },
    areas: {
      include: {
        area: true,
      },
    },
    parts: true,
  } satisfies Prisma.ExamRecordInclude

  async create(examRecord: ExamRecord): Promise<void> {
    const data = PrismaExamRecordMapper.toPrisma(examRecord)

    await prisma.examRecord.create({
      data: {
        ...data,
        organization: this.mapOrganization(examRecord),
        board: this.mapBoard(examRecord),
        position: this.mapPosition(examRecord),
        notice: this.mapNotice(examRecord, false),
        careers: this.mapCareers(examRecord, false),
        areas: this.mapAreas(examRecord, false),
        parts: this.mapParts(examRecord, false),
      },
    })
  }

  async findByExternalId(externalId: number): Promise<ExamRecord | null> {
    const record = await prisma.examRecord.findUnique({
      where: { externalId },
      include: this.includes,
    })

    if (!record) {
      return null
    }

    return PrismaExamRecordMapper.toDomain(record as PrismaExamRecordWithRelations)
  }

  async findBySlug(slug: string): Promise<ExamRecord | null> {
    const record = await prisma.examRecord.findUnique({
      where: { slug },
      include: this.includes,
    })

    if (!record) {
      return null
    }

    return PrismaExamRecordMapper.toDomain(record as PrismaExamRecordWithRelations)
  }

  async findMany(params: ExamRecordFindManyParams = {}): Promise<ExamRecord[]> {
    const {
      page = 1,
      perPage = 20,
      year,
      level,
      available,
    } = params

    const where: Prisma.ExamRecordWhereInput = {}

    if (typeof year === 'number') {
      where.year = year
    }

    if (typeof level === 'string' && level.trim().length > 0) {
      where.level = { equals: level }
    }

    if (typeof available === 'boolean') {
      where.available = available
    }

    const records = await prisma.examRecord.findMany({
      where,
      include: this.includes,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return records.map((record) =>
      PrismaExamRecordMapper.toDomain(record as PrismaExamRecordWithRelations)
    )
  }

  async save(examRecord: ExamRecord): Promise<void> {
    const data = PrismaExamRecordMapper.toPrisma(examRecord)

    await prisma.examRecord.update({
      where: { id: examRecord.id.toString() },
      data: {
        ...data,
        organization: this.mapOrganization(examRecord),
        board: this.mapBoard(examRecord),
        position: this.mapPosition(examRecord),
        notice: this.mapNotice(examRecord, true),
        careers: this.mapCareers(examRecord, true),
        areas: this.mapAreas(examRecord, true),
        parts: this.mapParts(examRecord, true),
      },
    })
  }

  private mapOrganization(examRecord: ExamRecord) {
    const organization = examRecord.organization

    return {
      connectOrCreate: {
        where: { externalId: organization.externalId },
        create: {
          id: organization.id.toString(),
          externalId: organization.externalId,
          name: organization.name,
          acronym: organization.acronym,
          sphere: organization.sphere,
          state: organization.state,
          slug: organization.slug,
        },
      },
    }
  }

  private mapBoard(examRecord: ExamRecord) {
    const board = examRecord.board

    return {
      connectOrCreate: {
        where: { externalId: board.externalId },
        create: {
          id: board.id.toString(),
          externalId: board.externalId,
          name: board.name,
          description: board.description,
          acronym: board.acronym,
          slug: board.slug,
          isOab: board.isOab,
        },
      },
    }
  }

  private mapPosition(examRecord: ExamRecord) {
    const position = examRecord.position

    return {
      connectOrCreate: {
        where: { externalId: position.externalId },
        create: {
          id: position.id.toString(),
          externalId: position.externalId,
          name: position.name,
          description: position.description,
          slug: position.slug,
        },
      },
    }
  }

  private mapNotice(examRecord: ExamRecord, allowDisconnect: boolean) {
    const notice = examRecord.notice

    if (!notice) {
      return allowDisconnect ? { disconnect: true } : undefined
    }

    return {
      connectOrCreate: {
        where: { externalId: notice.externalId },
        create: {
          id: notice.id.toString(),
          externalId: notice.externalId,
          slug: notice.slug,
          enrollmentStart: notice.enrollmentStart,
          enrollmentEnd: notice.enrollmentEnd,
          plannedApplication: notice.plannedApplication,
        },
      },
    }
  }

  private mapCareers(examRecord: ExamRecord, replace: boolean) {
    if (examRecord.careers.length === 0 && !replace) {
      return undefined
    }

    const createEntries = examRecord.careers.map((career) => ({
      career: {
        connectOrCreate: {
          where: { externalId: career.externalId },
          create: {
            id: career.id.toString(),
            externalId: career.externalId,
            name: career.name,
            description: career.description,
          },
        },
      },
    }))
    const payload: Record<string, unknown> = replace ? { deleteMany: {} } : {}

    if (createEntries.length > 0) {
      payload.create = createEntries
    }

    return Object.keys(payload).length > 0 ? payload : undefined
  }

  private mapAreas(examRecord: ExamRecord, replace: boolean) {
    if (examRecord.areas.length === 0 && !replace) {
      return undefined
    }

    const createEntries = examRecord.areas.map((area) => ({
      area: {
        connectOrCreate: {
          where: { externalId: area.externalId },
          create: {
            id: area.id.toString(),
            externalId: area.externalId,
            name: area.name,
            slug: area.slug,
          },
        },
      },
    }))
    const payload: Record<string, unknown> = replace ? { deleteMany: {} } : {}

    if (createEntries.length > 0) {
      payload.create = createEntries
    }

    return Object.keys(payload).length > 0 ? payload : undefined
  }

  private mapParts(examRecord: ExamRecord, replace: boolean) {
    if (examRecord.parts.length === 0 && !replace) {
      return undefined
    }

    const createEntries = examRecord.parts.map((part) => ({
      id: part.id.toString(),
      externalId: part.externalId,
      description: part.description,
    }))
    const payload: Record<string, unknown> = replace ? { deleteMany: {} } : {}

    if (createEntries.length > 0) {
      payload.create = createEntries
    }

    return Object.keys(payload).length > 0 ? payload : undefined
  }
}
