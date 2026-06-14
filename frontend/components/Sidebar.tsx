"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/useThemeStore"
import { TopicId, getTopicConfig } from "@/lib/sidebar-config"

import { SidebarHeader } from "./sidebar/sidebarHeader/SidebarHeader"
import { SidebarSearch } from "./sidebar/SidebarSearch"
import { SidebarBreadcrumb } from "./sidebar/SidebarBreadcrumb"
import { SidebarFavorites } from "./sidebar/SidebarFavorites"
import { SidebarRecent } from "./sidebar/SidebarRecent"
import { SidebarNavGroup } from "./sidebar/SidebarNavGroup"
import { SidebarFooter } from "./sidebar/SidebarFooter"

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Sidebar() {
  const pathname = usePathname()
  const {
    hydrated,
    hydrateFromStorage,
    sidebarCollapsed: isCollapsed,
    toggleSidebarCollapsed: toggleCollapse,
    selectedTopic,
    setSelectedTopic,
    searchQuery,
    setSearchQuery,
    setSearchOpen,
    favorites,
    toggleFavorite,
    isFavorite,
    recentItems,
    addRecentItem,
    notifications,
    themeMode,
    toggleThemeMode,
    toggleGroupCollapsed,
    isGroupCollapsed,
  } = useThemeStore()

  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false)
  const [isConfiguringTopics, setIsConfiguringTopics] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const currentTopic = getTopicConfig(selectedTopic)
  const topicSelectorRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

 // 1. Hydrate once (no dependency needed if stable)
useEffect(() => {
  hydrateFromStorage()
}, []) // run only once


// 2. Memoize allItems (avoid recalculating every route change)
const allItems = useMemo(() => {
  return currentTopic?.groups.flatMap((g) => g.items) || []
}, [currentTopic])


// 3. Track recent items efficiently
useEffect(() => {
  if (!hydrated || !pathname || pathname === "/") return

  const match = allItems.find((item) => item.href === pathname)
  if (match) addRecentItem(match.href, match.label)

}, [pathname, hydrated, allItems, addRecentItem])


// 4. Keyboard shortcut (stable handler)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "b") {
      e.preventDefault()
      toggleCollapse()
    }
  }

  document.addEventListener("keydown", handleKeyDown)
  return () => document.removeEventListener("keydown", handleKeyDown)

}, [toggleCollapse])


// 5. Click outside (optimized single check)
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node

    if (
      topicSelectorRef.current &&
      !topicSelectorRef.current.contains(target)
    ) {
      setIsTopicSelectorOpen(false)
    }

    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(target)
    ) {
      setIsUserMenuOpen(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, []) // no deps needed


// 6. Reset configuring state (clean + minimal)
useEffect(() => {
  if (!isTopicSelectorOpen) setIsConfiguringTopics(false)
}, [isTopicSelectorOpen])

  // Filter nav items by search query
  const filteredGroups = useMemo(() => {
    if (!currentTopic) return []
    if (!searchQuery.trim()) return currentTopic.groups
    const lower = searchQuery.toLowerCase()
    return currentTopic.groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => item.label.toLowerCase().includes(lower) || group.title.toLowerCase().includes(lower)
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [currentTopic, searchQuery])

  // Breadcrumb from pathname
  const breadcrumb = useMemo(() => {
    if (!currentTopic) return null
    for (const group of currentTopic.groups) {
      for (const item of group.items) {
        if (item.href === pathname) return { group: group.title, page: item.label }
      }
    }
    if (pathname === "/dashboard") return { group: "Develop", page: "Dashboard" }
    return null
  }, [currentTopic, pathname])

  // Favorite items
  const favoriteItems = useMemo(() => {
    if (!currentTopic) return []
    const allItems = currentTopic.groups.flatMap((g) => g.items)
    return allItems.filter((item) => favorites.includes(item.href) && !item.href.startsWith("#"))
  }, [currentTopic, favorites])

  // Recent items (filtered to current topic)
  const currentRecentItems = useMemo(() => {
    if (!currentTopic) return []
    const allHrefs = new Set(currentTopic.groups.flatMap((g) => g.items.map((i) => i.href)))
    return recentItems.filter((r) => allHrefs.has(r.href))
  }, [currentTopic, recentItems])

  // Show skeleton during SSR / before hydration
  if (!hydrated) {
    return (
      <aside className="bg-canvas text-ink flex flex-col justify-between shrink-0 border-r border-hairline h-screen sticky top-0 font-sans w-[250px]">
        <div className="h-[82vh] flex flex-col overflow-y-auto">
          <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-6 h-6 bg-canvas-soft-2 rounded-sm animate-pulse" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 bg-canvas-soft-2 rounded w-24 animate-pulse" />
                <div className="h-2 bg-canvas-soft-2 rounded w-32 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="py-4 space-y-6 px-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-2 bg-canvas-soft-2 rounded w-16 animate-pulse mx-3.5" />
                <div className="space-y-1">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-7 bg-canvas-soft-2 rounded-sm animate-pulse mx-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "bg-canvas text-ink flex flex-col justify-between shrink-0 border-r border-hairline h-screen sticky top-0 font-sans transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
      aria-label="Main Navigation"
    >
      <div className={cn("h-[82vh] flex flex-col", !isCollapsed ? "overflow-y-auto" : "overflow-visible")}>
        {/* Topic Selector + Collapse Button */}
        <SidebarHeader />

        {/* Search Bar */}
        <SidebarSearch isCollapsed={isCollapsed} setSearchOpen={setSearchOpen} />
        
        {/* Breadcrumb */}
        <SidebarBreadcrumb isCollapsed={isCollapsed} breadcrumb={breadcrumb} currentTopic={currentTopic} />
        

        {/* Inline Search Filter */}
        {/* {!isCollapsed && searchQuery && (
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas-soft rounded-md border border-hairline">
              <Search size={11} className="text-mute" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-mute outline-none"
                placeholder="Filter items..."
                autoFocus
              />
              <button onClick={() => setSearchQuery("")} className="text-mute hover:text-ink text-[10px]">✕</button>
            </div>
          </div>
        )} */}

        {/* Favorites Section */}
        <SidebarFavorites
          isCollapsed={isCollapsed}
          favoriteItems={favoriteItems}
          pathname={pathname}
          toggleFavorite={toggleFavorite}
        />
        

        
        
        
        
        {/* Recent Items Section */}
        <SidebarRecent isCollapsed={isCollapsed} currentRecentItems={currentRecentItems} formatTimeAgo={formatTimeAgo} />

        {/* Navigation Groups */}
        <SidebarNavGroup
          isCollapsed={isCollapsed}
          favoriteItems={favoriteItems}
          currentRecentItems={currentRecentItems}
          searchQuery={searchQuery}
          toggleGroupCollapsed={toggleGroupCollapsed}
          isGroupCollapsed={isGroupCollapsed}
          pathname={pathname}
          notifications={notifications}
          toggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          filteredGroups={filteredGroups}
          selectedTopic={selectedTopic}
        />
      </div>

      {/* Sidebar Footer */}
      <SidebarFooter 
        isCollapsed={isCollapsed}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        userMenuRef={userMenuRef}
      />
    </aside>
  )
}
