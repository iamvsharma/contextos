"use client"

import { Globe, FolderOpen, Github, Server } from "lucide-react"

export function ImportFromServices() {
  return (
    <div className="border border-hairline rounded-xl p-5 bg-canvas flex flex-col justify-between shadow-[0px_1px_2px_rgba(0,0,0,0.02)] select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-caption-mono text-mute uppercase tracking-wider block">Import from</span>
        <span className="bg-amber-500/10 text-amber-600 text-[8px] font-semibold px-1.5 py-0 rounded border border-amber-500/20 uppercase tracking-wider">
          Coming Soon
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { name: "Web URL", icon: <Globe className="w-4 h-4 text-sky-600/50" /> },
          { name: "Google Drive", icon: <FolderOpen className="w-4 h-4 text-amber-500/50" /> },
          { name: "GitHub", icon: <Github className="w-4 h-4 text-ink/50" /> },
          { name: "S3 / Cloud", icon: <Server className="w-4 h-4 text-purple-600/50" /> },
        ].map((item, idx) => (
          <button 
            key={idx}
            disabled
            className="flex items-center gap-2 px-3 py-2.5 border border-hairline rounded-lg bg-canvas-soft/60 text-[12px] font-medium text-mute text-left cursor-not-allowed opacity-60"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 border-t border-hairline pt-3 flex items-center justify-between text-[11px] text-mute font-medium">
        <span>Ingestion Pipeline</span>
        <span className="w-2 h-2 rounded-full bg-mute/45" />
      </div>
    </div>
  )
}
