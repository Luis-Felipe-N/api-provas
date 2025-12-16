import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamBoardProps {
  externalId: number
  name: string
  description?: string | null
  acronym?: string | null
  slug?: string | null
  isOab: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamBoard extends Entity<ExamBoardProps> {
  get externalId() {
    return this.props.externalId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description ?? null
  }

  get acronym() {
    return this.props.acronym ?? null
  }

  get slug() {
    return this.props.slug ?? null
  }

  get isOab() {
    return this.props.isOab
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExamBoardProps, 'createdAt' | 'isOab'>,
    id?: UniqueEntityId,
  ) {
    return new ExamBoard(
      {
        ...props,
        isOab: props.isOab ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
