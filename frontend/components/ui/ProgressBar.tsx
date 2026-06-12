"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  size?: "sm" | "md"
}

export function ProgressBar({ value, max = 100, className, size = "md" }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  return (
    <div
      className={cn(
        "w-full bg-surface-soft rounded-full overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2.5",
        className
      )}
    >
      <div
        className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
