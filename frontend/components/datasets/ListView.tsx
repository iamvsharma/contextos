"use client"

import Link from "next/link"
import { Eye, Play, Trash2, Download, Table, FileCode, FileText } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ActionButtonSm } from "@/components/ui/Button"

interface DatasetSummary {
  rows: number
  columns: string[]
  missing_values_percent: string
  missing_values_by_column: Record<string, number>
  file_size: string
  encoding: string
  sample_preview: Record<string, any>[]
}

interface Dataset {
  file_id: string
  file_name: string
  file_url: string
  summary: DatasetSummary
  status: string
  is_default?: boolean
  uploaded_by?: string
  created_at?: string
  description?: string
  tags?: string[]
  category?: string
}

interface ListViewProps {
  datasets: Dataset[]
  viewMode: "list" | "grid"
  apiUrl: string
  onPreview: (dataset: Dataset) => void
  onDelete: (file_id: string, name: string) => void
}

export function ListView({
  datasets,
  viewMode,
  apiUrl,
  onPreview,
  onDelete
}: ListViewProps) {
  
  const getMegabytes = (sizeStr: string) => {
    if (!sizeStr) return 0
    const match = sizeStr.match(/([\d.]+)\s*(MB|KB|GB|bytes)/i)
    if (!match) return 0
    const val = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (unit === 'kb') return val / 1024
    if (unit === 'gb') return val * 1024
    if (unit === 'bytes') return val / (1024 * 1024)
    return val
  }

  const getFileExtension = (name: string): string => {
    return name.split('.').pop()?.toUpperCase() || "TXT"
  }

  const renderFileIcon = (ext: string) => {
    switch (ext) {
      case "CSV":
        return <Table className="w-5 h-5 text-emerald-600" />
      case "JSON":
        return <FileCode className="w-5 h-5 text-blue-600" />
      case "PDF":
        return <FileText className="w-5 h-5 text-rose-600" />
      case "MD":
        return <FileText className="w-5 h-5 text-indigo-600" />
      default:
        return <FileText className="w-5 h-5 text-purple-600" />
    }
  }

  const getBadgeColor = (ext: string) => {
    switch (ext) {
      case "CSV":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      case "JSON":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "PDF":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20"
      case "MD":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20"
      default:
        return "bg-purple-500/10 text-purple-700 border-purple-500/20"
    }
  }

  if (viewMode === "list") {
    return (
      <div className="border border-hairline rounded-xl overflow-hidden bg-canvas shadow-[0px_1px_2px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas-soft border-b border-hairline text-caption font-semibold text-mute select-none">
                <th className="py-3 px-4 w-[35%]">Dataset</th>
                <th className="py-3 px-4 w-[10%]">Type</th>
                <th className="py-3 px-4 w-[15%]">Records / Size</th>
                <th className="py-3 px-4 w-[15%]">Uploaded By</th>
                <th className="py-3 px-4 w-[15%]">Created At</th>
                <th className="py-3 px-4 w-[10%]">Status</th>
                <th className="py-3 px-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {datasets.map((dataset) => {
                const ext = getFileExtension(dataset.file_name)
                const isSystem = dataset.is_default || false
                return (
                  <tr key={dataset.file_id} className="hover:bg-canvas-soft/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-canvas border border-hairline shrink-0 shadow-sm">
                          {renderFileIcon(ext)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-body-sm-strong font-bold text-ink truncate block leading-tight">
                            {dataset.file_name}
                          </span>
                          {dataset.description && (
                            <span className="text-[11px] text-mute leading-normal line-clamp-1 block mt-0.5">
                              {dataset.description}
                            </span>
                          )}
                          {dataset.tags && dataset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dataset.tags.map((tag) => (
                                <span key={tag} className="text-[9px] bg-canvas-soft border border-hairline text-mute px-1.5 py-0.2 rounded font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" className={`text-[10px] font-mono font-bold uppercase py-0.5 px-2.5 rounded-md border ${getBadgeColor(ext)}`}>
                        {ext}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-ink">
                      <div>{dataset.summary?.rows?.toLocaleString() || "0"} records</div>
                      <div className="text-[10px] text-mute font-medium mt-0.5">{dataset.summary?.file_size || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-ink">
                        <div className="w-5 h-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-bold text-[9px] flex items-center justify-center uppercase shrink-0">
                          {isSystem ? "S" : (dataset.uploaded_by?.[0] || "U")}
                        </div>
                        <span className="truncate">{isSystem ? "System" : (dataset.uploaded_by || "User")}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-caption text-mute font-mono">
                      {dataset.created_at ? (
                        <>
                          <div className="font-bold text-ink">{new Date(dataset.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div className="text-[10px] font-medium text-mute mt-0.5">{new Date(dataset.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                        </>
                      ) : isSystem ? (
                        "System Preload"
                      ) : (
                        "Uploaded Recently"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" className={`text-[9px] font-bold uppercase rounded px-2 py-0.5 border ${
                        dataset.status === "processed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}>
                        {dataset.status === "processed" ? "Processed" : "Uploaded"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPreview(dataset)}
                          className="p-1.5 hover:bg-canvas-soft border border-hairline text-mute hover:text-ink rounded-md transition-all"
                          title="View preview"
                        >
                          <Eye size={12} />
                        </button>
                        <Link href={`/dataset?file_id=${dataset.file_id}`}>
                          <button
                            className="p-1.5 hover:bg-canvas-soft border border-hairline text-mute hover:text-accent-blue rounded-md transition-all"
                            title="Run Preprocessor Pipeline"
                          >
                            <Play size={12} />
                          </button>
                        </Link>
                        {!isSystem && (
                          <button
                            onClick={() => onDelete(dataset.file_id, dataset.file_name)}
                            className="p-1.5 hover:bg-canvas-soft border border-hairline text-mute hover:text-rose-600 rounded-md transition-all"
                            title="Delete dataset"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {datasets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-caption text-mute italic">
                    No datasets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {datasets.map((dataset) => {
        const ext = getFileExtension(dataset.file_name)
        const isSystem = dataset.is_default || false
        return (
          <Card key={dataset.file_id} className="p-4 border border-hairline hover:border-accent-blue bg-canvas shadow-sm hover:shadow transition-all flex flex-col justify-between min-h-[220px] h-auto">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-canvas border border-hairline shrink-0 shadow-sm">
                  {renderFileIcon(ext)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="default" className={`text-[9px] font-bold uppercase rounded px-2 py-0.5 border ${
                    dataset.status === "processed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  }`}>
                    {dataset.status || "uploaded"}
                  </Badge>
                  <Badge variant="default" className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getBadgeColor(ext)}`}>
                    {ext}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-body-sm-strong font-bold text-ink truncate block leading-tight">
                  {dataset.file_name}
                </h3>
                {dataset.description && (
                  <p className="text-[11px] text-mute mt-1 line-clamp-2 leading-snug">
                    {dataset.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {dataset.category && (
                    <span className="text-[9px] bg-accent-blue/5 border border-accent-blue/15 text-accent-blue px-1.5 py-0.5 rounded font-bold uppercase">
                      {dataset.category}
                    </span>
                  )}
                  {dataset.tags?.map((tag) => (
                    <span key={tag} className="text-[9px] bg-canvas-soft border border-hairline text-mute px-1.5 py-0.5 rounded font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-mute mt-2 flex items-center gap-1 font-mono">
                  <span>{dataset.summary?.rows?.toLocaleString() || "0"} rows</span>
                  <span>•</span>
                  <span>{dataset.summary?.file_size || "—"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-hairline pt-3 mt-4">
              <button
                onClick={() => onPreview(dataset)}
                className="flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink transition-colors"
              >
                <Eye size={12} />
                <span>Preview</span>
              </button>
              <div className="flex items-center gap-1.5">
                <a href={`${apiUrl}/api/dataset/download/${dataset.file_id}`} download>
                  <button className="p-1.5 rounded-md hover:bg-canvas-soft border border-hairline text-mute hover:text-ink transition-all" title="Download">
                    <Download size={12} />
                  </button>
                </a>
                <Link href={`/dataset?file_id=${dataset.file_id}`}>
                  <ActionButtonSm className="gap-1">
                    <Play size={10} />
                    <span>Run</span>
                  </ActionButtonSm>
                </Link>
                {!isSystem && (
                  <button
                    onClick={() => onDelete(dataset.file_id, dataset.file_name)}
                    className="p-1.5 hover:bg-canvas-soft border border-hairline text-mute hover:text-rose-600 rounded-md transition-all"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        )
      })}
      {datasets.length === 0 && (
        <div className="col-span-full border border-dashed border-hairline rounded-xl p-8 bg-canvas text-center">
          <p className="text-caption text-mute italic">No datasets match your filters.</p>
        </div>
      )}
    </div>
  )
}
