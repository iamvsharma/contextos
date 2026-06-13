"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/useThemeStore"
import { topicConfigs, getTopicConfig } from "@/lib/sidebar-config"
import { Search, ArrowRight, Command, CornerDownLeft } from "lucide-react"

interface SearchableItem {
  href: string
  label: string
  group: string
  topic: string
  topicLabel: string
  icon: any
}

export function SearchModal() {
  const router = useRouter()
  const { isSearchOpen, setSearchOpen } = useThemeStore()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allItems = useMemo(() => {
    const items: SearchableItem[] = []
    topicConfigs.forEach((topic) => {
      topic.groups.forEach((group) => {
        group.items.forEach((item) => {
          if (!item.href.startsWith("#")) {
            items.push({
              href: item.href,
              label: item.label,
              group: group.title,
              topic: topic.id,
              topicLabel: topic.label,
              icon: item.icon,
            })
          }
        })
      })
    })
    return items
  }, [])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10)
    const lower = query.toLowerCase()
    return allItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(lower) ||
          item.group.toLowerCase().includes(lower) ||
          item.topicLabel.toLowerCase().includes(lower)
      )
      .slice(0, 10)
  }, [query, allItems])

  useEffect(() => {
    if (isSearchOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isSearchOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(!isSearchOpen)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isSearchOpen, setSearchOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault()
      router.push(filteredItems[selectedIndex].href)
      setSearchOpen(false)
    }
  }

  const handleSelect = (href: string) => {
    router.push(href)
    setSearchOpen(false)
  }

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  if (!isSearchOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => setSearchOpen(false)}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="relative w-full max-w-[560px] mx-4 bg-canvas border border-hairline rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search navigation"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
          <Search size={16} className="text-mute shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, tools, features..."
            className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-mute outline-none"
            aria-label="Search"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-mute bg-canvas-soft border border-hairline rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-body-sm text-mute">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={`${item.topic}-${item.href}`}
                  href={item.href}
                  onClick={() => handleSelect(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors",
                    index === selectedIndex
                      ? "bg-canvas-soft text-ink"
                      : "text-body hover:bg-canvas-soft hover:text-ink"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="w-7 h-7 rounded-md bg-canvas-soft-2 border border-hairline flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-body" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{item.label}</p>
                    <p className="text-[10px] text-mute font-mono truncate">
                      {item.topicLabel} &gt; {item.group}
                    </p>
                  </div>
                  {index === selectedIndex && (
                    <CornerDownLeft size={12} className="text-mute shrink-0" />
                  )}
                </Link>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-hairline text-[10px] text-mute font-mono">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-hairline rounded bg-canvas-soft">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-hairline rounded bg-canvas-soft">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-hairline rounded bg-canvas-soft">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}
