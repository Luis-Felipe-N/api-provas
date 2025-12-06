import { UniqueEntityId, WatchedList } from '@/core/entities'

export interface SimulationQuestionItem {
  questionId: UniqueEntityId
  correctAlternativeId: UniqueEntityId
}

export class SimulationQuestionList extends WatchedList<SimulationQuestionItem> {
  compareItems(a: SimulationQuestionItem, b: SimulationQuestionItem): boolean {
    return a.questionId.equals(b.questionId)
  }
}
