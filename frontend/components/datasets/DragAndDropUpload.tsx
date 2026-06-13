"use client"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DragAndDropUploadProps {
  isUploading: boolean
  onUpload: (file: File) => void
}

export function DragAndDropUpload({ isUploading, onUpload }: DragAndDropUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none bg-canvas hover:border-accent-blue/60 ${
        dragActive ? "border-accent-blue bg-accent-blue/5 scale-[0.99]" : "border-hairline-strong"
      }`}
    >
      <input
        type="file"
        accept=".csv,.json,.txt"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="w-12 h-12 rounded-full bg-accent-blue/5 border border-accent-blue/10 flex items-center justify-center text-accent-blue mb-4">
        <Upload className="w-6 h-6 animate-pulse" />
      </div>
      <p className="text-body-sm-strong font-semibold text-ink">
        Drag & drop files here or <span className="text-accent-blue hover:underline">click to browse</span>
      </p>
      <p className="text-[11px] text-mute mt-1.5 max-w-sm leading-relaxed">
        Supports: .csv, .json, .txt (Max 1GB per file)
      </p>
      <Button 
        variant="secondary-sm" 
        className="mt-4 border-hairline hover:bg-canvas-soft bg-canvas text-caption px-4 font-semibold shadow-sm"
      >
        Upload Files
      </Button>
    </div>
  )
}
