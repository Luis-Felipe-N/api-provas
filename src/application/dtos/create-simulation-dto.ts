export interface CreateSimulationInput {
  studentId: string
  title: string
  questionIds: string[]
}

export interface CreateSimulationOutput {
  simulationId: string
}
