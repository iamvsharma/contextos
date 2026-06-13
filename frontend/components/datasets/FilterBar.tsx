"use client"

import { useState } from "react"
import { Search, Grid, List, SlidersHorizontal, RefreshCw } from "lucide-react"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  selectedStatus: string
  onStatusChange: (val: string) => void
  selectedSort: string
  onSortChange: (val: string) => void
  viewMode: "list" | "grid"
  onViewModeChange: (val: "list" | "grid") => void

  // Advanced filters
  minRows: string
  onMinRowsChange: (val: string) => void
  maxRows: string
  onMaxRowsChange: (val: string) => void
  minSize: string
  onMinSizeChange: (val: string) => void
  maxSize: string
  onMaxSizeChange: (val: string) => void
  tagFilter: string
  onTagFilterChange: (val: string) => void
  onClearFilters: () => void
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  minRows,
  onMinRowsChange,
  maxRows,
  onMaxRowsChange,
  minSize,
  onMinSizeChange,
  maxSize,
  onMaxSizeChange,
  tagFilter,
  onTagFilterChange,
  onClearFilters
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-3 bg-canvas border border-hairline rounded-xl p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={14} />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input w-full pl-8 pr-3 py-1.5 border border-hairline rounded-md bg-canvas focus:border-accent-blue outline-none transition-all text-caption"
            />
          </div>

          {/* Types filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-semibold text-ink focus:border-accent-blue outline-none text-caption"
          >
            <option value="All">All Types</option>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
            <option value="TXT">TXT</option>
            <option value="PDF">PDF</option>
            <option value="MD">MD</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-semibold text-ink focus:border-accent-blue outline-none text-caption"
          >
            <option value="All">All Status</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Processed">Processed</option>
            <option value="Configured">Configured</option>
          </select>

          {/* Toggle Advanced */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md font-semibold text-caption transition-all ${
              showAdvanced || minRows || maxRows || minSize || maxSize || tagFilter
                ? "border-accent-blue bg-accent-blue/5 text-accent-blue"
                : "border-hairline text-mute hover:text-ink"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          
          {/* Sorting */}
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-semibold text-ink focus:border-accent-blue outline-none text-caption"
          >
            <option value="Recent">Sort by: Recently Added</option>
            <option value="Size">Sort by: Size</option>
            <option value="Records">Sort by: Records</option>
          </select>

          {/* Layout Switcher */}
          <div className="flex items-center border border-hairline rounded-md bg-canvas overflow-hidden shrink-0 shadow-sm">
            <button 
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 hover:bg-canvas-soft transition-colors border-r border-hairline ${
                viewMode === "grid" ? "bg-canvas-soft text-ink" : "text-mute"
              }`}
              title="Grid view"
            >
              <Grid size={14} />
            </button>
            <button 
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 hover:bg-canvas-soft transition-colors ${
                viewMode === "list" ? "bg-canvas-soft text-ink" : "text-mute"
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t border-hairline pt-3 mt-3 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in duration-200">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-mute block">Row Range</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minRows}
                onChange={(e) => onMinRowsChange(e.target.value)}
                className="form-input h-8 px-2 text-[11px]"
              />
              <span className="text-mute text-caption font-bold">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxRows}
                onChange={(e) => onMaxRowsChange(e.target.value)}
                className="form-input h-8 px-2 text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-mute block">Size Range (MB)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.01"
                placeholder="Min"
                value={minSize}
                onChange={(e) => onMinSizeChange(e.target.value)}
                className="form-input h-8 px-2 text-[11px]"
              />
              <span className="text-mute text-caption font-bold">—</span>
              <input
                type="number"
                step="0.01"
                placeholder="Max"
                value={maxSize}
                onChange={(e) => onMaxSizeChange(e.target.value)}
                className="form-input h-8 px-2 text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-mute block">Tag Filter</label>
            <input
              type="text"
              placeholder="e.g. sentiment, public"
              value={tagFilter}
              onChange={(e) => onTagFilterChange(e.target.value)}
              className="form-input h-8 text-[11px]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center gap-1 w-full h-8 border border-dashed border-hairline rounded hover:border-ink hover:text-ink text-mute text-[11px] font-bold transition-all"
            >
              <RefreshCw size={11} />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
