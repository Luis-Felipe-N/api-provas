import { Simulation } from '../entities/simulation'

export interface ISimulationRepository {
  create(simulation: Simulation): Promise<void>
  findById(id: string): Promise<Simulation | null>
  findByStudentId(studentId: string): Promise<Simulation[]>
  findMany(params: { page: number; perPage: number }): Promise<Simulation[]>
  save(simulation: Simulation): Promise<void>
  delete(id: string): Promise<void>
}
