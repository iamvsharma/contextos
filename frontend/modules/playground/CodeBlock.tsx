"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import toast from "react-hot-toast"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "json", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-surface-dark text-on-dark/70 text-caption rounded-t-md border-b border-white/10">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-on-dark/70 hover:text-on-dark transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 bg-surface-dark-elevated text-on-dark/90 text-body-md overflow-x-auto rounded-b-md">
        <code>{code}</code>
      </pre>
    </div>
  )
}
