"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

const navItems = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/dataset", label: "Dataset" },
  { href: "/social", label: "Social" },
  { href: "/insights", label: "Insights" },
  { href: "/playground", label: "Playground" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="h-16 bg-canvas border-b border-hairline-soft sticky top-0 z-50">
      <div className="max-w-content mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ink font-display text-card-title tracking-tight">
          <span className="w-7 h-7 bg-inverse-canvas rounded-md flex items-center justify-center text-inverse-ink text-caption font-bold">
            N
          </span>
          <span className="hidden sm:inline">NLP Preprocessor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-body-sm transition-colors duration-150 rounded-md",
                pathname === item.href || pathname.startsWith(item.href)
                  ? "text-ink bg-surface-1"
                  : "text-ink-muted hover:text-ink hover:bg-surface-1/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/playground" className="text-body-sm text-ink-muted hover:text-ink hidden sm:block transition-colors">
            API
          </Link>
          <Link href="/dashboard">
            <Button variant="nav-login">
              Log in
            </Button>
          </Link>
          <Link href="/pipeline">
            <Button variant="nav-signup">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
