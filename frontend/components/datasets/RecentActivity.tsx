"use client"

import { Card } from "@/components/ui/Card"

interface ShortDataset {
  file_name: string
  created_at?: string
}

interface RecentActivityProps {
  datasets: ShortDataset[]
}

export function RecentActivity({ datasets }: RecentActivityProps) {
  return (
    <Card className="p-5 border border-hairline bg-canvas shadow-[0px_1px_2px_rgba(0,0,0,0.02)] space-y-3.5">
      <h3 className="text-body-sm-strong font-bold text-ink">Recent Uploads</h3>
      
      <div className="relative pl-4 border-l border-hairline space-y-4 max-h-56 overflow-y-auto">
        {datasets.slice(0, 4).map((d, idx) => (
          <div key={idx} className="relative flex flex-col gap-0.5 text-caption font-semibold leading-relaxed">
            <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full border border-emerald-500 bg-canvas z-10 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
            </div>
            <span className="text-ink truncate block" title={d.file_name}>{d.file_name}</span>
            <span className="text-[10px] text-mute font-mono font-medium block mt-0.5">
              {d.created_at ? new Date(d.created_at).toLocaleDateString() : "Preload"}
            </span>
          </div>
        ))}

        {datasets.length === 0 && (
          <p className="text-[11px] text-mute italic">No uploads yet</p>
        )}
      </div>
    </Card>
  )
}
