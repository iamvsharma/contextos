"use client"

import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1.5 bg-canvas-soft border border-hairline rounded-pill p-1 w-max", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "tab-ghost font-sans font-medium text-body-sm transition-all duration-150 rounded-pill",
            activeTab === tab.id
              ? "bg-canvas text-ink border border-hairline shadow-sm"
              : "bg-transparent text-body hover:text-ink border border-transparent"
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "text-caption px-1.5 py-0.25 rounded-full font-mono text-[11px]",
                activeTab === tab.id ? "bg-canvas-soft text-body" : "bg-canvas-soft-2 text-mute"
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
