"use client"

import { useState } from "react"
import Link from "next/link"
import { Database, Download, Play, X, BarChart3, Info, Eye, Save, RotateCw } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { SecondaryButtonSm, ActionButtonSm } from "@/components/ui/Button"
import toast from "react-hot-toast"

interface DatasetSummary {
  rows: number
  columns: string[]
  columns_metadata?: Record<string, {
    data_type: string
    null_count: number
    unique_count: number
    min?: number
    max?: number
    mean?: number
  }>
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

interface PreviewModalProps {
  dataset: Dataset | null
  onClose: () => void
  apiUrl: string
  onRefresh?: () => void
}

export function PreviewModal({ dataset, onClose, apiUrl, onRefresh }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "schema" | "metadata">("preview")
  
  // Metadata form state
  const [description, setDescription] = useState(dataset?.description || "")
  const [category, setCategory] = useState(dataset?.category || "")
  const [tagsInput, setTagsInput] = useState(dataset?.tags?.join(", ") || "")
  const [isSaving, setIsSaving] = useState(false)

  // Sync state if dataset changes
  useState(() => {
    if (dataset) {
      setDescription(dataset.description || "")
      setCategory(dataset.category || "")
      setTagsInput(dataset.tags?.join(", ") || "")
    }
  })

  if (!dataset) return null

  const handleSaveMetadata = async () => {
    setIsSaving(true)
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    try {
      const res = await fetch(`${apiUrl}/api/dataset/metadata/${dataset.file_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          category,
          tags: parsedTags,
        }),
      })

      if (!res.ok) throw new Error("Failed to save metadata")
      
      toast.success("Dataset information updated successfully")
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error(err)
      toast.error("Could not update metadata")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-hairline shadow-2xl bg-canvas flex flex-col justify-between rounded-xl transform scale-100 transition-all">
        <div className="space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                <Database size={18} />
              </div>
              <div>
                <h3 className="text-body-sm-strong font-bold text-ink truncate max-w-lg leading-tight">
                  {dataset.file_name}
                </h3>
                <p className="text-[11px] text-mute font-medium mt-0.5">
                  Explore dataset columns, schemas, and live data entries
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-canvas-soft border border-hairline hover:text-ink text-mute rounded-lg transition-all"
              title="Close preview"
            >
              <X size={15} />
            </button>
          </div>

          {/* Statistics Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Total Rows", val: dataset.summary?.rows?.toLocaleString() || "0", bg: "bg-purple-500/5 text-purple-700 border-purple-500/10" },
              { label: "Total Fields", val: dataset.summary?.columns?.length || "0", bg: "bg-blue-500/5 text-blue-700 border-blue-500/10" },
              { label: "File Capacity", val: dataset.summary?.file_size || "0 MB", bg: "bg-emerald-500/5 text-emerald-700 border-emerald-500/10" },
              { label: "Missing Values", val: dataset.summary?.missing_values_percent || "0%", bg: "bg-amber-500/5 text-amber-700 border-amber-500/10" },
            ].map((stat, idx) => (
              <div key={idx} className={`p-3 border rounded-xl flex flex-col items-center justify-center ${stat.bg}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block">{stat.label}</span>
                <span className="text-display-xs font-semibold mt-1 block tracking-tight">{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-hairline gap-2">
            {[
              { id: "preview", label: "Live Data Preview", icon: <Eye size={13} /> },
              { id: "schema", label: "Column Statistics", icon: <BarChart3 size={13} /> },
              { id: "metadata", label: "Edit Information", icon: <Info size={13} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-caption font-bold transition-all ${
                  activeTab === tab.id
                    ? "border-accent-blue text-accent-blue"
                    : "border-transparent text-mute hover:text-ink"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Areas */}
          {activeTab === "preview" && (
            <div className="space-y-3">
              <span className="font-mono text-caption-mono text-mute uppercase tracking-wider text-[10px] block font-semibold">
                Live Data Preview (First 10 Rows)
              </span>
              <div className="border border-hairline rounded-lg overflow-x-auto overflow-y-auto max-h-[300px] bg-canvas shadow-inner">
                <table className="w-full text-left border-collapse text-caption font-semibold">
                  <thead>
                    <tr className="bg-canvas-soft border-b border-hairline text-ink select-none sticky top-0 backdrop-blur-md">
                      <th className="py-2.5 px-3 w-12 border-r border-hairline text-center bg-canvas-soft">#</th>
                      {dataset.summary?.columns?.slice(0, 5).map((col) => (
                        <th key={col} className="py-2.5 px-3 border-r border-hairline bg-canvas-soft truncate max-w-[160px]" title={col}>
                          {col}
                        </th>
                      ))}
                      {dataset.summary?.columns && dataset.summary.columns.length > 5 && (
                        <th className="py-2.5 px-3 text-mute font-medium bg-canvas-soft italic">
                          +{dataset.summary.columns.length - 5} more columns
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {dataset.summary?.sample_preview?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-canvas-soft/30 transition-colors">
                        <td className="py-2.5 px-3 border-r border-hairline text-center text-mute font-mono">
                          {idx + 1}
                        </td>
                        {dataset.summary?.columns?.slice(0, 5).map((col) => (
                          <td key={col} className="py-2.5 px-3 border-r border-hairline max-w-[160px] truncate text-body text-ink font-medium leading-relaxed" title={String(row[col] || "")}>
                            {String(row[col] !== undefined ? row[col] : "")}
                          </td>
                        ))}
                        {dataset.summary?.columns && dataset.summary.columns.length > 5 && (
                          <td className="py-2.5 px-3 text-[10px] text-mute italic bg-canvas-soft/10">
                            ...
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <span className="font-mono text-caption-mono text-mute uppercase tracking-wider text-[10px] block font-semibold">
                Column Profile & Typing Statistics
              </span>
              <div className="border border-hairline rounded-lg overflow-hidden bg-canvas">
                <table className="w-full text-left border-collapse text-caption font-semibold">
                  <thead>
                    <tr className="bg-canvas-soft border-b border-hairline text-ink select-none font-bold">
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Data Type</th>
                      <th className="py-2 px-3 text-right">Unique Values</th>
                      <th className="py-2 px-3 text-right">Missing / Nulls</th>
                      <th className="py-2 px-3 text-right">Ranges (Min / Max / Mean)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline font-mono text-[11px]">
                    {dataset.summary?.columns?.map((col) => {
                      const colMeta = dataset.summary?.columns_metadata?.[col]
                      const totalRows = dataset.summary?.rows || 1
                      const nullCount = colMeta?.null_count ?? 0
                      const nullPercent = ((nullCount / totalRows) * 100).toFixed(1)

                      return (
                        <tr key={col} className="hover:bg-canvas-soft/30 transition-colors">
                          <td className="py-2.5 px-3 text-ink font-bold font-sans">{col}</td>
                          <td className="py-2.5 px-3 text-mute font-bold">{colMeta?.data_type || "object"}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-ink">{colMeta?.unique_count ?? "—"}</td>
                          <td className="py-2.5 px-3 text-right text-amber-600 font-bold">
                            {nullCount > 0 ? `${nullCount} (${nullPercent}%)` : "0 (0.0%)"}
                          </td>
                          <td className="py-2.5 px-3 text-right text-mute">
                            {colMeta?.min !== undefined ? (
                              <span className="text-ink font-bold">
                                {colMeta.min} to {colMeta.max} <span className="text-[9px] text-mute font-normal">(μ: {colMeta.mean})</span>
                              </span>
                            ) : (
                              <span className="italic">non-numeric</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-4 max-w-xl">
              <span className="font-mono text-caption-mono text-mute uppercase tracking-wider text-[10px] block font-semibold">
                Update Dataset Description and Identification Tags
              </span>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-caption font-bold text-ink">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Enter short description about this dataset..."
                    className="form-input py-2 h-auto text-body-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-caption font-bold text-ink">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. E-commerce, Social Media"
                      className="form-input h-9 text-body-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-caption font-bold text-ink">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="sentiment, feedback, public"
                      className="form-input h-9 text-body-sm"
                    />
                  </div>
                </div>
                <ActionButtonSm
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                  className="flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Save Information</span>
                </ActionButtonSm>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 border-t border-hairline pt-4 mt-5">
          <a href={`${apiUrl}/api/dataset/download/${dataset.file_id}`} download>
            <SecondaryButtonSm className="gap-2 px-4">
              <Download size={13} />
              <span>Download file</span>
            </SecondaryButtonSm>
          </a>
          <Link href={`/dataset?file_id=${dataset.file_id}`} onClick={onClose}>
            <ActionButtonSm className="px-4 gap-2">
              <Play size={11} />
              <span>Run Preprocessor Pipeline</span>
            </ActionButtonSm>
          </Link>
        </div>
      </Card>
    </div>
  )
}
