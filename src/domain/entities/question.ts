import { Entity, UniqueEntityId } from '@/core/entities'
import { Optional } from '@/core/types'
import { AlternativeList } from './alternative-list'

export interface QuestionProps {
  statement: string
  organization: string
  subject: string
  alternatives: AlternativeList
  createdAt: Date
  updatedAt?: Date | null
}

export class Question extends Entity<QuestionProps> {
  get statement() {
    return this.props.statement
  }

  get organization() {
    return this.props.organization
  }

  get subject() {
    return this.props.subject
  }

  get alternatives() {
    return this.props.alternatives
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get excerpt() {
    return this.props.statement.slice(0, 120).trimEnd().concat('...')
  }

  get isValid() {
    const correctCount = this.props.alternatives
      .getItems()
      .filter(item => item.isCorrect).length

    return correctCount === 1
  }

  set statement(statement: string) {
    this.props.statement = statement
    this.touch()
  }

  set alternatives(alternatives: AlternativeList) {
    this.props.alternatives = alternatives
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<QuestionProps, 'createdAt' | 'alternatives'>,
    id?: UniqueEntityId,
  ) {
    const question = new Question(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        alternatives: props.alternatives ?? new AlternativeList(),
      },
      id,
    )

    return question
  }
}
