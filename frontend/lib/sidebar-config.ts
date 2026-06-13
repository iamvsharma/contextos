import {
  LayoutDashboard,
  GitBranch,
  Database,
  Smile,
  Terminal,
  Bookmark,
  HardDrive,
  BarChart3,
  Clock,
  GitCompare,
  Settings,
  FileText,
  Search,
  Globe,
  MessageSquare,
  Layers,
  Cpu,
  Zap,
  Brain,
  Workflow,
  Bot,
  Sparkles,
  Target,
  BookOpen,
  Lightbulb,
  Wand2,
  Settings2,
  Share2,
  FileCode,
  FileJson,
  Tags,
  Server,
  Monitor,
  AlertTriangle,
  Play,
  Users,
} from "lucide-react"

export type TopicId =
  | "nlp"
  | "rag"
  | "mcp"
  | "automation"
  | "agents"
  | "agentic-ai"
  | "prompt-engineering"

export interface SidebarItem {
  href: string
  label: string
  icon: any
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

export interface TopicConfig {
  id: TopicId
  label: string
  shortLabel: string
  icon: any
  description: string
  groups: SidebarGroup[]
}

export const topicConfigs: TopicConfig[] = [
  {
    id: "nlp",
    label: "NLP",
    shortLabel: "NLP",
    icon: Brain,
    description: "Natural Language Processing tools and pipelines",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/pipeline", label: "Pipeline Builder", icon: GitBranch },
          { href: "/playground", label: "API Playground", icon: Terminal },
        ],
      },
      {
        title: "NLP Tools",
        items: [
          { href: "/nlp/tokenization", label: "Tokenization", icon: FileCode },
          { href: "/nlp/stemming", label: "Stemming & Lemmatization", icon: GitCompare },
          { href: "/nlp/ner", label: "Named Entity Recognition", icon: Search },
          { href: "/nlp/sentiment", label: "Sentiment Analysis", icon: Smile },
          { href: "/nlp/pos", label: "POS Tagging", icon: Tags },
        ],
      },
      {
        title: "Data",
        items: [
          { href: "/dataset", label: "Dataset Mode", icon: Database },
          { href: "/datasets", label: "Datasets", icon: HardDrive },
          { href: "/social", label: "Social Media Mode", icon: Globe },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Pipelines", icon: Bookmark },
          { href: "#reports", label: "Reports", icon: BarChart3 },
          { href: "#history", label: "History", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "rag",
    label: "RAG",
    shortLabel: "RAG",
    icon: Layers,
    description: "Retrieval-Augmented Generation systems",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/rag/pipeline", label: "RAG Pipeline", icon: GitBranch },
          { href: "/rag/playground", label: "RAG Playground", icon: Terminal },
        ],
      },
      {
        title: "Retrieval",
        items: [
          { href: "/rag/documents", label: "Document Store", icon: FileText },
          { href: "/rag/embeddings", label: "Embeddings", icon: Layers },
          { href: "/rag/vector-db", label: "Vector Database", icon: Database },
          { href: "/rag/search", label: "Semantic Search", icon: Search },
        ],
      },
      {
        title: "Generation",
        items: [
          { href: "/rag/prompts", label: "Prompt Templates", icon: MessageSquare },
          { href: "/rag/context", label: "Context Window", icon: Cpu },
          { href: "/rag/chains", label: "Chain Builder", icon: Workflow },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Configs", icon: Bookmark },
          { href: "#history", label: "Query History", icon: Clock },
          { href: "#compare", label: "Compare Results", icon: GitCompare },
        ],
      },
    ],
  },
  {
    id: "mcp",
    label: "MCP",
    shortLabel: "MCP",
    icon: Cpu,
    description: "Model Context Protocol and integrations",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/mcp/servers", label: "MCP Servers", icon: Server },
          { href: "/mcp/clients", label: "MCP Clients", icon: Monitor },
        ],
      },
      {
        title: "Protocol",
        items: [
          { href: "/mcp/tools", label: "Tool Registry", icon: Settings2 },
          { href: "/mcp/resources", label: "Resource Providers", icon: Database },
          { href: "/mcp/prompts", label: "Prompt Templates", icon: MessageSquare },
          { href: "/mcp/sampling", label: "Sampling Config", icon: Zap },
        ],
      },
      {
        title: "Integrations",
        items: [
          { href: "/mcp/connect", label: "Connect Services", icon: Share2 },
          { href: "/mcp/logs", label: "Connection Logs", icon: FileText },
          { href: "/mcp/testing", label: "Test Console", icon: Terminal },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Configs", icon: Bookmark },
          { href: "#history", label: "Activity Log", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    shortLabel: "Auto",
    icon: Zap,
    description: "Workflow automation and scheduling",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/automation/workflows", label: "Workflow Builder", icon: GitBranch },
          { href: "/automation/trigger", label: "Trigger Config", icon: Zap },
        ],
      },
      {
        title: "Workflows",
        items: [
          { href: "/automation/templates", label: "Templates", icon: FileText },
          { href: "/automation/scheduler", label: "Scheduler", icon: Clock },
          { href: "/automation/batch", label: "Batch Processing", icon: Layers },
          { href: "/automation/webhooks", label: "Webhooks", icon: Globe },
        ],
      },
      {
        title: "Monitoring",
        items: [
          { href: "/automation/logs", label: "Execution Logs", icon: FileText },
          { href: "/automation/errors", label: "Error Tracking", icon: AlertTriangle },
          { href: "/automation/metrics", label: "Performance Metrics", icon: BarChart3 },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Workflows", icon: Bookmark },
          { href: "#history", label: "Run History", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    shortLabel: "Agents",
    icon: Bot,
    description: "Autonomous agent development and management",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/agents/builder", label: "Agent Builder", icon: Bot },
          { href: "/agents/playground", label: "Agent Playground", icon: Terminal },
        ],
      },
      {
        title: "Agent Config",
        items: [
          { href: "/agents/tools", label: "Tool Definitions", icon: Settings2 },
          { href: "/agents/memory", label: "Memory Systems", icon: Database },
          { href: "/agents/planning", label: "Planning Engine", icon: Target },
          { href: "/agents/reasoning", label: "Reasoning Logic", icon: Brain },
        ],
      },
      {
        title: "Deploy",
        items: [
          { href: "/agents/deploy", label: "Deployment", icon: Share2 },
          { href: "/agents/monitoring", label: "Agent Monitoring", icon: BarChart3 },
          { href: "/agents/logs", label: "Agent Logs", icon: FileText },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Agents", icon: Bookmark },
          { href: "#history", label: "Session History", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "agentic-ai",
    label: "Agentic AI",
    shortLabel: "Agentic",
    icon: Sparkles,
    description: "Advanced agentic AI systems and multi-agent orchestration",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/agentic/orchestrator", label: "Orchestrator", icon: Workflow },
          { href: "/agentic/simulator", label: "Agent Simulator", icon: Play },
        ],
      },
      {
        title: "Multi-Agent",
        items: [
          { href: "/agentic/swarm", label: "Agent Swarm", icon: Bot },
          { href: "/agentic/communication", label: "Inter-Agent Comms", icon: MessageSquare },
          { href: "/agentic/collaboration", label: "Collaboration Rules", icon: Users },
          { href: "/agentic/consensus", label: "Consensus Engine", icon: Target },
        ],
      },
      {
        title: "Advanced",
        items: [
          { href: "/agentic/reflection", label: "Self-Reflection", icon: Brain },
          { href: "/agentic/learning", label: "Adaptive Learning", icon: Lightbulb },
          { href: "/agentic/evaluation", label: "Performance Eval", icon: BarChart3 },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Configs", icon: Bookmark },
          { href: "#history", label: "Execution History", icon: Clock },
        ],
      },
    ],
  },
  {
    id: "prompt-engineering",
    label: "Prompt Engineering",
    shortLabel: "Prompts",
    icon: Lightbulb,
    description: "Prompt design, testing, and optimization",
    groups: [
      {
        title: "Develop",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/prompts/builder", label: "Prompt Builder", icon: Wand2 },
          { href: "/prompts/playground", label: "Prompt Playground", icon: Terminal },
        ],
      },
      {
        title: "Prompt Tools",
        items: [
          { href: "/prompts/templates", label: "Template Library", icon: FileText },
          { href: "/prompts/variables", label: "Variable Manager", icon: Settings2 },
          { href: "/prompts/testing", label: "A/B Testing", icon: GitCompare },
          { href: "/prompts/optimization", label: "Optimization", icon: Zap },
        ],
      },
      {
        title: "Analysis",
        items: [
          { href: "/prompts/metrics", label: "Performance Metrics", icon: BarChart3 },
          { href: "/prompts/versioning", label: "Version Control", icon: GitBranch },
          { href: "/prompts/documentation", label: "Documentation", icon: BookOpen },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "#saved", label: "Saved Prompts", icon: Bookmark },
          { href: "#history", label: "Version History", icon: Clock },
        ],
      },
    ],
  },
]

export const getTopicConfig = (topicId: TopicId): TopicConfig | undefined => {
  return topicConfigs.find((t) => t.id === topicId)
}
