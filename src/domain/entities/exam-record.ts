import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'
import { ExamBoard } from './exam-board'
import { ExamOrganization } from './exam-organization'
import { ExamPosition } from './exam-position'
import { ExamNotice } from './exam-notice'
import { ExamCareer } from './exam-career'
import { ExamArea } from './exam-area'
import { ExamPart } from './exam-part'

export interface ExamRecordProps {
  externalId: number
  slug: string
  name: string
  type: number
  year: number
  level: string
  questionCount: number
  durationMinutes?: number | null
  reviewed: boolean
  hasPendencies: boolean
  available: boolean
  observations?: string | null
  otherData?: string | null
  timestamp?: Date | null
  publishedAt?: Date | null
  applicationDate?: Date | null
  examFileKey?: string | null
  answerKeyFileKey?: string | null
  organization: ExamOrganization
  board: ExamBoard
  position: ExamPosition
  notice?: ExamNotice | null
  careers: ExamCareer[]
  areas: ExamArea[]
  parts: ExamPart[]
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamRecord extends Entity<ExamRecordProps> {
  get externalId() {
    return this.props.externalId
  }

  get slug() {
    return this.props.slug
  }

  get name() {
    return this.props.name
  }

  get type() {
    return this.props.type
  }

  get year() {
    return this.props.year
  }

  get level() {
    return this.props.level
  }

  get questionCount() {
    return this.props.questionCount
  }

  get durationMinutes() {
    return this.props.durationMinutes ?? null
  }

  get reviewed() {
    return this.props.reviewed
  }

  get hasPendencies() {
    return this.props.hasPendencies
  }

  get available() {
    return this.props.available
  }

  get observations() {
    return this.props.observations ?? null
  }

  get otherData() {
    return this.props.otherData ?? null
  }

  get timestamp() {
    return this.props.timestamp ?? null
  }

  get publishedAt() {
    return this.props.publishedAt ?? null
  }

  get applicationDate() {
    return this.props.applicationDate ?? null
  }

  get examFileKey() {
    return this.props.examFileKey ?? null
  }

  get answerKeyFileKey() {
    return this.props.answerKeyFileKey ?? null
  }

  get organization() {
    return this.props.organization
  }

  get board() {
    return this.props.board
  }

  get position() {
    return this.props.position
  }

  get notice() {
    return this.props.notice ?? null
  }

  get careers() {
    return this.props.careers
  }

  set careers(careers: ExamCareer[]) {
    this.props.careers = careers
    this.touch()
  }

  get areas() {
    return this.props.areas
  }

  set areas(areas: ExamArea[]) {
    this.props.areas = areas
    this.touch()
  }

  get parts() {
    return this.props.parts
  }

  set parts(parts: ExamPart[]) {
    this.props.parts = parts
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ExamRecordProps, 'createdAt' | 'careers' | 'areas' | 'parts' | 'reviewed' | 'hasPendencies' | 'available'>,
    id?: UniqueEntityId,
  ) {
    return new ExamRecord(
      {
        ...props,
        careers: props.careers ?? [],
        areas: props.areas ?? [],
        parts: props.parts ?? [],
        reviewed: props.reviewed ?? false,
        hasPendencies: props.hasPendencies ?? false,
        available: props.available ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
