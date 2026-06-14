import { cn } from "@/lib/utils";
import { Sparkles, Link, Settings, Moon, Sun, ChevronDown } from "lucide-react";
import { SidebarUserMenu } from "./SidebarUserMenu";

interface SidebarFooterProps {
  isCollapsed: boolean
  themeMode: "light" | "dark"
  toggleThemeMode: () => void
  userMenuRef: React.RefObject<HTMLDivElement>
  isUserMenuOpen: boolean
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function SidebarFooter ({ isCollapsed, themeMode, toggleThemeMode, userMenuRef, isUserMenuOpen, setIsUserMenuOpen }: SidebarFooterProps) {
  return (
    <div className={cn("h-[18vh] p-4 flex flex-col justify-between shrink-0 bg-canvas border-t border-hairline", !isCollapsed ? "overflow-y-auto" : "overflow-visible")}>
        {!isCollapsed ? (
          <div className="bg-canvas border border-hairline rounded-md p-2.5 flex flex-col gap-2 shadow-[0px_1px_1px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-warning-deep" />
                <span className="text-[11px] font-medium text-ink">Upgrade to Pro</span>
              </div>
              <span className="text-[9px] bg-warning-soft text-warning-deep border border-warning/10 px-1.5 py-0.5 rounded-full font-mono font-medium">NEW</span>
            </div>
            <button className="button-primary-sm w-full py-1 h-7 rounded-sm text-[11px] font-medium">Start Free Trial</button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button title="Upgrade to Pro" className="w-8 h-8 rounded-full bg-warning-soft hover:bg-warning border border-warning/20 flex items-center justify-center text-warning-deep transition-all">
              <Sparkles size={14} />
            </button>
          </div>
        )}

        {/* Profile with User Dropdown */}
        <SidebarUserMenu 
        isCollapsed={isCollapsed}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
        userMenuRef={userMenuRef}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        />
        
      </div>
  )
}