"use client"

import { useState, memo } from "react"
import { Settings, ChevronLeft } from "lucide-react"
import { topicConfigs, TopicId } from "@/lib/sidebar-config"
import { useThemeStore } from "@/store/useThemeStore"
import { cn } from "@/lib/utils"

export const TopicDropdown = memo(({ onSelect, collapsed }: { onSelect: (topicId: TopicId) => void; collapsed: boolean }) => {
  const { selectedTopic, enabledTopics, toggleTopicEnabled } = useThemeStore()
  const [isConfiguringTopics, setIsConfiguringTopics] = useState(false)

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-canvas border border-hairline rounded-lg shadow-lg z-50 py-1 max-h-[340px] overflow-y-auto min-w-[220px]">
      {!isConfiguringTopics ? (
        <>
          <div className="max-h-[260px] overflow-y-auto">
            {topicConfigs
              .filter((t) => enabledTopics.includes(t.id))
              .map((topic) => {
                const TopicIcon = topic.icon
                const isSelected = topic.id === selectedTopic
                return (
                  <button
                    key={topic.id}
                    onClick={() => onSelect(topic.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas-soft transition-colors text-left",
                      isSelected && "bg-canvas-soft"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary text-on-primary" : "bg-canvas-soft-2 text-mute"
                    )}>
                      <TopicIcon size={11} />
                    </div>
                    <span className="text-[13px] font-medium truncate text-ink">{topic.label}</span>
                    {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </button>
                )
              })}
          </div>
          <div className="border-t border-hairline mt-1 pt-1 px-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsConfiguringTopics(true)
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-mute hover:text-ink hover:bg-canvas-soft rounded transition-colors text-left"
            >
              <Settings size={12} />
              <span>Configure Topics...</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-hairline">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsConfiguringTopics(false)
              }}
              className="p-1 hover:bg-canvas-soft rounded text-mute hover:text-ink transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-semibold font-mono uppercase tracking-wider text-mute">Configure Topics</span>
          </div>
          <div className="p-1.5 space-y-1 max-h-[260px] overflow-y-auto">
            {topicConfigs.map((topic) => {
              const TopicIcon = topic.icon
              const isEnabled = enabledTopics.includes(topic.id)
              const canToggle = !isEnabled || enabledTopics.length > 1
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-canvas-soft-2/45 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded bg-canvas-soft-2 flex items-center justify-center text-mute shrink-0">
                      <TopicIcon size={10} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-ink leading-none">{topic.label}</span>
                      <span className="text-[9px] text-mute truncate mt-0.5 max-w-[130px]">{topic.description}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={!canToggle}
                    onChange={() => toggleTopicEnabled(topic.id)}
                    className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
})

TopicDropdown.displayName = "TopicDropdown"