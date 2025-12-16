import {
  Area as PrismaArea,
  Board as PrismaBoard,
  Career as PrismaCareer,
  ExamRecord as PrismaExamRecord,
  ExamRecordArea as PrismaExamRecordArea,
  ExamRecordCareer as PrismaExamRecordCareer,
  ExamRecordPart as PrismaExamRecordPart,
  Notice as PrismaNotice,
  Organization as PrismaOrganization,
  Position as PrismaPosition,
} from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities'
import {
  ExamArea,
  ExamBoard,
  ExamCareer,
  ExamNotice,
  ExamOrganization,
  ExamPart,
  ExamPosition,
  ExamRecord,
} from '../../../../domain/entities'

export type PrismaExamRecordWithRelations = PrismaExamRecord & {
  organization: PrismaOrganization
  board: PrismaBoard
  position: PrismaPosition
  notice: PrismaNotice | null
  careers: Array<PrismaExamRecordCareer & { career: PrismaCareer }>
  areas: Array<PrismaExamRecordArea & { area: PrismaArea }>
  parts: PrismaExamRecordPart[]
}

export class PrismaExamRecordMapper {
  static toDomain(raw: PrismaExamRecordWithRelations): ExamRecord {
    const organization = ExamOrganization.create({
      externalId: raw.organization.externalId,
      name: raw.organization.name,
      acronym: raw.organization.acronym,
      sphere: raw.organization.sphere,
      state: raw.organization.state,
      slug: raw.organization.slug,
      createdAt: raw.organization.createdAt,
      updatedAt: raw.organization.updatedAt,
    }, new UniqueEntityId(raw.organization.id))

    const board = ExamBoard.create({
      externalId: raw.board.externalId,
      name: raw.board.name,
      description: raw.board.description,
      acronym: raw.board.acronym,
      slug: raw.board.slug,
      isOab: raw.board.isOab,
      createdAt: raw.board.createdAt,
      updatedAt: raw.board.updatedAt,
    }, new UniqueEntityId(raw.board.id))

    const position = ExamPosition.create({
      externalId: raw.position.externalId,
      name: raw.position.name,
      description: raw.position.description,
      slug: raw.position.slug,
      createdAt: raw.position.createdAt,
      updatedAt: raw.position.updatedAt,
    }, new UniqueEntityId(raw.position.id))

    const notice = raw.notice
      ? ExamNotice.create({
        externalId: raw.notice.externalId,
        slug: raw.notice.slug,
        enrollmentStart: raw.notice.enrollmentStart,
        enrollmentEnd: raw.notice.enrollmentEnd,
        plannedApplication: raw.notice.plannedApplication,
        createdAt: raw.notice.createdAt,
        updatedAt: raw.notice.updatedAt,
      }, new UniqueEntityId(raw.notice.id))
      : null

    const careers = raw.careers.map((relation) => {
      const career = relation.career
      return ExamCareer.create({
        externalId: career.externalId,
        name: career.name,
        description: career.description,
        createdAt: career.createdAt,
        updatedAt: career.updatedAt,
      }, new UniqueEntityId(career.id))
    })

    const areas = raw.areas.map((relation) => {
      const area = relation.area
      return ExamArea.create({
        externalId: area.externalId,
        name: area.name,
        slug: area.slug,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt,
      }, new UniqueEntityId(area.id))
    })

    const parts = raw.parts.map((part) => {
      return ExamPart.create({
        externalId: part.externalId,
        description: part.description,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
      }, new UniqueEntityId(part.id))
    })

    return ExamRecord.create({
      externalId: raw.externalId,
      slug: raw.slug,
      name: raw.name,
      type: raw.type,
      year: raw.year,
      level: raw.level,
      questionCount: raw.questionCount,
      durationMinutes: raw.durationMinutes,
      reviewed: raw.reviewed,
      hasPendencies: raw.hasPendencies,
      available: raw.available,
      observations: raw.observations,
      otherData: raw.otherData,
      timestamp: raw.timestamp,
      publishedAt: raw.publishedAt,
      applicationDate: raw.applicationDate,
      examFileKey: raw.examFileKey,
      answerKeyFileKey: raw.answerKeyFileKey,
      organization,
      board,
      position,
      notice,
      careers,
      areas,
      parts,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }, new UniqueEntityId(raw.id))
  }

  static toPrisma(examRecord: ExamRecord) {
    return {
      id: examRecord.id.toString(),
      externalId: examRecord.externalId,
      slug: examRecord.slug,
      name: examRecord.name,
      type: examRecord.type,
      year: examRecord.year,
      level: examRecord.level,
      questionCount: examRecord.questionCount,
      durationMinutes: examRecord.durationMinutes,
      reviewed: examRecord.reviewed,
      hasPendencies: examRecord.hasPendencies,
      available: examRecord.available,
      observations: examRecord.observations,
      otherData: examRecord.otherData,
      timestamp: examRecord.timestamp,
      publishedAt: examRecord.publishedAt,
      applicationDate: examRecord.applicationDate,
      examFileKey: examRecord.examFileKey,
      answerKeyFileKey: examRecord.answerKeyFileKey,
    }
  }
}
