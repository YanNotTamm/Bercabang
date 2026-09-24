import Dexie, { type Table } from 'dexie'
import type { ConsentRecord, ScenarioSpec, SimulationResult, UserProfile } from './types'

class AppDB extends Dexie {
  profiles!: Table<UserProfile, string>
  scenarios!: Table<ScenarioSpec, string>
  results!: Table<SimulationResult, string>
  consents!: Table<ConsentRecord & { id: string }, string>

  constructor() {
    super('bercabang_db')
    this.version(1).stores({
      profiles: 'id',
      scenarios: 'id',
      results: 'id, scenarioId',
      consents: 'id',
    })
  }
}
export const db = new AppDB()

export async function clearAllData() {
  await db.profiles.clear()
  await db.scenarios.clear()
  await db.results.clear()
  await db.consents.clear()
  localStorage.clear()
}
