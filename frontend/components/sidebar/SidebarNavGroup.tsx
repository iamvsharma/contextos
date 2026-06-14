import { SidebarGroup, SidebarItem } from "@/lib/sidebar-config"
import { cn } from "@/lib/utils"
import { RecentItem } from "@/store/useThemeStore"
import { ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { SidebarNavItem } from "./SidebarNavItem"

interface SidebarNavGroupProps {
  isCollapsed: boolean
  favoriteItems: Array<SidebarItem>
  currentRecentItems: Array<RecentItem>
  searchQuery: string
  toggleGroupCollapsed: (selectedTopic: string, groupTitle: string) => void
  isGroupCollapsed: (selectedTopic: string, groupTitle: string) => boolean
  pathname: string
  notifications: Record<string, number>
  toggleFavorite: (path: string) => void
  isFavorite: (path: string) => boolean
  filteredGroups: Array<SidebarGroup>
  selectedTopic: string
}

export function SidebarNavGroup ({ isCollapsed, favoriteItems, currentRecentItems, searchQuery, toggleGroupCollapsed, isGroupCollapsed, pathname, notifications, toggleFavorite, isFavorite, filteredGroups, selectedTopic}: SidebarNavGroupProps) {
  return (
    <>
    <div className={cn("space-y-6", !isCollapsed && (favoriteItems.length > 0 || currentRecentItems.length > 0 || searchQuery) ? "pt-2 pb-4" : "py-4")}>
          {filteredGroups.map((group, groupIdx) => {
            const isGroupOpen = !isGroupCollapsed(selectedTopic, group.title)
            return (
              <div key={groupIdx} className={cn("space-y-1.5 px-3", isCollapsed && "px-1 text-center")}>
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroupCollapsed(selectedTopic, group.title)}
                    className="w-full flex items-center justify-between px-3.5 group/header hover:bg-canvas-soft-2/30 rounded-sm transition-colors"
                  >
                    <h3 className="text-[10px] font-medium font-mono uppercase tracking-[0.08em] text-mute select-none">{group.title}</h3>
                    <ChevronRight size={10} className={cn("text-mute transition-transform duration-200", isGroupOpen && "rotate-90")} />
                  </button>
                ) : (
                  <div className="h-[1px] bg-hairline-soft my-3 mx-2" aria-hidden="true" />
                )}

                {(isCollapsed || isGroupOpen) && (
                  <nav className="space-y-0.5">
                    {group.items.map((item, itemIdx) => {
                      const Icon = item.icon
                      const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href) && item.href !== "#"
                      const notificationCount = notifications[item.href] || 0
                      const showStar = !item.href.startsWith("#")

                      return (
                        <SidebarNavItem 
                          key={itemIdx}
                          item={item}
                          isCollapsed={isCollapsed}
                          isActive={isActive}
                          notificationCount={notificationCount}
                          showStar={showStar}
                          toggleFavorite={toggleFavorite}
                          isFavorite={isFavorite}
                        />
                      )
                    })}
                  </nav>
                )}
              </div>
            )
          })}
        </div>
    </>
  )
}
