export class Score {
  private readonly correctAnswers: number
  private readonly totalQuestions: number

  get value(): number {
    if (this.totalQuestions === 0) return 0
    return (this.correctAnswers / this.totalQuestions) * 100
  }

  get correct(): number {
    return this.correctAnswers
  }

  get total(): number {
    return this.totalQuestions
  }

  get percentage(): string {
    return `${this.value.toFixed(2)}%`
  }

  private constructor(correctAnswers: number, totalQuestions: number) {
    this.correctAnswers = correctAnswers
    this.totalQuestions = totalQuestions
  }

  static create(correctAnswers: number, totalQuestions: number): Score {
    if (correctAnswers < 0 || totalQuestions < 0) {
      throw new Error('Score values cannot be negative')
    }

    if (correctAnswers > totalQuestions) {
      throw new Error('Correct answers cannot exceed total questions')
    }

    return new Score(correctAnswers, totalQuestions)
  }

  equals(other: Score): boolean {
    return (
      this.correctAnswers === other.correctAnswers &&
      this.totalQuestions === other.totalQuestions
    )
  }
}
