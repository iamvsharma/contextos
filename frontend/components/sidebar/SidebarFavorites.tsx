import { SidebarItem } from "@/lib/sidebar-config";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";

interface SidebarFavoritesProps {
  isCollapsed: boolean
  favoriteItems: Array<SidebarItem>
  pathname: string
  toggleFavorite: (href: string) => void
}

export function SidebarFavorites({ isCollapsed, favoriteItems, pathname, toggleFavorite }: SidebarFavoritesProps){
  return (
    <>
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
    </>
  )
}

