"use client"

import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge-secondary inline-flex items-center font-sans",
        {
          "bg-canvas-soft text-body border-hairline": variant === "default",
          "bg-link-bg-soft text-link border-link/20": variant === "success" || variant === "info",
          "bg-warning-soft text-warning-deep border-warning/20": variant === "warning",
          "bg-error-soft text-error-deep border-error/20": variant === "error",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
