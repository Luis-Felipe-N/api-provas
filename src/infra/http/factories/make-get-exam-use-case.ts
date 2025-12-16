import { GetExamUseCase } from '../../../application/use-cases/get-exam'
import { makeExamRepository } from './make-repositories'

export function makeGetExamUseCase() {
  return new GetExamUseCase(makeExamRepository())
}
