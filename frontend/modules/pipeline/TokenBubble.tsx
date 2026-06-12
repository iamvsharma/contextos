"use client"

interface TokenBubbleProps {
  token: string
}

const tokenColors = [
  "bg-signature-yellow/20 text-ink border border-signature-yellow/30",
  "bg-signature-mint/20 text-ink border border-signature-mint/30",
  "bg-signature-peach/20 text-ink border border-signature-peach/30",
  "bg-signature-cream/50 text-ink border border-signature-cream",
]

export function TokenBubble({ token }: TokenBubbleProps) {
  const colorClass = tokenColors[token.length % tokenColors.length]

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-caption ${colorClass}`}>
      {token}
    </span>
  )
}
