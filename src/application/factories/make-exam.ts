import { Exam, type ExamProps } from "../../domain";

export function makeExam(data: ExamProps) {
  return Exam.create({
    title: data.title,
    year: data.year,
    organization: data.organization,
    institution: data.institution,
    level: data.level,
    sourceUrl: data.sourceUrl,
  })
}