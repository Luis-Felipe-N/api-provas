import { Entity, UniqueEntityId } from '../../core/entities'
import { Optional } from '../../core/types'
import { QuestionList } from './question-list'

export interface ExamProps {
  title: string
  year: number
  organization: string
  institution: string
  level: string
  questions: QuestionList
  createdAt: Date
  updatedAt?: Date | null
  sourceUrl?: string | null
  originalPdfUrl?: string | null
  answerKeyUrl?: string | null
}

export class Exam extends Entity<ExamProps> {
  get title() {
    return this.props.title
  }

  get year() {
    return this.props.year
  }

  get organization() {
    return this.props.organization
  }

  get institution() {
    return this.props.institution
  }

  get level() {
    return this.props.level
  }

  get questions() {
    return this.props.questions
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get sourceUrl() {
    return this.props.sourceUrl
  }

  get originalPdfUrl() {
    return this.props.originalPdfUrl
  }

  get answerKeyUrl() {
    return this.props.answerKeyUrl
  }

  set title(title: string) {
    this.props.title = title
    this.touch()
  }

  set questions(questions: QuestionList) {
    this.props.questions = questions
    this.touch()
  }

  get hasQuestions() {
    return this.props.questions.getItems().length > 0
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<ExamProps, 'createdAt' | 'questions'>,
    id?: UniqueEntityId,
  ) {
    const exam = new Exam(
      {
        ...props,
        questions: props.questions ?? new QuestionList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return exam
  }
}
