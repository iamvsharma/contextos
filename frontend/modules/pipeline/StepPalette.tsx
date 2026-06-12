"use client"

import { AVAILABLE_STEPS } from "@/store/usePipelineStore"
import type { PipelineStepType } from "@/types"

const categoryLabels: Record<string, string> = {
  basic: "Basic",
  advanced: "Advanced",
  social: "Social",
}

interface StepPaletteProps {
  onAddStep: (type: PipelineStepType) => void
}

export function StepPalette({ onAddStep }: StepPaletteProps) {
  const categories = ["basic", "advanced", "social"] as const

  return (
    <div className="space-y-6">
      <h3 className="text-title-md text-ink">Available Steps</h3>
      <p className="text-body-md text-muted">Click to add a preprocessing step to your pipeline.</p>

      {categories.map((cat) => (
        <div key={cat}>
          <h4 className="text-caption text-muted uppercase tracking-wider mb-2">{categoryLabels[cat]}</h4>
          <div className="space-y-1.5">
            {AVAILABLE_STEPS.filter((s) => s.category === cat).map((step) => (
              <button
                key={step.type}
                onClick={() => onAddStep(step.type)}
                className="w-full text-left px-4 py-3 bg-canvas border border-hairline rounded-md text-body-md text-ink hover:bg-surface-soft hover:border-border-strong transition-colors duration-150 cursor-pointer active:bg-surface-strong font-button"
              >
                <span className="font-medium">+</span> {step.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
