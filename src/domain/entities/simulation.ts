import { Entity, UniqueEntityId } from '@/core/entities'
import { Optional } from '@/core/types'
import { SimulationQuestionList } from './simulation-question-list'
import { SimulationAnswerList } from './simulation-answer-list'

export interface SimulationProps {
  studentId: UniqueEntityId
  title: string
  questions: SimulationQuestionList
  answers: SimulationAnswerList
  createdAt: Date
  finishedAt?: Date | null
}

export class Simulation extends Entity<SimulationProps> {
  get studentId() {
    return this.props.studentId
  }

  get title() {
    return this.props.title
  }

  get questions() {
    return this.props.questions
  }

  get answers() {
    return this.props.answers
  }

  get createdAt() {
    return this.props.createdAt
  }

  get finishedAt() {
    return this.props.finishedAt
  }

  get isFinished() {
    return !!this.props.finishedAt
  }

  get score() {
    let points = 0
    const answers = this.props.answers.getItems()
    const questions = this.props.questions.getItems()

    answers.forEach(answer => {
      const question = questions.find(q => q.questionId.equals(answer.questionId))

      if (question && question.correctAlternativeId.equals(answer.alternativeId)) {
        points++
      }
    })

    return points
  }

  get durationInMinutes() {
    if (!this.props.finishedAt) return 0

    const diffMs = this.props.finishedAt.getTime() - this.props.createdAt.getTime()
    return Math.round(diffMs / 60000)
  }

  public finish() {
    if (this.isFinished) return

    this.props.finishedAt = new Date()
  }

  static create(
    props: Optional<SimulationProps, 'createdAt' | 'answers'>,
    id?: UniqueEntityId,
  ) {
    const simulation = new Simulation(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        answers: props.answers ?? new SimulationAnswerList(),
      },
      id,
    )

    return simulation
  }
}
