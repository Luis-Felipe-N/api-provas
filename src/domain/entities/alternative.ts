import { Entity, UniqueEntityId } from '@/core/entities'
import { Optional } from '@/core/types'

export interface AlternativeProps {
  questionId: UniqueEntityId
  text: string
  isCorrect: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class Alternative extends Entity<AlternativeProps> {
  get questionId() {
    return this.props.questionId
  }

  get text() {
    return this.props.text
  }

  get isCorrect() {
    return this.props.isCorrect
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set text(text: string) {
    this.props.text = text
    this.touch()
  }

  set isCorrect(isCorrect: boolean) {
    this.props.isCorrect = isCorrect
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<AlternativeProps, 'createdAt' | 'isCorrect'>,
    id?: UniqueEntityId,
  ) {
    const alternative = new Alternative(
      {
        ...props,
        isCorrect: props.isCorrect ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return alternative
  }
}
