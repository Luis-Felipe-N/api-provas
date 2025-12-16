import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamAreaProps {
  externalId: number
  name: string
  slug?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamArea extends Entity<ExamAreaProps> {
  get externalId() {
    return this.props.externalId
  }

  get name() {
    return this.props.name
  }

  get slug() {
    return this.props.slug ?? null
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExamAreaProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamArea(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
