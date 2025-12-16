import { Alternative as PrismaAlternative } from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities'
import { Alternative } from '../../../../domain/entities'

export class PrismaAlternativeMapper {
  static toDomain(raw: PrismaAlternative): Alternative {
    return Alternative.create(
      {
        questionId: new UniqueEntityId(raw.questionId),
        text: raw.text,
        isCorrect: raw.isCorrect,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(alternative: Alternative) {
    return {
      id: alternative.id.toString(),
      questionId: alternative.questionId.toString(),
      text: alternative.text,
      isCorrect: alternative.isCorrect,
    }
  }
}
