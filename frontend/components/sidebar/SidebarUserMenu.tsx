import { cn } from "@/lib/utils";
import { Settings, Moon, Sun, ChevronDown } from "lucide-react";
import Link from "next/link";

interface SidebarUserMenuProps {
  isCollapsed: boolean
  themeMode: "light" | "dark"
  toggleThemeMode: () => void
  userMenuRef: React.RefObject<HTMLDivElement>
  isUserMenuOpen: boolean
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function SidebarUserMenu ({ isCollapsed, themeMode, toggleThemeMode, userMenuRef, isUserMenuOpen, setIsUserMenuOpen }: SidebarUserMenuProps) {
  return (
    <div ref={userMenuRef} className="relative pt-1 flex flex-col gap-3">
          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className={cn(
              "absolute z-50 py-1.5 flex flex-col gap-0.5 bg-canvas border border-hairline rounded-lg shadow-lg",
              isCollapsed ? "bottom-0 left-full ml-2 w-[160px]" : "bottom-full left-0 right-0 mb-1 w-full"
            )}>
              <Link
                href="#settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors text-[12px] font-medium"
              >
                <Settings size={12} className="text-mute shrink-0" />
                <span className="text-[13px] font-medium text-ink truncate leading-tight">Settings</span>
              </Link>
              
              <button
                onClick={() => {
                  toggleThemeMode();
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors text-left text-[13px] font-medium w-full"
              >
                {themeMode === "light" ? (
                  <>
                    <Moon size={12} className="text-mute shrink-0" />
                    <span   className="text-[13px] font-medium text-ink truncate leading-tight">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={12} className="text-mute shrink-0" />
                    <span className="text-[13px] font-medium text-ink truncate leading-tight">Light Mode</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              "flex items-center justify-between gap-3 cursor-pointer p-1 rounded-md hover:bg-canvas-soft transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "User Menu" : undefined}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center text-ink font-sans font-semibold text-xs shrink-0">K</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-canvas rounded-full" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-ink truncate leading-tight">Karan</span>
                  <span className="text-[10px] font-mono text-mute truncate leading-none mt-0.5">karan@example.com</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown size={14} className={cn("text-mute transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
            )}
          </div>
        </div>
  )
}