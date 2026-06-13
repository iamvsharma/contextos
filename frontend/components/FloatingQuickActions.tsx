"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Plus, GitBranch, Upload, Wand2, Terminal, X } from "lucide-react"

const quickActions = [
  { label: "New Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Upload Dataset", href: "/datasets", icon: Upload },
  { label: "New Prompt", href: "/prompts/builder", icon: Wand2 },
  { label: "API Playground", href: "/playground", icon: Terminal },
]

export function FloatingQuickActions() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/pipeline") || pathname.startsWith("/dataset") || pathname.startsWith("/social") || pathname.startsWith("/playground") || pathname.startsWith("/nlp") || pathname.startsWith("/rag") || pathname.startsWith("/mcp") || pathname.startsWith("/automation") || pathname.startsWith("/agents") || pathname.startsWith("/agentic") || pathname.startsWith("/prompts") || pathname.startsWith("/insights") || pathname.startsWith("/datasets")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!isDashboard) return null

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Quick action items */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 flex flex-col gap-2 items-end mb-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "flex items-center gap-2.5 pl-4 pr-3 py-2 bg-canvas border border-hairline rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group",
                  "animate-in slide-in-from-bottom-2 fade-in duration-200"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-[13px] font-medium text-ink whitespace-nowrap">{action.label}</span>
                <div className="w-7 h-7 rounded-md bg-canvas-soft border border-hairline flex items-center justify-center group-hover:bg-ink group-hover:text-canvas transition-colors">
                  <Icon size={13} />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full bg-ink text-canvas shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        title="Quick Actions"
      >
        {isOpen ? <X size={20} /> : <Plus size={20} />}
      </button>
    </div>
  )
}
