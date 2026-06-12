"use client"

import { create } from "zustand"
import type { PipelineStep, PipelineStepType, TransformationResult, InsightReport, SocialMediaFeatures } from "@/types"

const AVAILABLE_STEPS: { type: PipelineStepType; label: string; category: "basic" | "advanced" | "social" }[] = [
  { type: "lowercase", label: "Lowercase", category: "basic" },
  { type: "remove_punctuation", label: "Remove Punctuation", category: "basic" },
  { type: "remove_stopwords", label: "Remove Stopwords", category: "basic" },
  { type: "tokenize", label: "Tokenization", category: "basic" },
  { type: "lemmatize", label: "Lemmatization", category: "advanced" },
  { type: "handle_emojis", label: "Emoji Handling", category: "advanced" },
  { type: "normalize_slang", label: "Slang Normalization", category: "advanced" },
  { type: "remove_mentions", label: "Remove Mentions (@)", category: "social" },
  { type: "remove_hashtags", label: "Remove Hashtags (#)", category: "social" },
  { type: "remove_urls", label: "Remove URLs", category: "social" },
  { type: "remove_numbers", label: "Remove Numbers", category: "basic" },
  { type: "remove_special_characters", label: "Remove Special Characters", category: "basic" },
  { type: "stem_porter", label: "Stemming (Porter)", category: "advanced" },
  { type: "normalize_whitespace", label: "Normalize Whitespace", category: "basic" },
]

interface PipelineState {
  inputText: string
  steps: PipelineStep[]
  results: TransformationResult[]
  insightReport: InsightReport | null
  socialFeatures: SocialMediaFeatures | null
  isProcessing: boolean
  error: string | null
}

interface PipelineActions {
  setInputText: (text: string) => void
  addStep: (type: PipelineStepType) => void
  removeStep: (id: string) => void
  reorderSteps: (fromIndex: number, toIndex: number) => void
  toggleStep: (id: string) => void
  updateStepConfig: (id: string, config: Record<string, unknown>) => void
  setResults: (results: TransformationResult[]) => void
  setInsightReport: (report: InsightReport | null) => void
  setSocialFeatures: (features: SocialMediaFeatures | null) => void
  setIsProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  resetPipeline: () => void
  getActiveSteps: () => PipelineStep[]
  setSteps: (steps: PipelineStep[]) => void
}

export const usePipelineStore = create<PipelineState & PipelineActions>((set, get) => ({
  inputText: "",
  steps: [],
  results: [],
  insightReport: null,
  socialFeatures: null,
  isProcessing: false,
  error: null,

  setInputText: (text) => set({ inputText: text }),
  setSteps: (steps) => set({ steps }),

  addStep: (type) => {
    const stepMeta = AVAILABLE_STEPS.find((s) => s.type === type)
    if (!stepMeta) return
    const step: PipelineStep = {
      id: `${type}-${Date.now()}`,
      type,
      label: stepMeta.label,
      enabled: true,
    }
    set((state) => ({ steps: [...state.steps, step] }))
  },

  removeStep: (id) => {
    set((state) => ({ steps: state.steps.filter((s) => s.id !== id) }))
  },

  reorderSteps: (fromIndex, toIndex) => {
    set((state) => {
      const steps = [...state.steps]
      const [removed] = steps.splice(fromIndex, 1)
      steps.splice(toIndex, 0, removed)
      return { steps }
    })
  },

  toggleStep: (id) => {
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }))
  },

  updateStepConfig: (id, config) => {
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...config } } : s)),
    }))
  },

  setResults: (results) => set({ results }),
  setInsightReport: (report) => set({ insightReport: report }),
  setSocialFeatures: (features) => set({ socialFeatures: features }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),

  resetPipeline: () =>
    set({
      inputText: "",
      steps: [],
      results: [],
      insightReport: null,
      socialFeatures: null,
      isProcessing: false,
      error: null,
    }),

  getActiveSteps: () => get().steps.filter((s) => s.enabled),
}))

export { AVAILABLE_STEPS }
