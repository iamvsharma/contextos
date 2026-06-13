"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/useThemeStore"
import { topicConfigs, TopicId, getTopicConfig } from "@/lib/sidebar-config"
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Settings,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const {
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed,
    toggleSidebarCollapsed: toggleCollapse,
    selectedTopic,
    setSelectedTopic,
  } = useThemeStore()

  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false)
  const currentTopic = getTopicConfig(selectedTopic)
  const topicSelectorRef = useRef<HTMLDivElement>(null)

  // Load configuration from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") {
      setSidebarCollapsed(true)
    }
    const savedTopic = localStorage.getItem("selected-topic") as TopicId | null
    if (savedTopic && topicConfigs.some((t) => t.id === savedTopic)) {
      setSelectedTopic(savedTopic)
    }
  }, [setSidebarCollapsed, setSelectedTopic])

  // Close topic selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        topicSelectorRef.current &&
        !topicSelectorRef.current.contains(event.target as Node)
      ) {
        setIsTopicSelectorOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleTopicChange = (topicId: TopicId) => {
    setSelectedTopic(topicId)
    localStorage.setItem("selected-topic", topicId)
    setIsTopicSelectorOpen(false)
  }

  return (
    <aside
      className={cn(
        "bg-canvas text-ink flex flex-col justify-between shrink-0 border-r border-hairline min-h-screen font-sans transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
      aria-label="Main Navigation"
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Topic Selector + Top Hide/Show Button */}
        <div className={cn("px-4 py-3 border-b border-hairline flex items-center justify-between gap-2", isCollapsed && "px-2.5 justify-center flex-col gap-3")}>
          <div ref={topicSelectorRef} className={cn("flex items-center gap-2.5 min-w-0 select-none relative", isCollapsed ? "justify-center" : "flex-1")}>
            {!isCollapsed ? (
              <div className="relative flex-1">
                <button
                  onClick={() => setIsTopicSelectorOpen(!isTopicSelectorOpen)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-canvas-soft border border-transparent hover:border-hairline transition-all text-left"
                  aria-label="Select topic"
                  aria-expanded={isTopicSelectorOpen}
                >
                  <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-on-primary shrink-0">
                    {currentTopic && <currentTopic.icon size={14} />}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-ink truncate leading-normal">
                      {currentTopic?.label || "Select Topic"}
                    </span>
                    <span className="text-[10px] text-mute font-mono leading-none truncate">
                      {currentTopic?.description || "Choose a topic"}
                    </span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "text-mute transition-transform shrink-0",
                      isTopicSelectorOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Topic Dropdown */}
                {isTopicSelectorOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-canvas border border-hairline rounded-lg shadow-lg z-50 py-1.5 max-h-[300px] overflow-y-auto">
                    {topicConfigs.map((topic) => {
                      const TopicIcon = topic.icon
                      const isSelected = topic.id === selectedTopic
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicChange(topic.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas-soft transition-colors text-left",
                            isSelected && "bg-canvas-soft"
                          )}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center shrink-0",
                              isSelected
                                ? "bg-primary text-on-primary"
                                : "bg-canvas-soft-2 text-mute"
                            )}
                          >
                            <TopicIcon size={12} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-[13px] font-medium truncate leading-normal",
                                isSelected ? "text-ink" : "text-body"
                              )}
                            >
                              {topic.label}
                            </span>
                            <span className="text-[10px] text-mute font-mono leading-none truncate">
                              {topic.description}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsTopicSelectorOpen(!isTopicSelectorOpen)}
                  className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors"
                  title={currentTopic?.label || "Select Topic"}
                  aria-label="Select topic"
                >
                  {currentTopic && <currentTopic.icon size={14} />}
                </button>

                {/* Collapsed Topic Dropdown */}
                {isTopicSelectorOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-canvas border border-hairline rounded-lg shadow-lg z-50 py-1.5 w-[200px]">
                    {topicConfigs.map((topic) => {
                      const TopicIcon = topic.icon
                      const isSelected = topic.id === selectedTopic
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicChange(topic.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-canvas-soft transition-colors text-left",
                            isSelected && "bg-canvas-soft"
                          )}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center shrink-0",
                              isSelected
                                ? "bg-primary text-on-primary"
                                : "bg-canvas-soft-2 text-mute"
                            )}
                          >
                            <TopicIcon size={12} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-[13px] font-medium truncate leading-normal",
                                isSelected ? "text-ink" : "text-body"
                              )}
                            >
                              {topic.label}
                            </span>
                            <span className="text-[10px] text-mute font-mono leading-none truncate">
                              {topic.description}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-1.5 hover:bg-canvas-soft border border-hairline hover:text-ink text-mute rounded transition-colors shrink-0",
              isCollapsed && "w-7 h-7 flex items-center justify-center"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="py-4 space-y-6">
          {currentTopic?.groups.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className={cn("space-y-1.5 px-3", isCollapsed && "px-1 text-center")}
            >
              {!isCollapsed ? (
                <h3 className="px-3.5 text-[10px] font-medium font-mono uppercase tracking-[0.08em] text-mute select-none">
                  {group.title}
                </h3>
              ) : (
                <div className="h-[1px] bg-hairline-soft my-3 mx-2" aria-hidden="true" />
              )}
              <nav className="space-y-0.5">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href) && item.href !== "#"

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                        isCollapsed && "justify-center px-0",
                        isActive
                          ? "bg-canvas-soft text-ink font-semibold"
                          : "text-body hover:text-ink hover:bg-canvas-soft-2/50"
                      )}
                    >
                      {/* Left indicator marker */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-sm"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        size={15}
                        className={cn(
                          "transition-colors shrink-0",
                          isActive ? "text-primary" : "text-mute group-hover:text-ink"
                        )}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <span className="text-[13px] leading-none">{item.label}</span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 space-y-4 shrink-0 bg-canvas border-t border-hairline">
        {/* Pro Plan Card - Subtle Vercel stark layout */}
        {!isCollapsed ? (
          <div className="bg-canvas border border-hairline rounded-md p-4 flex flex-col gap-3 shadow-[0px_1px_1px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-warning-deep" aria-hidden="true" />
                <span className="text-[12px] font-medium text-ink">Upgrade to Pro</span>
              </div>
              <span className="text-[10px] bg-warning-soft text-warning-deep border border-warning/10 px-1.5 py-0.5 rounded-full font-mono font-medium">
                NEW
              </span>
            </div>
            <p className="text-[12px] text-body leading-relaxed">
              Unlock team collaboration, custom pipelines, and parallel preprocessors.
            </p>
            <button className="button-primary-sm w-full py-1 h-8 rounded-sm text-[12px] font-medium">
              Start Free Trial
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              title="Upgrade to Pro"
              className="w-8 h-8 rounded-full bg-warning-soft hover:bg-warning border border-warning/20 flex items-center justify-center text-warning-deep transition-all"
            >
              <Sparkles size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Settings Link */}
        <div className={cn(isCollapsed && "flex justify-center")}>
          <Link
            href="#settings"
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm transition-all duration-150 text-body hover:text-ink hover:bg-canvas-soft-2/50",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings size={15} className="text-mute shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="text-[13px] leading-none">Settings</span>}
          </Link>
        </div>

        {/* Profile */}
        <div className="pt-1 flex flex-col gap-3">
          <div className={cn("flex items-center justify-between gap-3", isCollapsed && "justify-center")}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center text-ink font-sans font-semibold text-xs shrink-0"
                aria-hidden="true"
              >
                K
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-ink truncate leading-tight">
                    Karan
                  </span>
                  <span className="text-[10px] font-mono text-mute truncate leading-none mt-0.5">
                    karan@example.com
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                className="text-mute hover:text-ink p-1 rounded focus-visible:ring-2 focus-visible:ring-black"
                aria-label="Open User Menu"
              >
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
