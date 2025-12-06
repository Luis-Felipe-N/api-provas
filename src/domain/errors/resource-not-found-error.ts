import { DomainError } from './domain-error'

export class ResourceNotFoundError extends DomainError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
    this.name = 'ResourceNotFoundError'
  }
}
