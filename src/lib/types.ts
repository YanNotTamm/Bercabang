export type UserProfile = {
  id: string
  birthYear: number
  gender?: 'male' | 'female' | 'prefer_not_say'
  education?: 'sd' | 'smp' | 'sma' | 'diploma' | 'sarjana' | 'pascasarjana'
  maritalStatus?: 'single' | 'married' | 'divorced_widowed'
  dependents?: number
  urbanRural?: 'urban' | 'rural'
  provinceCode?: string
  employmentStatus?: 'employee' | 'self_employed' | 'unemployed' | 'student' | 'homemaker'
  sector?: string
  incomeBracket?: 1|2|3|4|5|6
  emergencySavingsMonths?: number
  debtToIncomeBracket?: 1|2|3|4
  createdAt: string
  updatedAt: string
}

export type ScenarioSpec = {
  id: string
  useCase: 'CAREER' | 'RELOCATE'
  strategies: { key: string; label: string; description?: string }[]
  horizonYears: 5 | 10
  params: Record<string, string | number | boolean>
  userReflection: {
    expectedOutcomeSelf: number
    confidencePct: number
    topValues: string[]
  }
  freeText?: string
  createdAt: string
}

export type Interval = { p10: number; p50: number; p90: number; coverage: 0.8 | 0.9 }
export type CausalLabel = 'ASSOCIATION' | 'QUASI_EXPERIMENTAL' | 'EXPERIMENTAL'

export type MetricSeries = {
  metric: string
  unit: string
  points: { year: 1|3|5|10; interval: Interval; ess: number; grade: 'A'|'B'|'C'|'D' }[]
  causalLabel: CausalLabel
  transferability: 'low'|'medium'|'high'
  sources: string[]
}

export type SimulationResult = {
  id: string
  scenarioId: string
  meta: { modelVersion: string; dataVersion: string; trialSpecVersion: string; seed: number; generatedAt: string }
  overall: { confidenceGrade: 'A'|'B'|'C'|'D'; gradeReasons: string[]; summarySentence: string }
  strategies: { key: string; label: string; outcomes: { financial: MetricSeries[]; wellbeing?: WellbeingBlock } }[]
  contrasts: { a: string; b: string; metric: string; year: number; delta: Interval; label: CausalLabel }[]
  unforeseen: string[]
  reversibility: { score: 0|1|2|3|4|5; smallTests: string[] }
  unpredictable: string[]
  reflectionQuestions: string[]
  expectationVsData?: { userExpectation: number; modelRange: Interval; note: string }
  limitations: string[]
  assumptions: string[]
  safety: { flags: ('HIGH_RISK'|'CRISIS')[]; message?: string }
}

export type WellbeingBlock = {
  populationFactors: { factor: string; direction: 'risk'|'protective'; evidenceRef: string }[]
  biasCorrection: string
  groupDistribution?: { metric: 'cesd_group_band'; bands: {label:string; pct:number}[]; ess:number }
}

export type ConsentRecord = {
  purpose: 'process_simulation'|'store_history'|'anonymous_research'
  granted: boolean
  textVersion: string
  timestamp: string
}
