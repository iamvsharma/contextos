"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type DateRangePreset = "24h" | "1d" | "1w" | "1m" | "custom"

interface DateRangePickerProps {
  value: { preset: DateRangePreset; start?: string; end?: string }
  onChange: (val: { preset: DateRangePreset; start?: string; end?: string }) => void
  className?: string
}

const presets: { key: DateRangePreset; label: string }[] = [
  { key: "24h", label: "Last 24 hours" },
  { key: "1d", label: "Last 1 day" },
  { key: "1w", label: "Last 1 week" },
  { key: "1m", label: "Last 1 month" },
  { key: "custom", label: "Custom range" },
]

function formatDateRange(preset: DateRangePreset, start?: string, end?: string): string {
  if (preset === "custom" && start && end) {
    const s = new Date(start)
    const e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}, ${e.getFullYear()}`
  }

  const now = new Date()
  const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const fmtFull: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }

  switch (preset) {
    case "24h": {
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return `${start.toLocaleDateString("en-US", fmt)} – Today`
    }
    case "1d": {
      const start = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      return `${start.toLocaleDateString("en-US", fmt)} – Today`
    }
    case "1w": {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return `${start.toLocaleDateString("en-US", fmt)} – ${now.toLocaleDateString("en-US", fmtFull)}`
    }
    case "1m": {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return `${start.toLocaleDateString("en-US", fmt)} – ${now.toLocaleDateString("en-US", fmtFull)}`
    }
    default:
      return "Select date range"
  }
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempStart, setTempStart] = useState(value.start || "")
  const [tempEnd, setTempEnd] = useState(value.end || "")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setTempStart(value.start || "")
    setTempEnd(value.end || "")
  }, [value.start, value.end])

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === "custom") {
      onChange({ preset, start: tempStart, end: tempEnd })
    } else {
      onChange({ preset })
      setOpen(false)
    }
  }

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      onChange({ preset: "custom", start: tempStart, end: tempEnd })
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 border border-hairline rounded-lg text-caption text-body-sm bg-canvas hover:bg-canvas-soft transition-colors flex items-center gap-2 shadow-sm focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Calendar size={12} className="text-mute" aria-hidden="true" />
        <span>{formatDateRange(value.preset, value.start, value.end)}</span>
        <ChevronDown size={12} className={cn("text-mute transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-canvas border border-hairline rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Preset list */}
          <div className="p-1.5 border-b border-hairline-soft">
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePresetSelect(p.key)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-body-sm transition-colors flex items-center justify-between",
                  value.preset === p.key
                    ? "bg-canvas-soft text-ink text-body-sm"
                    : "text-body-sm hover:bg-canvas-soft-2 hover:text-ink"
                )}
              >
                {p.label}
                {value.preset === p.key && (
                  <span className="w-1.5 h-1.5 rounded-full bg-ink" />
                )}
              </button>
            ))}
          </div>

          {/* Custom date inputs */}
          {value.preset === "custom" && (
            <div className="p-2.5 space-y-2.5 bg-canvas-soft/50">
              <div className="space-y-1">
                <label className="eyebrow">Start Date</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="form-input-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="eyebrow">End Date</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="form-input-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleCustomApply}
                  disabled={!tempStart || !tempEnd}
                  className="flex-1 py-1.5 bg-ink text-on-primary text-caption font-medium rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Apply Range
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 border border-hairline rounded-sm text-mute hover:text-ink hover:bg-canvas-soft transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
