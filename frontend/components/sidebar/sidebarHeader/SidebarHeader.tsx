"use client"

import { useThemeStore } from "@/store/useThemeStore"
import { TopicSelector } from "./TopicSelector"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

export function SidebarHeader() {
  const { sidebarCollapsed, toggleSidebarCollapsed } = useThemeStore()

  return (
    <div className="border-b border-hairline">
      {!sidebarCollapsed ? (
        <div className="px-3 py-2.5 flex items-center gap-2">
          <TopicSelector />
          <button
            onClick={toggleSidebarCollapsed}
            className="p-1.5 border rounded text-mute hover:text-ink"
          >
            <ChevronsLeft size={14} />
          </button>
        </div>
      ) : (
        <div className="px-2 py-2.5 flex flex-col items-center gap-2">
          <TopicSelector collapsed />

          <button
            onClick={toggleSidebarCollapsed}
            className="p-1.5 border rounded text-mute hover:text-ink"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}