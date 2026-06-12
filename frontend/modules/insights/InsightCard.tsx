"use client"

import { cn } from "@/lib/utils"

interface InsightCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  variant?: "default" | "coral" | "mint" | "peach"
}

const variantStyles = {
  default: "bg-canvas border border-hairline text-ink",
  coral: "bg-signature-coral text-on-primary",
  mint: "bg-signature-mint/20 text-ink border border-signature-mint/30",
  peach: "bg-signature-peach/20 text-ink border border-signature-peach/30",
}

export function InsightCard({ label, value, subtitle, icon, variant = "default" }: InsightCardProps) {
  return (
    <div className={cn("p-5 rounded-md", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-caption", variant === "coral" ? "text-on-primary/70" : "text-muted")}>
            {label}
          </p>
          <p className={cn("text-display-md mt-1", variant === "coral" && "text-on-primary")}>
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-body-md mt-0.5", variant === "coral" ? "text-on-primary/70" : "text-muted")}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && <div className={cn("opacity-60", variant === "coral" ? "text-on-primary" : "text-muted")}>{icon}</div>}
      </div>
    </div>
  )
}
