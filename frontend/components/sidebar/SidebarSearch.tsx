import { Search } from "lucide-react"
import { useThemeStore } from "@/store/useThemeStore"

interface SidebarSearchProps {
  isCollapsed: boolean
  setSearchOpen: (searchOpen: boolean) => void
}

export function SidebarSearch({ isCollapsed, setSearchOpen }: SidebarSearchProps) { 
  return (   
    <>
      {!isCollapsed ? (
        <div className="px-3 pt-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md border border-hairline hover:border-hairline-strong bg-canvas-soft hover:bg-canvas-soft-2 transition-colors text-left group"
          >
            <Search size={13} className="text-mute group-hover:text-ink shrink-0" />
            <span className="text-[13px] text-mute group-hover:text-ink flex-1">Search...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 text-[12px] font-mono text-mute bg-canvas border border-hairline rounded">⌘K</kbd>
          </button>
        </div>
      ) : (
        <div className="px-1 pt-3 flex justify-center">
          <button 
            onClick={() => setSearchOpen(true)} 
            className="w-8 h-8 rounded-md border border-hairline hover:border-hairline-strong bg-canvas-soft hover:bg-canvas-soft-2 flex items-center justify-center text-mute hover:text-body transition-colors" 
            title="Search (⌘K)"
          >
            <Search size={14} />
          </button>
        </div>
      )}  
    </>
  )
}
