
import { TopicId } from "@/lib/sidebar-config"

interface Breadcrumb {
  group: string
  page: string
}

interface TopicConfig {
  id: TopicId
  label: string
  icon: any
}

interface SidebarBreadcrumbProps {
  isCollapsed: boolean
  breadcrumb: Breadcrumb | null
  currentTopic: TopicConfig | undefined
}

export function SidebarBreadcrumb({ isCollapsed, breadcrumb, currentTopic }: SidebarBreadcrumbProps) { 
  return (
    <>
    {!isCollapsed && breadcrumb && currentTopic && (
          <div className="px-6 pt-2">
            <p className="text-[10px] font-mono text-mute truncate">
              {currentTopic.label} &gt; {breadcrumb.group} &gt; {breadcrumb.page}
            </p>
          </div>
        )}
    </>
  ) 
}

