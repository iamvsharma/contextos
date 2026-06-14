"use client"

import { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useThemeStore } from "@/store/useThemeStore"
import { TopicDropdown } from "./TopicDropdown"
import { TopicId, topicConfigs } from "@/lib/sidebar-config"
import { cn } from "@/lib/utils"

export function TopicSelector({ collapsed = false }) {
  const {
    selectedTopic,
    setSelectedTopic,
  } = useThemeStore()

  const currentTopic = topicConfigs.find((t) => t.id === selectedTopic)
  const TopicIcon = currentTopic?.icon

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const handleChange = (id: TopicId) => {
    setSelectedTopic(id)
    localStorage.setItem("selected-topic", id)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-canvas-soft border border-transparent hover:border-hairline transition-all text-left ${
          collapsed ? "justify-center" : ""
        }`}
        aria-label="Select topic"
        aria-expanded={open}
      >
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary shrink-0">
          {TopicIcon && <TopicIcon size={13} />}
        </div>
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium text-ink truncate flex-1">{currentTopic?.label}</span>
            <ChevronDown size={11} className={cn("text-mute transition-transform shrink-0", open && "rotate-180")} />
          </>
        )}
      </button>

      {open && (
        <TopicDropdown
          onSelect={handleChange}
          collapsed={collapsed}
        />
      )}
    </div>
  )
}