"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/useThemeStore"
import { topicConfigs, TopicId, getTopicConfig } from "@/lib/sidebar-config"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Settings,
  Search,
  Star,
  Clock,
  Sun,
  Moon,
} from "lucide-react"

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
    enabledTopics,
    toggleTopicEnabled,
  } = useThemeStore()

  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false)
  const [isConfiguringTopics, setIsConfiguringTopics] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const currentTopic = getTopicConfig(selectedTopic)
  const topicSelectorRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  // Track recent items on pathname change
  useEffect(() => {
    if (!hydrated || !pathname || pathname === "/") return
    const allItems = currentTopic?.groups.flatMap((g) => g.items) || []
    const match = allItems.find((item) => item.href === pathname)
    if (match) {
      addRecentItem(match.href, match.label)
    }
  }, [pathname, currentTopic, addRecentItem, hydrated])

  // Keyboard shortcuts
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

  // Close topic selector and user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topicSelectorRef.current && !topicSelectorRef.current.contains(event.target as Node)) {
        setIsTopicSelectorOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset configuring state when selector is closed
  useEffect(() => {
    if (!isTopicSelectorOpen) {
      setIsConfiguringTopics(false)
    }
  }, [isTopicSelectorOpen])

  const handleTopicChange = (topicId: TopicId) => {
    setSelectedTopic(topicId)
    localStorage.setItem("selected-topic", topicId)
    setIsTopicSelectorOpen(false)
  }

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
        <div className="border-b border-hairline">
          {!isCollapsed ? (
            <div className="px-3 py-2.5 flex items-center gap-2">
              {/* Topic Selector Button */}
              <div ref={topicSelectorRef} className="relative flex-1 min-w-0">
                <button
                  onClick={() => setIsTopicSelectorOpen(!isTopicSelectorOpen)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-canvas-soft border border-transparent hover:border-hairline transition-all text-left"
                  aria-label="Select topic"
                  aria-expanded={isTopicSelectorOpen}
                >
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary shrink-0">
                    {currentTopic && <currentTopic.icon size={13} />}
                  </div>
                  <span className="text-[13px] font-medium text-ink truncate flex-1">{currentTopic?.label}</span>
                  <ChevronDown size={11} className={cn("text-mute transition-transform shrink-0", isTopicSelectorOpen && "rotate-180")} />
                </button>

                {isTopicSelectorOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-canvas border border-hairline rounded-lg shadow-lg z-50 py-1 max-h-[340px] overflow-y-auto min-w-[220px]">
                    {!isConfiguringTopics ? (
                      <>
                        <div className="max-h-[260px] overflow-y-auto">
                          {topicConfigs
                            .filter((t) => enabledTopics.includes(t.id))
                            .map((topic) => {
                              const TopicIcon = topic.icon
                              const isSelected = topic.id === selectedTopic
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => handleTopicChange(topic.id)}
                                  className={cn("w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas-soft transition-colors text-left", isSelected && "bg-canvas-soft")}
                                >
                                  <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0", isSelected ? "bg-primary text-on-primary" : "bg-canvas-soft-2 text-mute")}>
                                    <TopicIcon size={11} />
                                  </div>
                                  <span className="text-[13px] font-medium truncate text-ink">{topic.label}</span>
                                  {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                </button>
                              )
                            })}
                        </div>
                        <div className="border-t border-hairline mt-1 pt-1 px-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsConfiguringTopics(true)
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-mute hover:text-ink hover:bg-canvas-soft rounded transition-colors text-left"
                          >
                            <Settings size={12} />
                            <span>Configure Topics...</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-hairline">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsConfiguringTopics(false)
                            }}
                            className="p-1 hover:bg-canvas-soft rounded text-mute hover:text-ink transition-colors"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-[11px] font-semibold font-mono uppercase tracking-wider text-mute">Configure Topics</span>
                        </div>
                        <div className="p-1.5 space-y-1 max-h-[260px] overflow-y-auto">
                          {topicConfigs.map((topic) => {
                            const TopicIcon = topic.icon
                            const isEnabled = enabledTopics.includes(topic.id)
                            const canToggle = !isEnabled || enabledTopics.length > 1
                            return (
                              <div
                                key={topic.id}
                                className="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-canvas-soft-2/45 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded bg-canvas-soft-2 flex items-center justify-center text-mute shrink-0">
                                    <TopicIcon size={10} />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[12px] font-medium text-ink leading-none">{topic.label}</span>
                                    <span className="text-[9px] text-mute truncate mt-0.5 max-w-[130px]">{topic.description}</span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  disabled={!canToggle}
                                  onChange={() => toggleTopicEnabled(topic.id)}
                                  className="rounded border-hairline text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer accent-primary"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collapse Button - clearly separated */}
              <button
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-canvas-soft border border-hairline hover:text-ink text-mute rounded transition-colors shrink-0"
                title="Collapse Sidebar (⌘B)"
                aria-label="Collapse Sidebar"
              >
                <ChevronsLeft size={14} />
              </button>
            </div>
          ) : (
            <div className="px-2 py-2.5 flex flex-col items-center gap-2">
              {/* Collapsed Topic Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsTopicSelectorOpen(!isTopicSelectorOpen)}
                  className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors"
                  title={currentTopic?.label || "Select Topic"}
                  aria-label="Select topic"
                >
                  {currentTopic && <currentTopic.icon size={14} />}
                </button>

                {isTopicSelectorOpen && (
                  <div className="absolute top-0 left-full ml-2 bg-canvas border border-hairline rounded-lg shadow-lg z-50 py-1 w-[180px]">
                    {!isConfiguringTopics ? (
                      <>
                        <div className="max-h-[220px] overflow-y-auto">
                          {topicConfigs
                            .filter((t) => enabledTopics.includes(t.id))
                            .map((topic) => {
                              const TopicIcon = topic.icon
                              const isSelected = topic.id === selectedTopic
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => handleTopicChange(topic.id)}
                                  className={cn("w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas-soft transition-colors text-left", isSelected && "bg-canvas-soft")}
                                >
                                  <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0", isSelected ? "bg-primary text-on-primary" : "bg-canvas-soft-2 text-mute")}>
                                    <TopicIcon size={10} />
                                  </div>
                                  <span className={cn("text-[12px] font-medium truncate", isSelected ? "text-ink" : "text-body")}>{topic.label}</span>
                                  {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                </button>
                              )
                            })}
                        </div>
                        <div className="border-t border-hairline mt-1 pt-1 px-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsConfiguringTopics(true)
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-mute hover:text-ink hover:bg-canvas-soft rounded transition-colors"
                          >
                            <Settings size={11} />
                            <span>Configure...</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 px-2 py-1 border-b border-hairline">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsConfiguringTopics(false)
                            }}
                            className="p-0.5 hover:bg-canvas-soft rounded text-mute hover:text-ink transition-colors"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-mute">Topics</span>
                        </div>
                        <div className="p-1 space-y-0.5 max-h-[200px] overflow-y-auto">
                          {topicConfigs.map((topic) => {
                            const TopicIcon = topic.icon
                            const isEnabled = enabledTopics.includes(topic.id)
                            const canToggle = !isEnabled || enabledTopics.length > 1
                            return (
                              <div
                                key={topic.id}
                                className="flex items-center justify-between gap-1.5 px-1.5 py-1 rounded hover:bg-canvas-soft transition-colors"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-4 h-4 rounded bg-canvas-soft-2 flex items-center justify-center text-mute shrink-0">
                                    <TopicIcon size={9} />
                                  </div>
                                  <span className="text-[11px] font-medium text-ink truncate leading-none">{topic.label}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  disabled={!canToggle}
                                  onChange={() => toggleTopicEnabled(topic.id)}
                                  className="rounded border-hairline text-primary focus:ring-primary h-3 w-3 cursor-pointer accent-primary"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand Button */}
              <button
                onClick={toggleCollapse}
                className="p-1.5 hover:bg-canvas-soft border border-hairline hover:text-ink text-mute rounded transition-colors"
                title="Expand Sidebar (⌘B)"
                aria-label="Expand Sidebar"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed ? (
          <div className="px-3 pt-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md border border-hairline hover:border-hairline-strong bg-canvas-soft hover:bg-canvas-soft-2 transition-colors text-left group"
            >
              <Search size={13} className="text-mute group-hover:text-body shrink-0" />
              <span className="text-[13px] text-mute group-hover:text-body flex-1">Search...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-mono text-mute bg-canvas border border-hairline rounded">⌘K</kbd>
            </button>
          </div>
        ) : (
          <div className="px-1 pt-3 flex justify-center">
            <button onClick={() => setSearchOpen(true)} className="w-8 h-8 rounded-md border border-hairline hover:border-hairline-strong bg-canvas-soft hover:bg-canvas-soft-2 flex items-center justify-center text-mute hover:text-body transition-colors" title="Search (⌘K)">
              <Search size={14} />
            </button>
          </div>
        )}

        {/* Breadcrumb */}
        {!isCollapsed && breadcrumb && (
          <div className="px-6 pt-2">
            <p className="text-[10px] font-mono text-mute truncate">
              {currentTopic?.label} &gt; {breadcrumb.group} &gt; {breadcrumb.page}
            </p>
          </div>
        )}

        {/* Inline Search Filter */}
        {!isCollapsed && searchQuery && (
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
        )}

        {/* Favorites Section */}
        {!isCollapsed && favoriteItems.length > 0 && (
          <div className="py-4 space-y-1.5 px-3">
            <h3 className="px-3.5 text-[10px] font-medium font-mono uppercase tracking-[0.08em] text-mute select-none flex items-center gap-1.5">
              <Star size={10} className="text-amber-500" fill="currentColor" />
              Favorites
            </h3>
            <nav className="space-y-0.5">
              {favoriteItems.map((item, itemIdx) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={`fav-${itemIdx}`}
                    href={item.href}
                    className={cn("relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm transition-all duration-150 group/fav", isActive ? "bg-canvas-soft text-ink font-semibold" : "text-body hover:text-ink hover:bg-canvas-soft-2/50")}
                  >
                    {isActive && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-sm" />}
                    <Icon size={15} className={cn("transition-colors shrink-0", isActive ? "text-primary" : "text-mute")} />
                    <span className="text-[13px] leading-none flex-1">{item.label}</span>
                    <button onClick={(e) => { e.preventDefault(); toggleFavorite(item.href) }} className="opacity-0 group-hover/fav:opacity-100 transition-opacity" title="Remove from favorites">
                      <Star size={12} className="text-amber-500" fill="currentColor" />
                    </button>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Recent Items Section */}
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

        {/* Navigation Groups */}
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
                        <Link
                          key={itemIdx}
                          href={item.href}
                          title={isCollapsed ? item.label : undefined}
                          className={cn(
                            "relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 group/item",
                            isCollapsed && "justify-center px-0",
                            isActive ? "bg-canvas-soft text-ink font-semibold" : "text-body hover:text-ink hover:bg-canvas-soft-2/50"
                          )}
                        >
                          {isActive && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-sm" />}
                          <Icon size={15} className={cn("transition-colors shrink-0", isActive ? "text-primary" : "text-mute group-hover/item:text-ink")} />
                          {!isCollapsed && (
                            <>
                              <span className="text-[13px] leading-none flex-1">{item.label}</span>
                              {notificationCount > 0 && (
                                <span className="min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-semibold rounded-full shrink-0">
                                  {notificationCount > 99 ? "99+" : notificationCount}
                                </span>
                              )}
                              {showStar && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.href) }}
                                  className={cn("opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0", isFavorite(item.href) && "!opacity-100")}
                                  title={isFavorite(item.href) ? "Remove from favorites" : "Add to favorites"}
                                >
                                  <Star size={12} className={cn("transition-colors", isFavorite(item.href) ? "text-amber-500" : "text-mute hover:text-amber-500")} fill={isFavorite(item.href) ? "currentColor" : "none"} />
                                </button>
                              )}
                            </>
                          )}
                          {isCollapsed && notificationCount > 0 && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                        </Link>
                      )
                    })}
                  </nav>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
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
                className="flex items-center gap-2.5 px-3 py-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors text-[13px] font-medium"
              >
                <Settings size={14} className="text-mute shrink-0" />
                <span>Settings</span>
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
                    <Moon size={14} className="text-mute shrink-0" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-mute shrink-0" />
                    <span>Light Mode</span>
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
      </div>
    </aside>
  )
}
