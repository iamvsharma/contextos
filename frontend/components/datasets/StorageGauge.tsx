"use client"

import { Card } from "@/components/ui/Card"

interface StorageGaugeProps {
  totalSizeMB: number
  onUpgrade: () => void
}

export function StorageGauge({ totalSizeMB, onUpgrade }: StorageGaugeProps) {
  const percentage = Math.max(0.01, (totalSizeMB / 10240) * 100)
  
  return (
    <Card className="p-5 border border-hairline bg-canvas shadow-[0px_1px_2px_rgba(0,0,0,0.02)] space-y-4">
      <h3 className="text-body-sm-strong font-bold text-ink">Storage Usage</h3>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between font-mono text-[11px] font-semibold text-ink">
          <span>{totalSizeMB.toFixed(2)} MB / 10240 MB</span>
          <span className="text-accent-blue">
            {percentage.toFixed(2)}%
          </span>
        </div>
        <div className="w-full h-2 bg-canvas-soft border border-hairline rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-blue rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, percentage)}%` }} 
          />
        </div>
      </div>
      <button 
        onClick={onUpgrade}
        className="w-full border border-hairline hover:bg-canvas-soft bg-canvas text-[11px] font-semibold py-2 rounded-md shadow-sm text-ink transition-colors"
      >
        Upgrade Storage
      </button>
    </Card>
  )
}
