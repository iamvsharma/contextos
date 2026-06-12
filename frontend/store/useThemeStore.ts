"use client"

import { create } from "zustand"

type ColorMode = "colorful" | "grayscale"

interface ThemeStore {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (mode: ColorMode) => void
  sidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  colorMode: "colorful",
  toggleColorMode: () =>
    set((state) => ({
      colorMode: state.colorMode === "colorful" ? "grayscale" : "colorful",
    })),
  setColorMode: (mode) => set({ colorMode: mode }),

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
}))
