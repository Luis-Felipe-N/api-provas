import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamPositionProps {
  externalId: number
  name: string
  description?: string | null
  slug?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamPosition extends Entity<ExamPositionProps> {
  get externalId() {
    return this.props.externalId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description ?? null
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
    props: Optional<ExamPositionProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamPosition(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
