export type PipelineStepType =
  | "lowercase"
  | "remove_punctuation"
  | "remove_stopwords"
  | "tokenize"
  | "lemmatize"
  | "handle_emojis"
  | "normalize_slang"
  | "remove_mentions"
  | "remove_hashtags"
  | "remove_urls"
  | "remove_numbers"
  | "normalize_whitespace"
  | "stem_porter"
  | "remove_special_characters"

export interface PipelineStep {
  id: string
  type: PipelineStepType
  label: string
  enabled: boolean
  config?: Record<string, unknown>
}

export interface Pipeline {
  id: string
  name: string
  steps: PipelineStep[]
  createdAt: string
  updatedAt: string
}

export interface TransformationResult {
  step: string
  input: string
  output: string
  tokens?: string[]
  metrics?: {
    tokenCount: number
    uniqueWords: number
    noiseRemoved: number
  }
}

export interface DatasetJob {
  id: string
  status: "queued" | "processing" | "completed" | "failed"
  filename: string
  column: string
  pipeline: PipelineStep[]
  progress: number
  result?: Record<string, unknown>[]
  error?: string
}

export interface InsightReport {
  originalTokens: number
  processedTokens: number
  uniqueWords: number
  noiseRemovedPercent: number
  emojiCount: number
  emojiSentiments: Record<string, number>
  sentimentBefore: { label: string; score: number }
  sentimentAfter: { label: string; score: number }
  topWords: { word: string; count: number }[]
}

export interface SocialMediaFeatures {
  mentionCount: number
  hashtagCount: number
  urlCount: number
  emojiCount: number
  emojiList: { emoji: string; meaning: string; sentiment: string }[]
}

export type PreprocessingMode = "interactive" | "dataset" | "social"
