"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Database,
  Upload,
  Download,
  Play,
  RotateCw,
  FileText,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Columns,
  Eye,
  Trash2
} from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

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
}

export default function DatasetsManagerPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPreviewDataset, setSelectedPreviewDataset] = useState<Dataset | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dataset/list`)
      if (!res.ok) throw new Error("Failed to load datasets")
      const data = await res.json()
      setDatasets(data)
    } catch (err) {
      console.error(err)
      toast.error("Could not fetch datasets from backend")
    }
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'json') {
      toast.error("Only CSV and JSON files are supported")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${API_URL}/api/dataset/upload`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Failed to upload file")
      }
      toast.success(`Uploaded ${file.name} successfully!`)
      await fetchDatasets()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Error uploading file")
    } finally {
      setIsUploading(false)
    }
  }

  const systemDatasets = datasets.filter(d => d.is_default)
  const userDatasets = datasets.filter(d => !d.is_default)

  const filteredSystem = systemDatasets.filter(d =>
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUser = userDatasets.filter(d =>
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-4 bg-canvas/30 backdrop-blur-md sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm text-ink">Datasets.</h1>
            <Badge variant="default" className="bg-canvas border border-hairline text-ink font-semibold">
              {datasets.length} Total
            </Badge>
          </div>
          <p className="text-body-sm text-mute mt-1">
            Manage your default and uploaded datasets in one central place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv,.json"
            id="datasets-upload-input"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="datasets-upload-input"
            className={`flex items-center justify-center gap-2 bg-accent-blue hover:bg-link-deep text-white shadow-md rounded-md px-3.5 py-2 text-caption font-semibold cursor-pointer transition-all ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploading ? (
              <>
                <RotateCw size={14} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload Dataset</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={15} />
        <input
          type="text"
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full pl-9 pr-4 py-2 border border-hairline rounded-lg focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-caption"
        />
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* System Datasets Section */}
        <div className="space-y-4">
          <h2 className="font-mono text-caption-mono text-ink uppercase tracking-wider">System Default Datasets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSystem.map((dataset) => (
              <Card key={dataset.file_id} className="p-4 border border-hairline hover:border-accent-blue shadow-sm flex flex-col justify-between h-48 transition-all hover:scale-[1.01] duration-150 bg-canvas">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="p-1.5 rounded-lg bg-accent-blue/5 border border-accent-blue/10 text-accent-blue">
                      <Database size={16} />
                    </div>
                    <Badge variant="default" className="text-[10px] bg-canvas-soft border border-hairline text-ink font-semibold">
                      System
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-body-sm-strong font-bold text-ink truncate">{dataset.file_name}</h3>
                    <p className="text-[11px] text-mute flex items-center gap-1.5">
                      <span>{dataset.summary?.file_size}</span>
                      <span>•</span>
                      <span>{dataset.summary?.rows?.toLocaleString()} rows</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-hairline pt-3 mt-4">
                  <button
                    onClick={() => setSelectedPreviewDataset(dataset)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink transition-colors"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <a href={`${API_URL}/api/dataset/download/${dataset.file_id}`} download>
                      <button className="p-1.5 rounded-md hover:bg-canvas-soft border border-hairline text-mute hover:text-ink transition-colors" title="Download original">
                        <Download size={12} />
                      </button>
                    </a>
                    <Link href={`/dataset?file_id=${dataset.file_id}`}>
                      <Button variant="primary-sm" className="py-1 px-2.5 bg-accent-blue text-white rounded-md flex items-center gap-1 hover:bg-link-deep text-caption font-semibold">
                        <Play size={10} />
                        <span>Preprocess</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
            {filteredSystem.length === 0 && (
              <p className="text-caption text-mute italic">No system datasets match your search.</p>
            )}
          </div>
        </div>

        {/* User Uploaded Datasets Section */}
        <div className="space-y-4">
          <h2 className="font-mono text-caption-mono text-ink uppercase tracking-wider">My Uploaded Datasets</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUser.map((dataset) => (
              <Card key={dataset.file_id} className="p-4 border border-hairline hover:border-accent-blue shadow-sm flex flex-col justify-between h-48 transition-all hover:scale-[1.01] duration-150 bg-canvas">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="p-1.5 rounded-lg bg-accent-blue/5 border border-accent-blue/10 text-accent-blue">
                      <FileText size={16} />
                    </div>
                    <Badge variant="default" className="text-[10px] bg-accent-blue/10 text-accent-blue border border-accent-blue/20 uppercase font-semibold">
                      {dataset.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-body-sm-strong font-bold text-ink truncate">{dataset.file_name}</h3>
                    <p className="text-[11px] text-mute flex items-center gap-1.5">
                      <span>{dataset.summary?.file_size}</span>
                      <span>•</span>
                      <span>{dataset.summary?.rows?.toLocaleString()} rows</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-hairline pt-3 mt-4">
                  <button
                    onClick={() => setSelectedPreviewDataset(dataset)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-mute hover:text-ink transition-colors"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <a href={`${API_URL}/api/dataset/download/${dataset.file_id}`} download>
                      <button className="p-1.5 rounded-md hover:bg-canvas-soft border border-hairline text-mute hover:text-ink transition-colors" title="Download original">
                        <Download size={12} />
                      </button>
                    </a>
                    <Link href={`/dataset?file_id=${dataset.file_id}`}>
                      <Button variant="primary-sm" className="py-1 px-2.5 bg-accent-blue text-white rounded-md flex items-center gap-1 hover:bg-link-deep text-caption font-semibold">
                        <Play size={10} />
                        <span>Preprocess</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
            {filteredUser.length === 0 && (
              <div className="col-span-full border border-dashed border-hairline rounded-lg p-8 bg-canvas-soft text-center flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-mute mb-2" />
                <p className="text-body-sm font-semibold text-ink">No uploaded datasets</p>
                <p className="text-caption text-mute mt-0.5">Upload a CSV or JSON file to start bulk preprocessing.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Preview Modal Dialog */}
      {selectedPreviewDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 border border-hairline shadow-2xl bg-canvas flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="text-accent-blue" size={18} />
                  <h3 className="text-body-sm-strong font-bold text-ink truncate max-w-md">{selectedPreviewDataset.file_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedPreviewDataset(null)}
                  className="text-mute hover:text-ink text-caption font-semibold px-2 py-1 rounded hover:bg-canvas-soft transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Statistics Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-canvas-soft p-2.5 border border-hairline rounded-lg text-center">
                  <span className="text-[9px] font-bold text-mute uppercase tracking-wider block">Rows</span>
                  <span className="text-caption font-bold text-ink mt-0.5 block">{selectedPreviewDataset.summary?.rows?.toLocaleString()}</span>
                </div>
                <div className="bg-canvas-soft p-2.5 border border-hairline rounded-lg text-center">
                  <span className="text-[9px] font-bold text-mute uppercase tracking-wider block">Columns</span>
                  <span className="text-caption font-bold text-ink mt-0.5 block">{selectedPreviewDataset.summary?.columns?.length}</span>
                </div>
                <div className="bg-canvas-soft p-2.5 border border-hairline rounded-lg text-center">
                  <span className="text-[9px] font-bold text-mute uppercase tracking-wider block">File Size</span>
                  <span className="text-caption font-bold text-ink mt-0.5 block">{selectedPreviewDataset.summary?.file_size}</span>
                </div>
                <div className="bg-canvas-soft p-2.5 border border-hairline rounded-lg text-center">
                  <span className="text-[9px] font-bold text-mute uppercase tracking-wider block">Missing Cells</span>
                  <span className="text-caption font-bold text-ink mt-0.5 block">{selectedPreviewDataset.summary?.missing_values_percent}</span>
                </div>
              </div>

              {/* Columns List */}
              <div className="space-y-1">
                <span className="font-mono text-caption-mono text-ink uppercase tracking-wider text-[10px] block">Fields Schema</span>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1 border border-hairline-soft rounded bg-canvas-soft">
                  {selectedPreviewDataset.summary?.columns?.map((col) => (
                    <Badge
                      key={col}
                      variant="default"
                      className="text-[10px] py-0.5 px-2 font-mono font-medium transition-colors border bg-canvas text-body border-hairline"
                    >
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Row Preview Table */}
              <div className="space-y-1.5">
                <span className="font-mono text-caption-mono text-ink uppercase tracking-wider text-[10px] block">Data Rows Sample</span>
                <div className="border border-hairline rounded-lg overflow-hidden max-h-[220px] overflow-y-auto bg-canvas">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-canvas-soft border-b border-hairline text-[10px] font-semibold text-ink">
                        <th className="py-2 px-3 w-10 border-r border-hairline text-center">#</th>
                        <th className="py-2 px-3 w-full">Row Data Dictionary Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPreviewDataset.summary?.sample_preview?.map((row, idx) => (
                        <tr key={idx} className="border-b border-hairline last:border-0 hover:bg-canvas-soft/30 transition-colors">
                          <td className="py-2 px-3 border-r border-hairline text-center text-[10px] text-mute font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 text-[11px] font-medium text-body truncate font-mono">
                            {JSON.stringify(row)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-hairline pt-3 mt-4">
              <a href={`${API_URL}/api/dataset/download/${selectedPreviewDataset.file_id}`} download>
                <Button variant="secondary-sm" className="gap-1 flex items-center text-caption font-semibold">
                  <Download size={12} />
                  <span>Download file</span>
                </Button>
              </a>
              <Link href={`/dataset?file_id=${selectedPreviewDataset.file_id}`} onClick={() => setSelectedPreviewDataset(null)}>
                <Button variant="primary-sm" className="bg-accent-blue hover:bg-link-deep text-white px-4 py-2 flex items-center gap-1 text-caption font-semibold">
                  <Play size={10} />
                  <span>Preprocess Dataset</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}
