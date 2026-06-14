import { SidebarItem } from "@/lib/sidebar-config"
import { RecentItem } from "@/store/useThemeStore"
import { Clock } from "lucide-react"
import Link from "next/link"

interface SidebarRecentProps {
  isCollapsed: boolean
  currentRecentItems: Array<RecentItem>
  formatTimeAgo: (timestamp: number) => string
}

export function SidebarRecent ({isCollapsed, currentRecentItems, formatTimeAgo}: SidebarRecentProps) {
  return (
    <>
      {!isCollapsed && currentRecentItems.length > 0 && (
          <div className="py-2 space-y-1.5 px-3">
            <h3 className="px-3.5 text-[10px] font-medium font-mono uppercase tracking-[0.08em] text-mute select-none flex items-center gap-1.5">
              <Clock size={10} />
              Recent
            </h3>
            <nav className="space-y-0.5">
              {currentRecentItems.map((item, itemIdx) => (
                <Link key={`recent-${itemIdx}`} href={item.href} className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm text-body hover:text-ink hover:bg-canvas-soft-2/50 transition-all duration-150">
                  <Clock size={13} className="text-mute shrink-0" />
                  <span className="text-[13px] leading-none flex-1 truncate">{item.label}</span>
                  <span className="text-[9px] font-mono text-mute shrink-0">{formatTimeAgo(item.timestamp)}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
    </>
  )
}