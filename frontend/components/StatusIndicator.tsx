"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex items-center gap-1.5" title={isOnline ? "Online" : "Offline"}>
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          isOnline ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="text-[10px] font-mono text-mute">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  )
}
