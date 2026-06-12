"use client"

import Link from "next/link"
import { Search, Bell, HelpCircle, ChevronsUpDown } from "lucide-react"
import { useThemeStore } from "@/store/useThemeStore"

export function Navbar() {
  const { colorMode, toggleColorMode } = useThemeStore()

  return (
    <header className="sticky top-0 z-40 h-14 bg-canvas border-b border-hairline flex items-center shrink-0">
      <div className="flex items-center justify-between w-full px-4 h-full">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-ink rounded">
            <div className="w-6 h-6 bg-ink rounded-sm flex items-center justify-center text-canvas font-mono font-semibold text-xs">
              TP
            </div>
            <span className="text-body-sm font-semibold text-ink tracking-tight hidden sm:inline">
              TextPrep Pro
            </span>
          </Link>

          <div className="w-px h-5 bg-hairline mx-1 hidden sm:block" aria-hidden="true" />

          <div className="relative min-w-0 flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={14} aria-hidden="true" />
            <input
              type="text"
              name="global_search"
              autoComplete="off"
              placeholder="Search pipelines, datasets…"
              className="w-full pl-9 pr-14 py-1.5 text-body-sm rounded-lg border border-hairline bg-canvas-soft text-ink placeholder:text-mute/60 focus:outline-none focus:border-ink focus:bg-canvas font-medium transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-eyebrow font-medium text-mute border border-hairline px-1.5 py-0.5 rounded bg-canvas tabular-nums">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleColorMode}
            className="p-2 hover:bg-canvas-soft-2 rounded-lg text-mute hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-ink"
            title={colorMode === "colorful" ? "Switch to Grayscale" : "Switch to Colorful"}
            aria-label={colorMode === "colorful" ? "Switch to Grayscale" : "Switch to Colorful"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2" fill={colorMode === "colorful" ? "#3b82f6" : "none"} />
              <circle cx="17.5" cy="15.5" r="2" fill={colorMode === "colorful" ? "#8b5cf6" : "none"} />
              <circle cx="8.5" cy="15.5" r="2" fill={colorMode === "colorful" ? "#06b6d4" : "none"} />
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-canvas-soft-2 rounded-lg text-mute hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-ink"
            title="Help"
            aria-label="Help Documentation"
          >
            <HelpCircle size={16} aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              className="p-2 hover:bg-canvas-soft-2 rounded-lg text-mute hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-ink"
              title="Notifications"
              aria-label="Notifications with 3 updates"
            >
              <Bell size={16} aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ink rounded-full" />
            </button>
          </div>

          <div className="w-px h-5 bg-hairline mx-1" aria-hidden="true" />

          <button className="flex items-center gap-2 p-1.5 hover:bg-canvas-soft-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ink">
            <div className="w-7 h-7 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center text-ink font-medium text-xs">
              K
            </div>
            <ChevronsUpDown size={14} className="text-mute hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}
