const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

export const api = {
  preprocess: {
    execute: (text: string, steps: { type: string; enabled: boolean; config?: Record<string, unknown> }[]) =>
      request<{ results: { step: string; input: string; output: string; tokens?: string[] }[] }>("/api/preprocess", {
        method: "POST",
        body: JSON.stringify({ text, steps }),
      }),

    insights: (text: string, steps: { type: string; enabled: boolean }[]) =>
      request<{
        originalTokens: number
        processedTokens: number
        uniqueWords: number
        noiseRemovedPercent: number
        emojiCount: number
        emojiSentiments: Record<string, number>
        sentimentBefore: { label: string; score: number }
        sentimentAfter: { label: string; score: number }
        topWords: { word: string; count: number }[]
      }>("/api/insights", {
        method: "POST",
        body: JSON.stringify({ text, steps }),
      }),

    social: (text: string) =>
      request<{
        mentionCount: number
        hashtagCount: number
        urlCount: number
        emojiCount: number
        emojiList: { emoji: string; meaning: string; sentiment: string }[]
      }>("/api/social/analyze", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
  },

  dataset: {
    upload: (formData: FormData) =>
      fetch(`${API_BASE}/api/dataset/upload`, { method: "POST", body: formData }).then((r) => r.json()),

    process: (jobId: string, column: string, steps: { type: string }[]) =>
      request<{ jobId: string }>("/api/dataset/process", {
        method: "POST",
        body: JSON.stringify({ job_id: jobId, column, steps }),
      }),

    status: (jobId: string) =>
      request<{
        status: string
        progress: number
        result?: Record<string, unknown>[]
        error?: string
      }>(`/api/dataset/status/${jobId}`),

    download: (jobId: string) => `${API_BASE}/api/dataset/download/${jobId}`,
  },

  pipeline: {
    get: () =>
      request<{
        name: string
        description: string
        steps: { type: string; enabled: boolean; config?: Record<string, unknown> }[]
        language: string
        outputFormat: string
        preserveCase: boolean
        removeAccents: boolean
        handleEmojis: boolean
        normalizeWhitespace: boolean
      }>("/api/pipeline"),

    save: (data: {
      name: string
      description: string
      steps: { type: string; enabled: boolean; config?: Record<string, unknown> }[]
      language: string
      outputFormat: string
      preserveCase: boolean
      removeAccents: boolean
      handleEmojis: boolean
      normalizeWhitespace: boolean
    }) =>
      request<{ status: string; message: string }>("/api/pipeline", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
}
