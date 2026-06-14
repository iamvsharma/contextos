import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/useThemeStore"

import { SidebarHeader } from "@/components/sidebar/SidebarHeader"
import { SidebarSearch } from "@/components/sidebar/SidebarSearch"
import { SidebarBreadcrumb } from "@/components/sidebar/SidebarBreadcrumb"
import { SidebarFavorites } from "@/components/sidebar/SidebarFavorites"
import { SidebarRecent } from "@/components/sidebar/SidebarRecent"
import { SidebarNav } from "@/components/sidebar/SidebarNav"
import { SidebarFooter } from "@/components/sidebar/SidebarFooter"
import { SidebarSkeleton } from "@/components/sidebar/SidebarSkeleton"

export function Sidebar() {
  const { hydrated, sidebarCollapsed } = useThemeStore()

  if (!hydrated) return <SidebarSkeleton />

  return (
    <aside className={cn(
      "flex flex-col h-screen border-r transition-all",
      sidebarCollapsed ? "w-[70px]" : "w-[250px]"
    )}>
      
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto">
        <SidebarSearch />
        <SidebarBreadcrumb />
        <SidebarFavorites />
        <SidebarRecent />
        <SidebarNav />
      </div>

      <SidebarFooter />
    </aside>
  )
}