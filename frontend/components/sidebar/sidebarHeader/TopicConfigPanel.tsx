"use client"

import { topicConfigs } from "@/lib/sidebar-config"
import { useThemeStore } from "@/store/useThemeStore"

export function TopicConfigPanel({ onBack }: { onBack: () => void }) {
  const { enabledTopics, toggleTopicEnabled } = useThemeStore()

  return (
    <div className="absolute bg-canvas border rounded shadow w-full z-50">
      <div className="p-2 border-b">
        <button onClick={onBack}>← Back</button>
      </div>

      <div className="p-2 space-y-2">
        {topicConfigs.map((topic) => {
          const isEnabled = enabledTopics.includes(topic.id)

          return (
            <div key={topic.id} className="flex justify-between">
              <span>{topic.label}</span>

              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggleTopicEnabled(topic.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}