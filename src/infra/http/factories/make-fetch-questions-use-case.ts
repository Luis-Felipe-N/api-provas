import { FetchQuestionsUseCase } from '../../../application/use-cases/fetch-questions'
import { makeQuestionRepository } from './make-repositories'

export function makeFetchQuestionsUseCase() {
  return new FetchQuestionsUseCase(makeQuestionRepository())
}
