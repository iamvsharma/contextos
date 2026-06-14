import Link from "next/link";
import { SidebarItem } from "@/lib/sidebar-config";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface SidebarNavItemProps {
    item: SidebarItem;
    isCollapsed: boolean;
    isActive: boolean;
    notificationCount: number;
    showStar: boolean;
    toggleFavorite: (path: string) => void;
    isFavorite: (path: string) => boolean;
}

export function SidebarNavItem({ item, isCollapsed, isActive, notificationCount, showStar, toggleFavorite, isFavorite }: SidebarNavItemProps) {
    return (
        <Link
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            className={cn(
                "relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 group/item",
                isCollapsed && "justify-center px-0",
                isActive ? "bg-canvas-soft text-ink font-semibold" : "text-body hover:text-ink hover:bg-canvas-soft-2/50"
            )}
        >
            {isActive && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-sm" />}
            <item.icon size={15} className={cn("transition-colors shrink-0", isActive ? "text-primary" : "text-mute group-hover/item:text-ink")} />
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
}