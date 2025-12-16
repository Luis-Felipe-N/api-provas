import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamPartProps {
  externalId?: number | null
  description: string
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamPart extends Entity<ExamPartProps> {
  get externalId() {
    return this.props.externalId ?? null
  }

  get description() {
    return this.props.description
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExamPartProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamPart(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
