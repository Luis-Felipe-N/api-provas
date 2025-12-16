import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamNoticeProps {
  externalId: number
  slug?: string | null
  enrollmentStart?: Date | null
  enrollmentEnd?: Date | null
  plannedApplication?: Date | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamNotice extends Entity<ExamNoticeProps> {
  get externalId() {
    return this.props.externalId
  }

  get slug() {
    return this.props.slug ?? null
  }

  get enrollmentStart() {
    return this.props.enrollmentStart ?? null
  }

  get enrollmentEnd() {
    return this.props.enrollmentEnd ?? null
  }

  get plannedApplication() {
    return this.props.plannedApplication ?? null
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExamNoticeProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamNotice(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
