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
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

const saveToStorage = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
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
      saveToStorage("theme-mode", next)
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark")
      }
      return { themeMode: next }
    }),
  setThemeMode: (mode) => {
    saveToStorage("theme-mode", mode)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", mode === "dark")
    }
    set({ themeMode: mode })
  },

  sidebarCollapsed: false,
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.sidebarCollapsed
      saveToStorage("sidebar-collapsed", String(next))
      return { sidebarCollapsed: next }
    }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  selectedTopic: "nlp",
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  favorites: loadFromStorage<string[]>("sidebar-favorites", []),
  toggleFavorite: (href) =>
    set((state) => {
      const next = state.favorites.includes(href)
        ? state.favorites.filter((f) => f !== href)
        : [...state.favorites, href]
      saveToStorage("sidebar-favorites", next)
      return { favorites: next }
    }),
  isFavorite: (href) => get().favorites.includes(href),

  recentItems: loadFromStorage<RecentItem[]>("sidebar-recent", []),
  addRecentItem: (href, label) =>
    set((state) => {
      const now = Date.now()
      const filtered = state.recentItems.filter((r) => r.href !== href)
      const next = [{ href, label, timestamp: now }, ...filtered].slice(0, 5)
      saveToStorage("sidebar-recent", next)
      return { recentItems: next }
    }),

  notifications: loadFromStorage<Record<string, number>>("sidebar-notifications", {
    "#reports": 3,
    "#history": 12,
    "/automation/errors": 2,
  }),
  setNotification: (href, count) =>
    set((state) => {
      const next = { ...state.notifications, [href]: count }
      saveToStorage("sidebar-notifications", next)
      return { notifications: next }
    }),

  collapsedGroups: loadFromStorage<Record<string, string[]>>("collapsed-groups", {}),
  toggleGroupCollapsed: (topicId, groupTitle) =>
    set((state) => {
      const current = state.collapsedGroups[topicId] || []
      const next = current.includes(groupTitle)
        ? current.filter((g) => g !== groupTitle)
        : [...current, groupTitle]
      const updated = { ...state.collapsedGroups, [topicId]: next }
      saveToStorage("collapsed-groups", updated)
      return { collapsedGroups: updated }
    }),
  isGroupCollapsed: (topicId, groupTitle) => {
    const groups = get().collapsedGroups[topicId] || []
    return groups.includes(groupTitle)
  },
}))
