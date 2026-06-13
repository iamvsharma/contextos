"use client"

import { Card } from "@/components/ui/Card"

interface DonutChartProps {
  txtCount: number
  csvCount: number
  pdfCount: number
  jsonCount: number
  mdCount: number
  othersCount: number
  totalCount: number
  onRefresh: () => void
}

export function DonutChart({
  txtCount,
  csvCount,
  pdfCount,
  jsonCount,
  mdCount,
  othersCount,
  totalCount,
  onRefresh
}: DonutChartProps) {
  const radius = 35
  const circumference = 2 * Math.PI * radius
  
  const composition = [
    { label: "Text", count: txtCount, color: "#8b5cf6" },
    { label: "CSV", count: csvCount, color: "#10b981" },
    { label: "PDF", count: pdfCount, color: "#f43f5e" },
    { label: "JSON", count: jsonCount, color: "#3b82f6" },
    { label: "Others", count: othersCount + mdCount, color: "#f59e0b" },
  ].filter((s) => s.count > 0)

  let accumulatedPercent = 0

  return (
    <Card className="p-5 border border-hairline bg-canvas shadow-[0px_1px_2px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <h3 className="text-body-sm-strong font-bold text-ink">Dataset Overview</h3>
        <button onClick={onRefresh} className="text-[11px] text-accent-blue font-semibold hover:underline">
          Refresh
        </button>
      </div>
      
      <div className="relative flex items-center justify-center py-2 select-none">
        <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
          {composition.map((item, idx) => {
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0
            const dashoffset = circumference - (percentage / 100) * circumference
            const rotationOffset = (accumulatedPercent / 100) * circumference
            accumulatedPercent += percentage
            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={dashoffset}
                style={{
                  strokeDashoffset: dashoffset,
                  transformOrigin: "50px 50px",
                  transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                }}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-display-sm font-semibold tracking-tight text-ink">{totalCount}</span>
          <span className="text-[10px] font-bold text-mute uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-caption pt-2 border-t border-hairline">
        {composition.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 font-semibold text-[11px] text-ink min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.label}</span>
            <span className="text-mute font-mono font-medium ml-auto">({item.count})</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
