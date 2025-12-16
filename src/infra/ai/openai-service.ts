import OpenAI from 'openai'
import { env } from '../env'
import { IAIService, QuestionAnalysis } from '../../domain/services/ai-service.interface'

export class OpenAIService implements IAIService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY }) // Adicione ao env.ts
  }

  async analyzeQuestion(
    statement: string,
    alternatives: string[],
    correctAnswer: string
  ): Promise<QuestionAnalysis> {
    const prompt = `
      Analise a seguinte questão de concurso público.
      
      ENUNCIADO: "${statement}"
      ALTERNATIVAS: ${alternatives.join(', ')}
      GABARITO CORRETO: "${correctAnswer}"

      Tarefas:
      1. Classifique a disciplina específica (ex: Direito Constitucional, Raciocínio Lógico, Java).
      2. Defina a dificuldade (Fácil, Médio, Difícil).
      3. Gere um comentário didático explicando por que a alternativa correta é a certa e por que as outras podem estar erradas.

      Retorne APENAS um JSON no formato:
      {
        "subject": "string",
        "difficulty": "Fácil" | "Médio" | "Difícil",
        "explanation": "string"
      }
    `

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini", // Modelo rápido e barato
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error("Sem resposta da IA")

      return JSON.parse(content) as QuestionAnalysis
    } catch (error) {
      console.error("Erro na IA:", error)
      // Fallback seguro
      return {
        subject: "Geral",
        difficulty: "Médio",
        explanation: "Comentário indisponível no momento."
      }
    }
  }
}