import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'

export interface ExamOrganizationProps {
  externalId: number
  name: string
  acronym?: string | null
  sphere?: string | null
  state?: string | null
  slug?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class ExamOrganization extends Entity<ExamOrganizationProps> {
  get externalId() {
    return this.props.externalId
  }

  get name() {
    return this.props.name
  }

  get acronym() {
    return this.props.acronym ?? null
  }

  get sphere() {
    return this.props.sphere ?? null
  }

  get state() {
    return this.props.state ?? null
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
    props: Optional<ExamOrganizationProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new ExamOrganization(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
