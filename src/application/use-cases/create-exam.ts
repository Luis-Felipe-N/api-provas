import { Exam } from '@/domain/entities'
import { IExamRepository } from '@/domain/repositories'
import { CreateExamInput, CreateExamOutput } from '../dtos/create-exam-dto'

export class CreateExamUseCase {
  constructor(private examRepository: IExamRepository) { }

  async execute(input: CreateExamInput): Promise<CreateExamOutput> {
    const exam = Exam.create({
      title: input.title,
      year: input.year,
      organization: input.organization,
      institution: input.institution,
      level: input.level,
      sourceUrl: input.sourceUrl,
      originalPdfUrl: input.originalPdfUrl,
      answerKeyUrl: input.answerKeyUrl,
    })

    await this.examRepository.create(exam)

    return {
      examId: exam.id.toString(),
    }
  }
}
