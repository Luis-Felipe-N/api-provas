import { randomUUID } from 'crypto'

export class UniqueEntityId {
  private value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  equals(id: UniqueEntityId): boolean {
    return this.value === id.toValue()
  }

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }
}