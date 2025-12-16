import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamCareerProps {
  externalId: number
  name: string
  description?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamCareer extends Entity<ExamCareerProps> {
  get externalId() {
    return this.props.externalId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description ?? null
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExamCareerProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamCareer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
