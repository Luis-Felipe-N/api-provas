import { FetchExamsUseCase } from '../../../application/use-cases/fetch-exams'
import { makeExamRepository } from './make-repositories'

export function makeFetchExamsUseCase() {
  return new FetchExamsUseCase(makeExamRepository())
}
