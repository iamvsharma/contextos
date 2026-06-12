"use client"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  variant?:
    | "marketing"
    | "marketing-large"
    | "soft"
    | "template"
    | "pricing"
    | "pricing-featured"
    | "default"
    | "dark"
    | "cream"
    | "signature-coral"
    | "signature-forest"
  padding?: "none" | "sm" | "md" | "lg" | "xl" | "xxl"
}

const variantStyles: Record<string, string> = {
  default: "card-marketing",
  marketing: "card-marketing",
  "marketing-large": "card-marketing-large",
  soft: "card-soft",
  template: "template-card",
  pricing: "pricing-card",
  "pricing-featured": "pricing-card-featured",
  // Safe fallbacks for older vertical variants to match Vercel styling guidelines
  dark: "pricing-card-featured",
  "signature-forest": "pricing-card-featured",
  "signature-coral": "pricing-card-featured",
  cream: "card-soft",
}

const paddingMap: Record<string, string> = {
  none: "p-0",
  sm: "p-4",      // 16px
  md: "p-6",      // 24px
  lg: "p-6",      // 24px
  xl: "p-8",      // 32px
  xxl: "p-12",    // 48px
}

export function Card({ children, className, variant = "default", padding, ...props }: CardProps) {
  const baseClass = variantStyles[variant] || variantStyles.default
  const paddingClass = padding ? paddingMap[padding] : ""

  return (
    <div className={cn(baseClass, paddingClass, className)} {...props}>
      {children}
    </div>
  )
}
