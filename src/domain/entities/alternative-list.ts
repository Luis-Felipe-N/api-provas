import { WatchedList } from '@/core/entities'
import { Alternative } from './alternative'

export class AlternativeList extends WatchedList<Alternative> {
  compareItems(a: Alternative, b: Alternative): boolean {
    return a.id.equals(b.id)
  }
}
