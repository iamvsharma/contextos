"use client"

import { useState, useEffect } from "react"
import type { TransformationResult } from "@/types"
import { cn } from "@/lib/utils"
import { TokenBubble } from "./TokenBubble"
import { Check } from "lucide-react"

interface TransformationViewerProps {
  results: TransformationResult[]
  inputText: string
}

const COLOR_PALETTE = [
  { hex: "#aa2d00", bg: "bg-[#aa2d00]/5", border: "border-l-[#aa2d00]", header: "bg-[#aa2d00]/10", text: "text-[#aa2d00]" },
  { hex: "#0a2e0e", bg: "bg-[#0a2e0e]/5", border: "border-l-[#0a2e0e]", header: "bg-[#0a2e0e]/10", text: "text-[#0a2e0e]" },
  { hex: "#fcab79", bg: "bg-[#fcab79]/15", border: "border-l-[#fcab79]", header: "bg-[#fcab79]/20", text: "text-[#cc6a2a]" },
  { hex: "#a8d8c4", bg: "bg-[#a8d8c4]/15", border: "border-l-[#a8d8c4]", header: "bg-[#a8d8c4]/20", text: "text-[#2a7a5a]" },
  { hex: "#f4d35e", bg: "bg-[#f4d35e]/15", border: "border-l-[#f4d35e]", header: "bg-[#f4d35e]/20", text: "text-[#a38a1a]" },
  { hex: "#d9a441", bg: "bg-[#d9a441]/10", border: "border-l-[#d9a441]", header: "bg-[#d9a441]/15", text: "text-[#8a6a10]" },
  { hex: "#1b61c9", bg: "bg-[#1b61c9]/5", border: "border-l-[#1b61c9]", header: "bg-[#1b61c9]/10", text: "text-[#1b61c9]" },
  { hex: "#006400", bg: "bg-[#006400]/5", border: "border-l-[#006400]", header: "bg-[#006400]/10", text: "text-[#006400]" },
  { hex: "#254fad", bg: "bg-[#254fad]/5", border: "border-l-[#254fad]", header: "bg-[#254fad]/10", text: "text-[#254fad]" },
  { hex: "#1d1f25", bg: "bg-[#1d1f25]/5", border: "border-l-[#1d1f25]", header: "bg-[#1d1f25]/10", text: "text-[#1d1f25]" },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function TransformationViewer({ results, inputText }: TransformationViewerProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [stepColors, setStepColors] = useState<typeof COLOR_PALETTE>([])

  useEffect(() => {
    setVisibleCount(0)
    if (results.length === 0) return
    const shuffled = shuffleArray(COLOR_PALETTE)
    const assigned = results.map((_, i) => shuffled[i % shuffled.length])
    setStepColors(assigned)
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= results.length) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, 400)
    return () => clearInterval(timer)
  }, [results])

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-muted text-body-md border border-dashed border-hairline rounded-md">
        <p>Enter text, build a pipeline, and click <strong>Process</strong> to see transformations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-surface-soft rounded-md border border-hairline">
        <div className="text-caption text-muted mb-1">Original Input</div>
        <div className="text-body-md text-ink">{inputText}</div>
      </div>

      {results.map((result, i) => {
        const color = stepColors[i] ?? COLOR_PALETTE[0]
        const isVisible = i < visibleCount
        const isLatest = i === visibleCount - 1

        return (
          <div
            key={i}
            className={cn(
              "border border-hairline rounded-md overflow-hidden border-l-4 transition-all duration-500",
              color.border,
              color.bg,
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{
              transitionDelay: isLatest ? "0ms" : `${i * 50}ms`,
            }}
          >
            <div className={cn("flex items-center justify-between px-4 py-2 border-b border-hairline/50", color.header)}>
              <span className="text-caption text-muted flex items-center gap-2">
                {isVisible && (
                  <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded-full", color.text)}>
                    <Check size={12} />
                  </span>
                )}
                <span>
                  Step #{i + 1}: <span className={cn("font-medium", color.text)}>{result.step}</span>
                </span>
              </span>
              {result.metrics && (
                <span className="text-caption text-muted">
                  Tokens: {result.metrics.tokenCount} | Noise: {result.metrics.noiseRemoved}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className={cn("text-body-md text-ink", i === results.length - 1 && "font-medium")}>
                {result.output}
              </div>
              {result.tokens && result.tokens.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.tokens.map((token, j) => (
                    <TokenBubble key={j} token={token} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
