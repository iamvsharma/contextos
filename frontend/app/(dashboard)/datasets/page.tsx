"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, RotateCw, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { ActionButtonSm } from "@/components/ui/Button"

// Reusable Presentation Components
import { DragAndDropUpload } from "@/components/datasets/DragAndDropUpload"
import { ImportFromServices } from "@/components/datasets/ImportFromServices"
import { FilterBar } from "@/components/datasets/FilterBar"
import { ListView } from "@/components/datasets/ListView"
import { DonutChart } from "@/components/datasets/DonutChart"
import { StorageGauge } from "@/components/datasets/StorageGauge"
import { RecentActivity } from "@/components/datasets/RecentActivity"
import { PreviewModal } from "@/components/datasets/PreviewModal"

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

export default function DatasetsManagerPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPreviewDataset, setSelectedPreviewDataset] = useState<Dataset | null>(null)
  
  // Filter and view states
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedSort, setSelectedSort] = useState("Recent")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  
  // Advanced filters state
  const [minRows, setMinRows] = useState("")
  const [maxRows, setMaxRows] = useState("")
  const [minSize, setMinSize] = useState("")
  const [maxSize, setMaxSize] = useState("")
  const [tagFilter, setTagFilter] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dataset/list`)
      if (!res.ok) throw new Error("Failed to load datasets")
      const data = await res.json()
      setDatasets(data)
      if (selectedPreviewDataset) {
        const updated = data.find((d: Dataset) => d.file_id === selectedPreviewDataset.file_id)
        if (updated) {
          setSelectedPreviewDataset(updated)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Could not fetch datasets from backend")
    }
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv' && ext !== 'json' && ext !== 'txt') {
      toast.error("Only CSV, JSON, and TXT files are currently supported")
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const handleDeleteDataset = async (file_id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`${API_URL}/api/dataset/dataset/${file_id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Deletion failed")
      toast.success("Dataset deleted successfully")
      fetchDatasets()
    } catch (err) {
      console.error(err)
      toast.error("Could not delete dataset")
    }
  }

  // Parse helper for MB sizes
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

  // Statistics calculation for sidebar
  const totalCount = datasets.length
  let csvCount = 0
  let jsonCount = 0
  let txtCount = 0
  let pdfCount = 0
  let mdCount = 0
  let othersCount = 0
  let totalSizeMB = 0

  datasets.forEach((d) => {
    const ext = getFileExtension(d.file_name)
    if (ext === "CSV") csvCount++
    else if (ext === "JSON") jsonCount++
    else if (ext === "TXT") txtCount++
    else if (ext === "PDF") pdfCount++
    else if (ext === "MD") mdCount++
    else othersCount++

    totalSizeMB += getMegabytes(d.summary?.file_size || "")
  })

  // Format filters
  const filtered = datasets.filter((d) => {
    const matchesSearch = d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    const ext = getFileExtension(d.file_name)
    const matchesType = selectedType === "All" || ext === selectedType.toUpperCase()
    const status = d.status || "uploaded"
    const matchesStatus =
      selectedStatus === "All" ||
      status.toLowerCase() === selectedStatus.toLowerCase()

    // Row range filter
    const rowCount = d.summary?.rows || 0
    const matchesMinRows = minRows === "" || rowCount >= parseInt(minRows)
    const matchesMaxRows = maxRows === "" || rowCount <= parseInt(maxRows)

    // Size range filter
    const sizeMB = getMegabytes(d.summary?.file_size || "")
    const matchesMinSize = minSize === "" || sizeMB >= parseFloat(minSize)
    const matchesMaxSize = maxSize === "" || sizeMB <= parseFloat(maxSize)

    // Tag filter
    const matchesTag = tagFilter === "" || (d.tags && d.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())))

    return matchesSearch && matchesType && matchesStatus && matchesMinRows && matchesMaxRows && matchesMinSize && matchesMaxSize && matchesTag
  })

  // Sort filters
  const sorted = [...filtered].sort((a, b) => {
    if (selectedSort === "Recent") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    } else if (selectedSort === "Size") {
      return getMegabytes(b.summary?.file_size) - getMegabytes(a.summary?.file_size)
    } else if (selectedSort === "Records") {
      return (b.summary?.rows || 0) - (a.summary?.rows || 0)
    }
    return 0
  })

  // Pagination slice
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize) || 1

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedType("All")
    setSelectedStatus("All")
    setMinRows("")
    setMaxRows("")
    setMinSize("")
    setMaxSize("")
    setTagFilter("")
    setCurrentPage(1)
  }

  return (
    <div className="p-8 space-y-6 pb-12 bg-canvas-soft min-h-screen text-ink font-sans">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-4 bg-canvas/30 backdrop-blur-md sticky top-0 z-10 py-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm font-semibold tracking-tight text-ink">Datasets</h1>
          </div>
          <p className="text-body-sm text-mute mt-1">
            Upload, manage and explore your data files. Use them in pipelines, vector stores, RAG and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".csv,.json,.txt"
            id="global-datasets-upload"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <ActionButtonSm
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 font-medium"
          >
            {isUploading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Upload Dataset</span>
          </ActionButtonSm>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Upload + Controls + Table */}
        <div className="xl:col-span-9 space-y-6">
          
          {/* Top Row: Drag & Drop Upload Zone + Import Services */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <DragAndDropUpload isUploading={isUploading} onUpload={uploadFile} />
            </div>
            <div className="lg:col-span-4">
              <ImportFromServices />
            </div>
          </div>

          {/* Table Controls Bar */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            selectedType={selectedType}
            onTypeChange={(val) => {
              setSelectedType(val)
              setCurrentPage(1)
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(val) => {
              setSelectedStatus(val)
              setCurrentPage(1)
            }}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            minRows={minRows}
            onMinRowsChange={setMinRows}
            maxRows={maxRows}
            onMaxRowsChange={setMaxRows}
            minSize={minSize}
            onMinSizeChange={setMinSize}
            maxSize={maxSize}
            onMaxSizeChange={setMaxSize}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            onClearFilters={handleClearFilters}
          />

          {/* List/Grid View Render */}
          <ListView
            datasets={paginated}
            viewMode={viewMode}
            apiUrl={API_URL}
            onPreview={setSelectedPreviewDataset}
            onDelete={handleDeleteDataset}
          />

          {/* Footer & Pagination Controls */}
          {sorted.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-hairline pt-4 text-caption font-semibold">
              <div className="text-mute">
                Showing <span className="text-ink">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="text-ink">{Math.min(currentPage * pageSize, sorted.length)}</span> of{" "}
                <span className="text-ink">{sorted.length}</span> datasets
              </div>
              
              <div className="flex items-center gap-4">
                {/* Page sizes */}
                <div className="flex items-center gap-1.5">
                  <span className="text-mute font-medium">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="pr-6 pl-2 py-1 border border-hairline rounded bg-canvas font-semibold text-ink outline-none text-[11px]"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>

                {/* Pagination arrows */}
                <div className="flex items-center gap-1 shadow-sm border border-hairline rounded-lg bg-canvas overflow-hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 hover:bg-canvas-soft disabled:opacity-40 disabled:pointer-events-none text-ink border-r border-hairline transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3.5 py-1 text-[11px] font-bold text-ink">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 hover:bg-canvas-soft disabled:opacity-40 disabled:pointer-events-none text-ink border-l border-hairline transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          
          <DonutChart
            txtCount={txtCount}
            csvCount={csvCount}
            pdfCount={pdfCount}
            jsonCount={jsonCount}
            mdCount={mdCount}
            othersCount={othersCount}
            totalCount={totalCount}
            onRefresh={fetchDatasets}
          />

          <StorageGauge
            totalSizeMB={totalSizeMB}
            onUpgrade={() => toast.success("Feature coming soon!")}
          />

          <RecentActivity datasets={datasets} />

        </div>

      </div>

      <PreviewModal
        dataset={selectedPreviewDataset}
        onClose={() => setSelectedPreviewDataset(null)}
        apiUrl={API_URL}
        onRefresh={fetchDatasets}
      />

    </div>
  )
}
