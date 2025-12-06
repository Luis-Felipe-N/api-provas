export class Email {
  private readonly value: string

  get address(): string {
    return this.value
  }

  private constructor(value: string) {
    this.value = value
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static create(value: string): Email {
    if (!value || !Email.isValid(value)) {
      throw new Error('Invalid email address')
    }

    return new Email(value.toLowerCase().trim())
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
