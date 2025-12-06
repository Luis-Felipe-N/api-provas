import { Question as PrismaQuestion, Alternative as PrismaAlternative } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities'
import { Question, Alternative, AlternativeList } from '@/domain/entities'

type PrismaQuestionWithAlternatives = PrismaQuestion & {
  alternatives: PrismaAlternative[]
}

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestionWithAlternatives): Question {
    const alternatives = raw.alternatives.map(alt =>
      Alternative.create(
        {
          questionId: new UniqueEntityId(alt.questionId),
          text: alt.text,
          isCorrect: alt.isCorrect,
          createdAt: alt.createdAt,
          updatedAt: alt.updatedAt,
        },
        new UniqueEntityId(alt.id)
      )
    )

    return Question.create(
      {
        statement: raw.statement,
        organization: raw.organization,
        subject: raw.subject,
        alternatives: new AlternativeList(alternatives),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(question: Question) {
    return {
      id: question.id.toString(),
      statement: question.statement,
      organization: question.organization,
      subject: question.subject,
    }
  }
}
