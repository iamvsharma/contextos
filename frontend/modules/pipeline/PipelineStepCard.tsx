"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { GripVertical, X, Eye, EyeOff, ChevronRight } from "lucide-react"
import type { PipelineStep } from "@/types"

interface PipelineStepCardProps {
  step: PipelineStep
  index: number
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  isLast: boolean
}

export function PipelineStepCard({ step, index, onRemove, onToggle, isLast }: PipelineStepCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50 z-10",
        !step.enabled && "opacity-60"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 bg-canvas border border-hairline rounded-md",
          "transition-all duration-150",
          step.enabled ? "hover:border-border-strong" : "border-dashed"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-ink transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted tabular-nums w-6">#{index + 1}</span>
            <span className={cn("text-body-md text-ink truncate", !step.enabled && "line-through")}>
              {step.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(step.id)}
            className="p-1.5 rounded text-muted hover:text-ink hover:bg-surface-soft transition-colors"
            title={step.enabled ? "Disable step" : "Enable step"}
          >
            {step.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            onClick={() => onRemove(step.id)}
            className="p-1.5 rounded text-muted hover:text-signature-coral hover:bg-signature-coral/5 transition-colors"
            title="Remove step"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center py-1">
          <ChevronRight size={14} className="text-muted/40 rotate-90" />
        </div>
      )}
    </div>
  )
}
