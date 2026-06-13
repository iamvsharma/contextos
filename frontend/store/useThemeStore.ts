"use client"

import { create } from "zustand"
import { TopicId } from "@/lib/sidebar-config"

type ColorMode = "colorful" | "grayscale"
type ThemeMode = "light" | "dark"

export interface RecentItem {
  href: string
  label: string
  timestamp: number
}

interface ThemeStore {
  hydrated: boolean
  setHydrated: () => void
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (mode: ColorMode) => void
  themeMode: ThemeMode
  toggleThemeMode: () => void
  setThemeMode: (mode: ThemeMode) => void
  sidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  selectedTopic: TopicId
  setSelectedTopic: (topic: TopicId) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
  favorites: string[]
  toggleFavorite: (href: string) => void
  isFavorite: (href: string) => boolean
  recentItems: RecentItem[]
  addRecentItem: (href: string, label: string) => void
  notifications: Record<string, number>
  setNotification: (href: string, count: number) => void
  collapsedGroups: Record<string, string[]>
  toggleGroupCollapsed: (topicId: string, groupTitle: string) => void
  isGroupCollapsed: (topicId: string, groupTitle: string) => boolean
  enabledTopics: TopicId[]
  toggleTopicEnabled: (topic: TopicId) => void
  hydrateFromStorage: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),

  colorMode: "colorful",
  toggleColorMode: () =>
    set((state) => ({
      colorMode: state.colorMode === "colorful" ? "grayscale" : "colorful",
    })),
  setColorMode: (mode) => set({ colorMode: mode }),

  themeMode: "light",
  toggleThemeMode: () =>
    set((state) => {
      const next = state.themeMode === "light" ? "dark" : "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("theme-mode", JSON.stringify(next))
        document.documentElement.classList.toggle("dark", next === "dark")
      }
      return { themeMode: next }
    }),
  setThemeMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", JSON.stringify(mode))
      document.documentElement.classList.toggle("dark", mode === "dark")
    }
    set({ themeMode: mode })
  },

  sidebarCollapsed: false,
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed", String(next))
      }
      return { sidebarCollapsed: next }
    }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  selectedTopic: "nlp",
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),

  enabledTopics: ["nlp", "rag", "mcp", "automation", "agents", "agentic-ai", "prompt-engineering"],
  toggleTopicEnabled: (topic) =>
    set((state) => {
      const isCurrentlyEnabled = state.enabledTopics.includes(topic)
      let next: TopicId[]
      if (isCurrentlyEnabled) {
        if (state.enabledTopics.length <= 1) return {}
        next = state.enabledTopics.filter((t) => t !== topic)
        if (state.selectedTopic === topic) {
          const remaining = next[0]
          if (remaining) {
            // Need to set timeout or direct callback for selectedTopic
            setTimeout(() => {
              state.setSelectedTopic(remaining)
              localStorage.setItem("selected-topic", remaining)
            }, 0)
          }
        }
      } else {
        next = [...state.enabledTopics, topic]
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("enabled-topics", JSON.stringify(next))
      }
      return { enabledTopics: next }
    }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  favorites: [],
  toggleFavorite: (href) =>
    set((state) => {
      const next = state.favorites.includes(href)
        ? state.favorites.filter((f) => f !== href)
        : [...state.favorites, href]
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-favorites", JSON.stringify(next))
      }
      return { favorites: next }
    }),
  isFavorite: (href) => get().favorites.includes(href),

  recentItems: [],
  addRecentItem: (href, label) =>
    set((state) => {
      const now = Date.now()
      const filtered = state.recentItems.filter((r) => r.href !== href)
      const next = [{ href, label, timestamp: now }, ...filtered].slice(0, 5)
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-recent", JSON.stringify(next))
      }
      return { recentItems: next }
    }),

  notifications: {},
  setNotification: (href, count) =>
    set((state) => {
      const next = { ...state.notifications, [href]: count }
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-notifications", JSON.stringify(next))
      }
      return { notifications: next }
    }),

  collapsedGroups: {},
  toggleGroupCollapsed: (topicId, groupTitle) =>
    set((state) => {
      const current = state.collapsedGroups[topicId] || []
      const next = current.includes(groupTitle)
        ? current.filter((g) => g !== groupTitle)
        : [...current, groupTitle]
      const updated = { ...state.collapsedGroups, [topicId]: next }
      if (typeof window !== "undefined") {
        localStorage.setItem("collapsed-groups", JSON.stringify(updated))
      }
      return { collapsedGroups: updated }
    }),
  isGroupCollapsed: (topicId, groupTitle) => {
    const groups = get().collapsedGroups[topicId] || []
    return groups.includes(groupTitle)
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return
    try {
      const collapsed = localStorage.getItem("sidebar-collapsed")
      const topic = localStorage.getItem("selected-topic") as TopicId | null
      const theme = localStorage.getItem("theme-mode") as "light" | "dark" | null
      const favorites = localStorage.getItem("sidebar-favorites")
      const recent = localStorage.getItem("sidebar-recent")
      const notifications = localStorage.getItem("sidebar-notifications")
      const groups = localStorage.getItem("collapsed-groups")
      const enabledTopics = localStorage.getItem("enabled-topics")

      const updates: Partial<ThemeStore> = { hydrated: true }

      let activeEnabled: TopicId[] = ["nlp", "rag", "mcp", "automation", "agents", "agentic-ai", "prompt-engineering"]
      if (enabledTopics) {
        try {
          const parsed = JSON.parse(enabledTopics)
          if (Array.isArray(parsed) && parsed.length > 0) {
            activeEnabled = parsed
            updates.enabledTopics = parsed
          }
        } catch {}
      } else {
        updates.enabledTopics = activeEnabled
      }

      if (collapsed === "true") updates.sidebarCollapsed = true
      if (topic && ["nlp", "rag", "mcp", "automation", "agents", "agentic-ai", "prompt-engineering"].includes(topic) && activeEnabled.includes(topic)) {
        updates.selectedTopic = topic
      } else {
        updates.selectedTopic = activeEnabled[0]
      }
      if (theme) {
        updates.themeMode = theme
        document.documentElement.classList.toggle("dark", theme === "dark")
      }
      if (favorites) {
        try { updates.favorites = JSON.parse(favorites) } catch {}
      }
      if (recent) {
        try { updates.recentItems = JSON.parse(recent) } catch {}
      }
      if (notifications) {
        try { updates.notifications = JSON.parse(notifications) } catch {}
      } else {
        updates.notifications = { "#reports": 3, "#history": 12, "/automation/errors": 2 }
      }
      if (groups) {
        try { updates.collapsedGroups = JSON.parse(groups) } catch {}
      }

      set(updates)
    } catch {
      set({ hydrated: true })
    }
  },
}))
