import { WatchedList } from '@/core/entities'
import { Question } from './question'

export class QuestionList extends WatchedList<Question> {
  compareItems(a: Question, b: Question): boolean {
    return a.id.equals(b.id)
  }
}
