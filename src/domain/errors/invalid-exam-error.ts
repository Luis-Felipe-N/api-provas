import { DomainError } from './domain-error'

export class InvalidExamError extends DomainError {
  constructor(message: string = 'Invalid exam data') {
    super(message)
    this.name = 'InvalidExamError'
  }
}
