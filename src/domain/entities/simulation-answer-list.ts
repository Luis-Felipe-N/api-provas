import { UniqueEntityId, WatchedList } from '@/core/entities'

export interface SimulationAnswerItem {
  questionId: UniqueEntityId
  alternativeId: UniqueEntityId
}

export class SimulationAnswerList extends WatchedList<SimulationAnswerItem> {
  compareItems(a: SimulationAnswerItem, b: SimulationAnswerItem): boolean {
    return a.questionId.equals(b.questionId)
  }
}
