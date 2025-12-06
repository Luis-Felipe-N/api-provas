import { DomainError } from './domain-error'

export class InvalidQuestionError extends DomainError {
  constructor(message: string = 'Question must have exactly one correct alternative') {
    super(message)
    this.name = 'InvalidQuestionError'
  }
}
