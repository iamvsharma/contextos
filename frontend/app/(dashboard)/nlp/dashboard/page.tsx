"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  FileText,
  Calendar,
  SlidersHorizontal,
  Play,
  Settings,
  MoreVertical,
  Layers,
  CheckCircle,
  Database,
  RefreshCw,
  GitBranch,
  BarChart3,
  TrendingUpIcon,
  FileSpreadsheet,
  FileJson,
  FileType,
} from "lucide-react"
import { DateRangePicker, DateRangePreset } from "@/components/ui/DateRangePicker"
import { useThemeStore } from "@/store/useThemeStore"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Rectangle,
} from "recharts"

const activityData = [
  { name: "May 15", val: 500000 },
  { name: "May 16", val: 700000 },
  { name: "May 17", val: 1200000 },
  { name: "May 18", val: 850050 },
  { name: "May 19", val: 900000 },
  { name: "May 20", val: 750000 },
  { name: "May 21", val: 400000 },
]

const operationsData = [
  { name: "Lowercase", value: 2.1, percentage: "24%" },
  { name: "Remove URLs", value: 1.8, percentage: "21%" },
  { name: "Remove Emojis", value: 1.6, percentage: "18%" },
  { name: "Remove Punctuation", value: 1.4, percentage: "16%" },
  { name: "Tokenization", value: 1.2, percentage: "14%" },
  { name: "Others", value: 0.6, percentage: "7%" },
]

const colorSchemes = {
  colorful: [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f59e0b", // amber
    "#10b981", // emerald
    "#f43f5e", // rose
  ],
  grayscale: [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#cccccc",
    "#eaeaea",
  ],
}

const fileTypeConfig: Record<string, { icon: typeof FileText; color: string; bg: string; grayColor: string; grayBg: string }> = {
  CSV: { icon: FileSpreadsheet, color: "text-emerald-700", bg: "bg-emerald-500/10", grayColor: "text-ink", grayBg: "bg-canvas-soft-2" },
  JSON: { icon: FileJson, color: "text-amber-700", bg: "bg-amber-500/10", grayColor: "text-body", grayBg: "bg-canvas-soft-2" },
  XLS: { icon: FileSpreadsheet, color: "text-green-700", bg: "bg-green-500/10", grayColor: "text-ink", grayBg: "bg-canvas-soft-2" },
  XLSX: { icon: FileSpreadsheet, color: "text-green-700", bg: "bg-green-500/10", grayColor: "text-ink", grayBg: "bg-canvas-soft-2" },
  TXT: { icon: FileType, color: "text-slate-700", bg: "bg-slate-500/10", grayColor: "text-body", grayBg: "bg-canvas-soft-2" },
  default: { icon: FileText, color: "text-gray-700", bg: "bg-gray-500/10", grayColor: "text-body", grayBg: "bg-canvas-soft-2" },
}

function Sparkline({ data, color = "#000000" }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ x: i, y: v }))
  return (
    <div className="w-16 h-6 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.2} fill={`url(#grad-${color})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardPage() {
  const [metricFilter, setMetricFilter] = useState("Texts Processed")
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [dateRange, setDateRange] = useState<{ preset: DateRangePreset; start?: string; end?: string }>({
    preset: "1w",
  })
  const { colorMode } = useThemeStore()
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)

  return (
    <div className="space-y-6 p-8 pb-10">
      <div>
        <h1 className="text-headline text-ink font-semibold tracking-tight text-balance">
          Welcome back
        </h1>
        <p className="text-body-sm text-body mt-1">
          Here&apos;s what&apos;s happening with your pipelines and data today.
        </p>
      </div>

      {/* Date filter strip */}
      <div className="flex items-center justify-between bg-canvas border border-hairline rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center gap-2 text-body-sm text-ink font-medium">
          <Calendar size={15} className="text-mute" aria-hidden="true" />
          <span>Analytics Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button className="px-3 py-1.5 border border-hairline rounded-lg text-caption font-medium text-body bg-canvas hover:bg-canvas-soft transition-colors flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-ink">
            <SlidersHorizontal size={12} className="text-mute" aria-hidden="true" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 tabular-nums">
        {[
          { label: "Texts Processed", val: "1.24M", change: "+18.6%", up: true },
          { label: "Tokens Generated", val: "18.7M", change: "+16.3%", up: true },
          { label: "Words Processed", val: "2.36M", change: "+14.8%", up: true },
          { label: "Noise Removed", val: "78%", change: "+6.2%", up: true },
          { label: "Pipelines Run", val: "342", change: "+12.1%", up: true },
          { label: "Processing Time", val: "24h 36m", change: "-8.3%", up: false },
        ].map((card) => (
          <div key={card.label} className="bg-canvas border border-hairline rounded-lg p-4 shadow-sm space-y-2 flex flex-col justify-between hover:border-hairline-strong transition-colors">
            <div className="text-eyebrow font-medium uppercase tracking-wider text-mute text-blue-500">
              {card.label}
            </div>
            <div className="text-display-sm text-ink font-semibold leading-none">
              {card.val}
            </div>
            <div className="flex items-center gap-1 text-caption font-medium">
              {card.up ? (
                <span className={`flex items-center px-1.5 py-0.5 rounded ${
                  colorMode === "colorful"
                    ? "text-green-700 bg-green-500/10"
                    : "text-ink bg-canvas-soft-2"
                }`}>
                  <ArrowUpRight size={10} className="mr-0.5" aria-hidden="true" />
                  {card.change}
                </span>
              ) : (
                <span className={`flex items-center px-1.5 py-0.5 rounded ${
                  colorMode === "colorful"
                    ? "text-red-700 bg-red-500/10"
                    : "text-body bg-canvas-soft-2"
                }`}>
                  <ArrowDownRight size={10} className="mr-0.5" aria-hidden="true" />
                  {card.change}
                </span>
              )}
              <span className="text-mute leading-none">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Processing Activity Chart */}
        <div className="lg:col-span-8 bg-canvas border border-hairline rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <h3 className="text-body-sm font-medium text-ink">Processing Activity</h3>
              <p className="text-caption text-mute">Daily summary of text data clean operations</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Chart Type Toggle */}
              <div className="flex items-center bg-canvas-soft border border-hairline rounded-md p-0.5">
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === "bar"
                      ? "bg-canvas text-ink shadow-sm border border-hairline"
                      : "text-mute hover:text-body"
                  }`}
                  title="Bar Chart"
                  aria-label="Switch to bar chart"
                >
                  <BarChart3 size={14} />
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === "line"
                      ? "bg-canvas text-ink shadow-sm border border-hairline"
                      : "text-mute hover:text-body"
                  }`}
                  title="Line Chart"
                  aria-label="Switch to line chart"
                >
                  <TrendingUpIcon size={14} />
                </button>
              </div>

              <button className="px-2.5 py-1.5 border border-hairline rounded-lg text-caption font-medium text-body bg-canvas hover:bg-canvas-soft flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-ink">
                <span>{metricFilter}</span>
                <ChevronDown size={11} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradientColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="barGradientGray" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000000" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#000000" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} className="tabular-nums" />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#eaeaea",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#000000",
                    }}
                  />
                  <Bar dataKey="val" fill={colorMode === "colorful" ? "url(#barGradientColor)" : "url(#barGradientGray)"} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              ) : (
                <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradientColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="areaGradientGray" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} className="tabular-nums" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#eaeaea",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#000000",
                    }}
                  />
                  <Area type="monotone" dataKey="val" stroke={colorMode === "colorful" ? "#3b82f6" : "#000000"} strokeWidth={2} fillOpacity={1} fill={colorMode === "colorful" ? "url(#areaGradientColor)" : "url(#areaGradientGray)"} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Operations Used Circular Graph */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-lg p-5 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-body-sm font-medium text-ink">Top Operations Used</h3>
            <button className="text-ink text-caption font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ink rounded">View All</button>
          </div>

          <div className="relative flex items-center justify-center h-[160px]">
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-eyebrow text-mute uppercase tracking-wider leading-none">Total</span>
              {activePieIndex !== null ? (
                <>
                  <span className="text-body font-semibold text-ink tabular-nums mt-0.5">{operationsData[activePieIndex].value}M</span>
                  <span className="text-caption text-mute leading-none mt-0.5">{operationsData[activePieIndex].name}</span>
                </>
              ) : (
                <>
                  <span className="text-body font-semibold text-ink tabular-nums mt-0.5">8.7M</span>
                  <span className="text-eyebrow text-mute leading-none mt-0.5">Operations</span>
                </>
              )}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#eaeaea",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#000000",
                    padding: "6px 10px",
                  }}
                  formatter={(value: number, name: string) => [`${value}M`, name]}
                  itemStyle={{ padding: 0 }}
                />
                <Pie
                  data={operationsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={activePieIndex !== null ? 78 : 72}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  animationDuration={200}
                >
                  {operationsData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colorSchemes[colorMode][index]}
                      fillOpacity={
                        activePieIndex === null
                          ? colorMode === "colorful" ? 0.85 : 1
                          : activePieIndex === index
                            ? 1
                            : 0.35
                      }
                      stroke={activePieIndex === index ? colorSchemes[colorMode][index] : "none"}
                      strokeWidth={activePieIndex === index ? 2 : 0}
                      style={{ cursor: "pointer", transition: "fill-opacity 200ms, stroke 200ms" }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline-soft pt-4 tabular-nums">
            {operationsData.map((op, index) => (
              <div
                key={op.name}
                className="flex items-center gap-2 min-w-0 rounded-md px-1 py-0.5 transition-colors"
                style={{
                  backgroundColor: activePieIndex === index
                    ? `${colorSchemes[colorMode][index]}10`
                    : "transparent",
                }}
                onMouseEnter={() => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                  style={{
                    backgroundColor: colorSchemes[colorMode][index],
                    opacity: activePieIndex === null
                      ? colorMode === "colorful" ? 0.85 : 1
                      : activePieIndex === index ? 1 : 0.35,
                  }}
                />
                <span className="text-caption font-medium text-body truncate flex-1">{op.name}</span>
                <span className="text-caption font-semibold text-ink shrink-0">{op.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Metrics/Activity Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Datasets */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-medium text-ink">Recent Datasets</h3>
            <button className="text-ink text-caption font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ink rounded">View All</button>
          </div>

          <div className="space-y-2 tabular-nums">
            {[
              { name: "Customer_Reviews_May.csv", size: "2.4 MB", rows: "125K rows", type: "CSV", time: "2 hours ago" },
              { name: "Social_Media_Comments.json", size: "1.8 MB", rows: "98K rows", type: "JSON", time: "Yesterday" },
              { name: "Support_Tickets_Apr.csv", size: "5.1 MB", rows: "210K rows", type: "CSV", time: "2 days ago" },
              { name: "Product_Inventory.xlsx", size: "3.7 MB", rows: "156K rows", type: "XLSX", time: "3 days ago" },
              { name: "Survey_Responses.json", size: "1.2 MB", rows: "87K rows", type: "JSON", time: "1 week ago" },
            ].map((file, i) => {
              const cfg = fileTypeConfig[file.type] || fileTypeConfig.default
              const Icon = cfg.icon
              const isColorful = colorMode === "colorful"
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-hairline hover:bg-canvas-soft transition-all group cursor-pointer">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-hairline/50 ${isColorful ? cfg.bg : cfg.grayBg}`}>
                    <Icon size={16} className={isColorful ? cfg.color : cfg.grayColor} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-caption font-medium text-ink truncate leading-tight group-hover:text-ink">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-eyebrow text-mute">{file.rows}</span>
                      <span className="text-eyebrow text-mute">·</span>
                      <span className="text-eyebrow text-mute">{file.size}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-px w-10 text-center rounded ${isColorful ? `${cfg.bg} ${cfg.color}` : `${cfg.grayBg} ${cfg.grayColor}`}`}>
                      {file.type}
                    </span>
                    <span className="text-[10px] text-mute">{file.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Text Insights (All Time) */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-medium text-ink">Text Insights <span className="text-caption text-mute font-normal">(All Time)</span></h3>
            <button className="text-ink text-caption font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ink rounded">View Report</button>
          </div>

          <div className="space-y-2.5 tabular-nums">
            {[
              { label: "Average Words per Text", val: "12.6", change: "5.2%", up: true, trend: [10, 11, 11.5, 12, 12.6] },
              { label: "Average Characters per Text", val: "68.3", change: "4.1%", up: true, trend: [62, 63, 65, 66, 68.3] },
              { label: "Unique Words", val: "512.4K", change: "7.3%", up: true, trend: [480, 490, 500, 505, 512.4] },
              { label: "Stop Words Removed", val: "36.7%", change: "3.6%", up: true, trend: [34, 35, 35.5, 36, 36.7] },
              { label: "Duplicate Lines Removed", val: "12.4%", change: "2.1%", up: true, trend: [11.5, 11.8, 12, 12.1, 12.4] },
            ].map((insight, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-hairline-soft bg-canvas-soft hover:bg-canvas-soft-2 hover:border-hairline transition-colors">
                <div className="space-y-0.5">
                  <div className="text-eyebrow font-medium text-mute uppercase tracking-wider">{insight.label}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-caption font-medium text-ink">{insight.val}</span>
                    <span className="text-eyebrow font-medium text-ink bg-canvas-soft-2 px-1 rounded flex items-center">
                      <ArrowUpRight size={8} className="mr-0.5" aria-hidden="true" />
                      {insight.change}
                    </span>
                  </div>
                </div>
                <Sparkline data={insight.trend} color="#000000" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-4 bg-canvas border border-hairline rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-medium text-ink">Recent Activity</h3>
            <button className="text-ink text-caption font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ink rounded">View All</button>
          </div>

          <div className="relative pl-4 border-l border-hairline ml-1.5 space-y-4">
            {[
              { title: 'Pipeline "Customer Feedback Cleaner" executed', desc: "Successfully cleaned 125,430 text rows in 2m 5s", time: "2 hours ago", icon: Play, iconColor: "text-ink bg-canvas-soft border-hairline" },
              { title: 'Dataset "Customer_Reviews_May.csv" uploaded', desc: "File size 12.4 MB · Encoding UTF-8", time: "2 hours ago", icon: Database, iconColor: "text-ink bg-canvas-soft border-hairline" },
              { title: 'Pipeline "Social Media Text Cleaner" executed', desc: "Processed 56,120 posts with 92% pipeline health score", time: "Yesterday", icon: Play, iconColor: "text-ink bg-canvas-soft border-hairline" },
              { title: 'Pipeline "Product Review Pipeline" saved', desc: "Updated step sequence config and description parameters", time: "2 days ago", icon: Settings, iconColor: "text-ink bg-canvas-soft border-hairline" },
              { title: 'Report generated for "Customer Feedback Cleaner"', desc: "Vocabulary richness and sentiment summary report export ready", time: "2 days ago", icon: FileText, iconColor: "text-ink bg-canvas-soft border-hairline" },
            ].map((act, i) => {
              const Icon = act.icon
              return (
                <div key={i} className="relative">
                  <span className={`absolute -left-[24px] top-0.5 w-5 h-5 rounded border flex items-center justify-center ${act.iconColor}`} aria-hidden="true">
                    <Icon size={10} />
                  </span>

                  <div className="space-y-0.5">
                    <h4 className="text-caption font-medium text-ink leading-tight">
                      {act.title}
                    </h4>
                    <p className="text-caption text-body leading-relaxed" dangerouslySetInnerHTML={{ __html: act.desc }} />
                    <span className="text-eyebrow font-medium text-mute block pt-0.5 tabular-nums">
                      {act.time}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
