import { fetch } from "undici";
import { PDFParse } from "pdf-parse";

export interface PdfContent {
  text: string;
  numPages: number;
  info?: any;
}

export interface QuestionBlock {
  number: number;
  text: string;
}

export interface AnswerKey {
  examName: string;
  tipo: string;
  answers: Record<number, string>;
}

const sanitizeText = (value: string) =>
  value
    .replace(/pcimarkpci\s*\S+/gi, "")
    .replace(/www\.pciconcursos\.com\.br/gi, "")
    .replace(/Página\s*\d+\s*de\s*\d+/gi, "")
    .replace(/([A-ZÀ-Ÿ])\n([A-ZÀ-Ÿ])/g, "$1$2");

export class PdfExtractor {
  constructor(private readonly userAgent: string = "Mozilla/5.0") { }

  async fetchPdf(url: string): Promise<Buffer> {
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent },
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async extractFromUrl(url: string): Promise<PdfContent> {
    const buffer = await this.fetchPdf(url);
    return this.extractText(buffer);
  }

  async extractText(pdfBuffer: Buffer): Promise<PdfContent> {
    const parser = new PDFParse({ data: pdfBuffer });

    try {
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo().catch(() => null),
      ]);

      return {
        text: textResult.text,
        numPages: textResult.total,
        info: infoResult?.info,
      };
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  extractQuestions(text: string): QuestionBlock[] {
    const questions: QuestionBlock[] = [];

    // Tenta primeiro o padrão numérico isolado (1, 2, 3...)
    const primary = Array.from(text.matchAll(/(?:^|\n)\s*(\d{1,3})[\.\-\)]?\s+(?=[A-ZÀ-Ÿ])/g));
    let matches = primary;

    // Se falhar, tenta o padrão explícito "QUESTÃO 01"
    if (!matches.length) {
      matches = Array.from(text.matchAll(/(?:QUEST[ÃA]O|Questão)\s*[:\-]?\s*(\d+)/g));
    }

    // Se ainda falhar, tenta apenas números no início da linha (fallback arriscado, mas útil)
    if (!matches.length) {
      matches = Array.from(text.matchAll(/(?:^|\n)\s*(\d{1,3})\s*\n/g));
    }

    const seen = new Set<number>();

    matches.forEach((match, index) => {
      const number = Number(match[1]);
      // Filtros de segurança
      if (seen.has(number) || number > 200 || number === 0) {
        return;
      }

      // Validação sequencial: evita pular de 1 para 50
      if (questions.length > 0) {
        const lastNum = questions[questions.length - 1].number;
        if (number > lastNum + 10) return;
      }

      seen.add(number);

      const start = match.index ?? 0;
      // O fim é o início da próxima questão ou um limite de caracteres
      const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : Math.min(start + 4000, text.length);

      const snippet = text.slice(start, end).trim();

      if (snippet.length < 30) { // Ignora textos muito curtos (provavelmente falso positivo)
        return;
      }

      questions.push({ number, text: snippet.slice(0, 3000) });
    });

    questions.sort((a, b) => a.number - b.number);
    return questions;
  }

  extractAnswerKeys(text: string): AnswerKey[] {
    const cleaned = sanitizeText(text);
    const answerKeys: AnswerKey[] = [];

    // Regexes para identificar o cabeçalho do cargo/prova
    const cargoPatterns: Array<[RegExp, "m_pattern" | "tipo" | "prova" | "uppercase"]> = [
      [/(?:M(\d+)\s*[-–]\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿº\s\-–]+?))(?:\n|PROVA)/gi, "m_pattern"],
      [/([A-ZÀ-Ÿ][A-Za-zÀ-ÿº\s\-–]+(?:Militar|Bombeiro|Polícia|Civil|Perito|Tenente|Soldado|Oficial|Agente|Contador|Analista|Técnico|Escriturário|Assistente|Auxiliar|Administrador|Engenheiro|Advogado|Médico|Enfermeiro|Professor|Fiscal|Auditor|Delegado|Escrivão|Inspetor|Motorista|Operador|Secretário|Gestor|Coordenador|Supervisor|Gerente|Diretor)[A-Za-zÀ-ÿº\s\-–]*)[–\-]\s*Tipo\s*(\d+)/gi, "tipo"],
      [/([0-9ºªA-Za-zÀ-ÿ\s\-–]+?)\s*[-–]\s*TIPO\s*(\d+)/gi, "tipo"],
      [/(?:GABARITO\s*(?:OFICIAL|DEFINITIVO|PRELIMINAR)?)\s*\n?\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿº\s\-–]+?)\s+Prova\s*[-–]?\s*([A-Z0-9]+)/gi, "prova"],
      [/\n\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿ\s\-–]+(?:ÁRIO|ISTA|OR|ENTE|IVO|ICO|IRO|ADO|IDO|OSO|ÃO|EIRO|ADOR)[A-ZÀ-Ÿ\s\-–]*)\s*\n\s*(?=\d+\s*[-–:]?\s*[A-E])/g, "uppercase"],
    ];

    for (const [pattern, type] of cargoPatterns) {
      const matches = Array.from(cleaned.matchAll(pattern));

      matches.forEach((match, index) => {
        let examName: string;
        let tipo = "1";

        if (type === "m_pattern") {
          tipo = match[1].trim();
          examName = match[2].trim();
        } else {
          examName = match[1].trim();
          tipo = (match[2] ?? "1").trim();
        }

        examName = examName.replace(/^(GABARITO\s*(DEFINITIVO|PRELIMINAR|OFICIAL)?\s*)/i, "").trim();
        examName = examName.replace(/^\d*º?\s*/, "").trim();
        examName = examName.replace(/\s+/g, " ").trim();

        if (!examName || examName.length < 4 || ["PROVA", "GABARITO", "TIPO"].includes(examName.toUpperCase())) {
          return;
        }

        const start = (match.index ?? 0) + match[0].length;
        const nextMatchStart = matches[index + 1]?.index ?? cleaned.length;

        // Pega o bloco de texto entre este cabeçalho e o próximo
        const block = cleaned.slice(start, nextMatchStart);
        const answers = this.extractAnswersFromBlock(block);

        if (Object.keys(answers).length >= 5) {
          const alreadyExists = answerKeys.find((ak) => ak.examName === examName && ak.tipo === tipo);
          if (!alreadyExists) {
            answerKeys.push({ examName, tipo, answers });
          }
        }
      });

      if (answerKeys.length) {
        break;
      }
    }

    // Fallback: Se não achou nenhum bloco de cargo específico, tenta extrair do texto inteiro
    if (!answerKeys.length) {
      const answers = this.extractAnswersFromBlock(cleaned);
      if (Object.keys(answers).length >= 5) {
        const examName = this.extractExamName(cleaned);
        answerKeys.push({ examName, tipo: "1", answers });
      }
    }

    return answerKeys;
  }

  private extractExamName(text: string): string {
    const patterns = [
      /(?:GABARITO\s*(?:OFICIAL|DEFINITIVO|PRELIMINAR)?)\s*\n?\s*([A-ZÀ-Ÿ][A-Za-zÀ-ÿº\s\-–]{5,50})/i,
      /([A-Z][A-Z\s\-–]+(?:ÁRIO|ISTA|OR|ENTE|IVO|ICO|IRO|ADO|IDO|OSO)[A-Z\s\-–]*)/,
      /CARGO:\s*([A-Za-zÀ-ÿº\s\-–]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim().replace(/\s+/g, " ");
        if (name.length >= 5) {
          return name;
        }
      }
    }
    return "Unknown";
  }

  private extractAnswersFromBlock(block: string): Record<number, string> {
    const answers: Record<number, string> = {};

    // 1. Padrão de Tabela Robusto (Suporta quebras de linha e múltiplos espaços)
    // Procura por sequências de números seguidas por sequências de letras
    const tablePattern = /(\d+(?:\s+\d+){4,})\s*[\r\n]*\s*([A-EX](?:\s+[A-EX]){4,})/gi;

    for (const match of block.matchAll(tablePattern)) {
      const nums = match[1].trim().split(/\s+/).map(Number);
      const letters = match[2].trim().split(/\s+/);

      // Valida se o tamanho bate para evitar desalinhamento
      if (Math.abs(nums.length - letters.length) <= 2) {
        nums.forEach((num, idx) => {
          const letter = letters[idx]?.toUpperCase();
          if (num >= 1 && num <= 200 && letter && /[ABCDEX*]/.test(letter)) {
            answers[num] = letter === "*" ? "X" : letter;
          }
        });
      }
    }

    if (Object.keys(answers).length >= 5) {
      return answers;
    }

    // 2. Padrões de Lista (Item por Item) - Fallback mais seguro
    const listPatterns = [
      // 01 - A, 01-A, 01 : A
      /(\d{1,3})\s*[-–:]\s*([A-EX*])/gi,
      // 01. A, 01.A
      /(\d{1,3})\s*[\.]\s*([A-EX*])/gi,
      // 01 A (com espaço), 01A (sem espaço, mas com word boundary)
      /\b(\d{1,3})\s*([A-EX*])\b/gi,
      // Apenas 01A (sem espaço, perigoso mas comum em tabelas quebradas)
      /(?:\D|^)(\d{1,3})([A-E])(?=\d|\s|$)/g
    ];

    for (const pattern of listPatterns) {
      for (const match of block.matchAll(pattern)) {
        const num = Number(match[1]);
        const letter = match[2]?.toUpperCase();

        // Regras de validação
        if (num >= 1 && num <= 200 && letter && /[ABCDEX*]/.test(letter)) {
          // Só sobrescreve se ainda não tiver, ou se o método anterior for pouco confiável
          if (!answers[num]) {
            answers[num] = letter === "*" ? "X" : letter;
          }
        }
      }
    }

    return answers;
  }

  async extractAnswerKeysFromUrl(url: string): Promise<AnswerKey[]> {
    try {
      const buffer = await this.fetchPdf(url);
      const content = await this.extractText(buffer);
      const keys = this.extractAnswerKeys(content.text);

      if (keys.length === 0) {
        console.warn(`[PDFExtractor] Nenhum gabarito encontrado no PDF: ${url}`);
      } else {
        console.log(`[PDFExtractor] ${keys.length} gabaritos encontrados. Primeiro com ${Object.keys(keys[0].answers).length} respostas.`);
      }

      return keys;
    } catch (e) {
      console.error(`[PDFExtractor] Erro ao processar URL ${url}: ${(e as Error).message}`);
      return [];
    }
  }
}