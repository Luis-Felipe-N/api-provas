export class Organization {
  private readonly value: string

  get name(): string {
    return this.value
  }

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): Organization {
    if (!value || value.trim().length === 0) {
      throw new Error('Organization name cannot be empty')
    }

    return new Organization(value.trim().toUpperCase())
  }

  equals(other: Organization): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
