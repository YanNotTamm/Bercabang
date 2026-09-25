export type LLMProvider = 'openrouter' | 'kios' | 'openai_compatible' | 'proxy'

export type LLMStorageMode = 'memory' | 'encrypted'

export interface LLMConfig {
  provider: LLMProvider
  baseUrl: string
  model: string
  dailyLimit: number
  proxyUrl?: string
  storageMode: LLMStorageMode
  encryptedKey?: string
  keyLastFour?: string
}

export interface ConnectionTestResult {
  success: boolean
  latencyMs?: number
  message: string
  error?: string
}

export type LLMTask = 'scenario_parse' | 'result_explain'

export interface ParsedScenarioDraft {
  useCase: 'CAREER' | 'RELOCATE'
  horizonYears: 5 | 10
  params: {
    capitalSource?: string
    capitalAmountBracket?: number
    sectorTarget?: string
    experienceYearsInSector?: number
    hasSideIncomeTest?: boolean
    originProvinceCode?: string
    destProvinceCode?: string
    movingWithFamily?: boolean
    hasJobOffer?: boolean
    reason?: string
    [key: string]: string | number | boolean | undefined
  }
  detectedSummary: string
  suggestedStrategies?: { key: string; label: string }[]
  confidenceScore: number
}

export interface ExplainedResult {
  summary: string
  keyTakeaways: string[]
  questionsToAsk: string[]
  cautionNotes: string[]
  numbersUsed: number[]
  source: 'llm' | 'fallback'
}

export interface LLMUsageLog {
  id: string
  timestamp: string
  task: LLMTask
  provider: string
  model: string
  status: 'success' | 'rejected' | 'error' | 'fallback'
  tokenCount?: {
    prompt?: number
    completion?: number
    total?: number
  }
  errorCode?: string
  durationMs: number
}
