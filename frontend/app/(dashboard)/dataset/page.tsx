"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Upload,
  Database,
  ArrowRight,
  Sparkles,
  ChevronDown,
  FileText,
  Clock,
  Check,
  Download,
  Play,
  RotateCw,
  Sliders,
  Sparkle,
  Layers,
  Search,
  Eye,
  Grid,
  List,
  ChevronRight,
  MoreVertical,
  HelpCircle
} from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { usePipelineStore } from "@/store/usePipelineStore"

interface PipelineStep {
  name: string
  desc: string
}

interface MockPipeline {
  id: string
  name: string
  description: string
  stepsCount: number
  runs: string
  lastUsed: string
  recommended: boolean
  category: string
  creator: {
    name: string
    avatar: string
    date: string
  }
  color: string
  steps: PipelineStep[]
  tags: string[]
}

const mockPipelines: MockPipeline[] = [
  {
    id: "social-media-clean",
    name: "Social Media Cleaner",
    description: "Perfect for social media text with emojis, mentions, hashtags, slang and URLs.",
    stepsCount: 8,
    runs: "~125K+",
    lastUsed: "2 days ago",
    recommended: true,
    category: "Social",
    creator: { name: "Karan", avatar: "K", date: "2 days ago" },
    color: "purple",
    steps: [
      { name: "Lowercase", desc: "Convert text to lowercase" },
      { name: "Remove URLs", desc: "Remove links and URLs" },
      { name: "Remove Mentions", desc: "Remove @mentions" },
      { name: "Remove Hashtags", desc: "Remove #hashtags" },
      { name: "Remove Emojis", desc: "Remove emoji characters" },
      { name: "Remove Punctuation", desc: "Remove punctuation marks" },
      { name: "Tokenization", desc: "Split text into tokens" },
      { name: "Remove Stopwords", desc: "Remove common stopwords" },
    ],
    tags: ["Social", "Cleaning", "NLP"]
  },
  {
    id: "customer-feedback",
    name: "Customer Feedback Pipeline",
    description: "Ideal for customer reviews and feedback data to extract clean insights.",
    stepsCount: 7,
    runs: "~80K+",
    lastUsed: "Yesterday",
    recommended: true,
    category: "Reviews",
    creator: { name: "Ananya", avatar: "A", date: "5 days ago" },
    color: "red",
    steps: [
      { name: "Lowercase", desc: "Convert text to lowercase" },
      { name: "Spelling Correction", desc: "Correct common typos" },
      { name: "Remove Punctuation", desc: "Remove punctuation marks" },
      { name: "Remove Stopwords", desc: "Remove common stopwords" },
      { name: "Lemmatization", desc: "Convert words to base forms" },
      { name: "Sentiment Analyzer", desc: "Add polarity scores" },
    ],
    tags: ["E-commerce", "Reviews", "Sentiment"]
  },
  {
    id: "general-cleaner",
    name: "General Text Cleaner",
    description: "Best for general purpose text cleaning and normalization.",
    stepsCount: 6,
    runs: "~200K+",
    lastUsed: "3 days ago",
    recommended: true,
    category: "General",
    creator: { name: "Sarthak", avatar: "S", date: "1 week ago" },
    color: "blue",
    steps: [
      { name: "Lowercase", desc: "Convert text to lowercase" },
      { name: "Remove Punctuation", desc: "Remove punctuation marks" },
      { name: "Remove Stopwords", desc: "Remove common stopwords" },
      { name: "Lemmatization", desc: "Convert words to base forms" },
    ],
    tags: ["Basic", "Fast", "General"]
  },
  {
    id: "news-processor",
    name: "News Text Processor",
    description: "Clean and normalize news articles.",
    stepsCount: 9,
    runs: "~45K+",
    lastUsed: "2 weeks ago",
    recommended: false,
    category: "NLP",
    creator: { name: "Karan", avatar: "K", date: "2 days ago" },
    color: "pink",
    steps: [
      { name: "Lowercase", desc: "Convert text to lowercase" },
      { name: "Remove HTML Tags", desc: "Strip article tags" },
      { name: "Remove Punctuation", desc: "Remove punctuation" },
      { name: "NER Tagger", desc: "Extract entity tags" }
    ],
    tags: ["News", "Cleaning", "NLP"]
  },
  {
    id: "legal-normalizer",
    name: "Legal Document Normalizer",
    description: "Normalize legal documents and contracts.",
    stepsCount: 10,
    runs: "~15K+",
    lastUsed: "1 month ago",
    recommended: false,
    category: "Formal",
    creator: { name: "Rohit", avatar: "R", date: "1 week ago" },
    color: "green",
    steps: [
      { name: "Lowercase", desc: "Convert text to lowercase" },
      { name: "Remove Numbers", desc: "Strip digit sequences" },
      { name: "Remove Stopwords", desc: "Filter out stopwords" }
    ],
    tags: ["Legal", "Formal", "Normalization"]
  },
  {
    id: "multilingual-processor",
    name: "Multilingual Text Processor",
    description: "Handle multilingual text and normalize unicode.",
    stepsCount: 11,
    runs: "~30K+",
    lastUsed: "2 weeks ago",
    recommended: false,
    category: "NLP",
    creator: { name: "Karan", avatar: "K", date: "2 weeks ago" },
    color: "purple",
    steps: [
      { name: "Unicode Normalizer", desc: "Normalize characters" },
      { name: "Language Detection", desc: "Filter non-target" }
    ],
    tags: ["Multilingual", "Unicode", "Normalization"]
  }
];

interface DatasetSummary {
  rows: number
  columns: string[]
  missing_values_percent: string
  missing_values_by_column: Record<string, number>
  file_size: string
  encoding: string
  sample_preview: Record<string, any>[]
}

interface DatasetConfig {
  selected_column: string
  header_row: boolean
  data_type_detect: boolean
  remove_empty: boolean
  remove_duplicates: boolean
  row_limit: string
}

interface Dataset {
  file_id: string
  file_name: string
  file_url: string
  summary: DatasetSummary
  status: string
  config: DatasetConfig
}

function DatasetPageContent() {
  const { steps: pipelineSteps } = usePipelineStore()
  const searchParams = useSearchParams()
  const fileIdParam = searchParams.get("file_id")
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("")
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  
  const [selectedPipeline, setSelectedPipeline] = useState("social-media-clean")
  const [activeStep, setActiveStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processResult, setProcessResult] = useState<any[] | null>(null)

  // Pipeline Filter States
  const [pipelineSearchQuery, setPipelineSearchQuery] = useState("")
  const [pipelineCategory, setPipelineCategory] = useState("All")
  const [pipelineCreator, setPipelineCreator] = useState("All")
  const [pipelineSort, setPipelineSort] = useState("Recent")
  const [selectedPipelinePreviewId, setSelectedPipelinePreviewId] = useState("social-media-clean")

  // Configuration States
  const [selectedColumn, setSelectedColumn] = useState("")
  const [headerRow, setHeaderRow] = useState(true)
  const [dataTypeDetect, setDataTypeDetect] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [rowLimit, setRowLimit] = useState("")

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

  // Sync with search parameter if provided
  useEffect(() => {
    if (fileIdParam && datasets.length > 0) {
      setSelectedDatasetId(fileIdParam)
    }
  }, [fileIdParam, datasets])

  // Sync selected dataset when id changes
  useEffect(() => {
    if (selectedDatasetId) {
      const ds = datasets.find(d => d.file_id === selectedDatasetId)
      if (ds) {
        setSelectedDataset(ds)
        setSelectedColumn(ds.config?.selected_column || ds.summary?.columns?.[0] || "")
        setHeaderRow(ds.config?.header_row ?? true)
        setDataTypeDetect(ds.config?.data_type_detect ?? true)
        setRemoveEmpty(ds.config?.remove_empty ?? true)
        setRemoveDuplicates(ds.config?.remove_duplicates ?? false)
        setRowLimit(ds.config?.row_limit || "")
      }
    } else {
      setSelectedDataset(null)
    }
  }, [selectedDatasetId, datasets])

  const saveConfiguration = async (updatedFields: Partial<DatasetConfig>) => {
    if (!selectedDatasetId || !selectedDataset) return

    const newConfig = {
      selected_column: updatedFields.selected_column ?? selectedColumn,
      header_row: updatedFields.header_row ?? headerRow,
      data_type_detect: updatedFields.data_type_detect ?? dataTypeDetect,
      remove_empty: updatedFields.remove_empty ?? removeEmpty,
      remove_duplicates: updatedFields.remove_duplicates ?? removeDuplicates,
      row_limit: updatedFields.row_limit ?? rowLimit,
    }

    try {
      const res = await fetch(`${API_URL}/api/dataset/config/${selectedDatasetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      })
      if (!res.ok) throw new Error("Failed to update config")
      
      setDatasets(prev => prev.map(d => d.file_id === selectedDatasetId ? { ...d, config: newConfig } : d))
      toast.success("Configuration updated")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save configuration")
    }
  }

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
      const newDataset = await res.json()
      toast.success(`Uploaded ${file.name} successfully!`)
      
      await fetchDatasets()
      setSelectedDatasetId(newDataset.file_id)
      setActiveStep(1)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Error uploading file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessDataset = async () => {
    if (!selectedDatasetId) {
      toast.error("Please upload or select a dataset first")
      return
    }

    setIsProcessing(true)
    try {
      let formattedSteps = []
      if (selectedPipeline === "social-media-clean") {
        formattedSteps = [
          { type: "lowercase", enabled: true, config: {} },
          { type: "remove_urls", enabled: true, config: {} },
          { type: "remove_mentions", enabled: true, config: {} },
          { type: "remove_hashtags", enabled: true, config: {} },
          { type: "handle_emojis", enabled: true, config: {} },
          { type: "remove_punctuation", enabled: true, config: {} },
          { type: "tokenize", enabled: true, config: {} },
          { type: "remove_stopwords", enabled: true, config: {} }
        ]
      } else if (selectedPipeline === "customer-feedback") {
        formattedSteps = [
          { type: "lowercase", enabled: true, config: {} },
          { type: "remove_punctuation", enabled: true, config: {} },
          { type: "remove_stopwords", enabled: true, config: {} },
          { type: "lemmatize", enabled: true, config: {} }
        ]
      } else if (selectedPipeline === "general-cleaner") {
        formattedSteps = [
          { type: "lowercase", enabled: true, config: {} },
          { type: "remove_punctuation", enabled: true, config: {} },
          { type: "remove_stopwords", enabled: true, config: {} }
        ]
      } else if (selectedPipeline === "news-processor") {
        formattedSteps = [
          { type: "lowercase", enabled: true, config: {} },
          { type: "remove_punctuation", enabled: true, config: {} }
        ]
      } else if (selectedPipeline === "legal-normalizer") {
        formattedSteps = [
          { type: "lowercase", enabled: true, config: {} },
          { type: "remove_numbers", enabled: true, config: {} },
          { type: "remove_stopwords", enabled: true, config: {} }
        ]
      } else if (selectedPipeline === "multilingual-processor") {
        formattedSteps = [
          { type: "normalize_whitespace", enabled: true, config: {} }
        ]
      } else {
        // Fallback to active editor pipeline steps
        formattedSteps = pipelineSteps.map(s => ({
          type: s.type,
          enabled: s.enabled,
          config: s.config || {}
        }))
      }

      const res = await fetch(`${API_URL}/api/dataset/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: selectedDatasetId,
          column: selectedColumn,
          steps: formattedSteps
        })
      })

      if (!res.ok) throw new Error("Processing job failed")
      const data = await res.json()
      
      if (data.status === "completed" || data.status === "processed") {
        setProcessResult(data.result)
        toast.success("Dataset processed successfully!")
        setActiveStep(4)
      } else {
        throw new Error("Job execution status not completed")
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to process dataset")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!selectedDatasetId) {
        toast.error("Please select or upload a dataset first")
        return
      }
      setActiveStep(2)
    } else if (activeStep === 2) {
      setActiveStep(3)
    } else if (activeStep === 3) {
      handleProcessDataset()
    }
  }

  const selectedPipelinePreview = mockPipelines.find(p => p.id === selectedPipelinePreviewId) || mockPipelines[0];

  return (
    <div className="p-8 space-y-6 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-3 bg-canvas/30 backdrop-blur-md sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm text-ink">Dataset Mode.</h1>
            <span className="bg-accent-blue/10 text-accent-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-accent-blue/20">
              Bulk Engine
            </span>
          </div>
          <p className="text-body-sm text-mute mt-1">
            Analyze, configure and run preprocessing pipelines on large text files in bulk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeStep > 1 && activeStep < 4 && (
            <Button
              variant="secondary-sm"
              onClick={() => setActiveStep(activeStep - 1)}
              className="text-caption font-semibold"
            >
              Back
            </Button>
          )}
          {activeStep < 4 && (
            <Button
              variant="primary-sm"
              onClick={handleNextStep}
              disabled={isProcessing}
              className="gap-2 bg-accent-blue hover:bg-link-deep text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 duration-200"
            >
              {isProcessing ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeStep === 1 ? "Next: Select Pipeline" : activeStep === 2 ? "Next: Preview & Process" : "Process Dataset"}
                  </span>
                  <ArrowRight size={14} aria-hidden="true" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Premium Steps Stepper */}
      <div className="relative bg-canvas-soft border border-hairline rounded-lg p-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:px-4 relative">
          {[
            { step: 1, label: "Upload & Configure" },
            { step: 2, label: "Select Pipeline" },
            { step: 3, label: "Preview & Process" },
            { step: 4, label: "Results & Export" },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center gap-2 w-full md:w-auto z-20">
              <div className="flex items-center gap-3 shrink-0">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-caption font-semibold transition-all duration-300 ${
                  activeStep === item.step
                    ? "bg-accent-blue text-white shadow-[0_0_12px_rgba(0,112,243,0.4)]"
                    : activeStep > item.step
                    ? "bg-ink text-canvas"
                    : "bg-canvas text-mute border border-hairline"
                }`}>
                  {activeStep > item.step ? <Check size={14} /> : item.step}
                </span>
                <span className={`text-body-sm-strong font-medium transition-colors ${
                  activeStep === item.step ? "text-accent-blue font-bold" : "text-ink"
                }`}>
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <div className="hidden md:block w-12 h-[1px] bg-hairline" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Side */}
        <div className="xl:col-span-8 space-y-5">
          {activeStep === 1 && (
            <>
              {/* Upload Card */}
              <Card variant="marketing" className="p-4 border border-hairline shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-3">
                  <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-title-sm text-ink">Select or upload your dataset.</h3>
                    <p className="text-caption text-mute">Provide a CSV or JSON file to initiate bulk text cleaning.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Select Dropdown */}
                  <div className="md:col-span-6 space-y-2">
                    <label htmlFor="dataset-select" className="text-body-sm-strong text-ink block">Choose Existing Dataset</label>
                    <div className="relative">
                      <select
                        id="dataset-select"
                        value={selectedDatasetId}
                        onChange={(e) => setSelectedDatasetId(e.target.value)}
                        className="form-input w-full appearance-none pr-10 pl-3.5 py-2.5 rounded-lg border border-hairline font-medium text-ink bg-canvas shadow-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all text-body-sm"
                      >
                        <option value="">-- Choose uploaded dataset --</option>
                        {datasets.map((d) => (
                          <option key={d.file_id} value={d.file_id}>
                            {d.file_name} ({d.summary?.file_size || "unknown"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" aria-hidden="true" />
                    </div>
                  </div>

                  {/* File Upload Box */}
                  <div className="md:col-span-6 flex flex-col justify-end">
                    <label className="text-body-sm-strong text-ink block mb-2">Or Upload a CSV/JSON file</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv,.json"
                        id="file-upload"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center justify-center gap-2 border border-dashed border-hairline-strong rounded-lg p-3 hover:border-accent-blue transition-colors cursor-pointer text-center bg-canvas-soft font-semibold text-caption text-ink shadow-sm hover:bg-canvas transition-all ${
                          isUploading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <RotateCw size={14} className="animate-spin text-accent-blue" />
                            <span className="text-accent-blue">Uploading file to server...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} className="text-mute" />
                            <span>Choose local file</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Selected File Card */}
                {selectedDataset && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-canvas border border-hairline rounded-lg shadow-sm hover:border-accent-blue transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-accent-blue/5 border border-accent-blue/10 rounded-lg flex items-center justify-center text-accent-blue shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-body-sm-strong text-ink truncate leading-tight">
                          {selectedDataset.file_name}
                        </span>
                        <span className="text-caption text-mute leading-normal mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="uppercase text-[10px] bg-canvas-soft border border-hairline px-1.5 py-0.5 rounded font-mono font-semibold">
                            {selectedDataset.file_name.endsWith(".json") ? "JSON" : "CSV"}
                          </span>
                          <span>•</span>
                          <span>{selectedDataset.summary?.file_size}</span>
                          <span>•</span>
                          <span>{selectedDataset.summary?.rows?.toLocaleString()} rows</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 text-emerald-600 text-caption font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                        Ready
                      </span>
                      <button
                        onClick={() => setSelectedDatasetId("")}
                        className="text-mute hover:text-error text-caption font-medium hover:underline transition-colors px-2 py-1"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Configure Dataset Card */}
              <Card variant="marketing" className="p-4 border border-hairline shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-3">
                  <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-title-sm text-ink">Configure your dataset.</h3>
                    <p className="text-caption text-mute">Map data fields and set parsing parameters.</p>
                  </div>
                </div>

                {selectedDataset ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-7 space-y-3">
                      <div className="space-y-1.5">
                        <label htmlFor="text_col_select" className="text-body-sm-strong text-ink block">Select Text Column</label>
                        <div className="relative">
                          <select
                            id="text_col_select"
                            value={selectedColumn}
                            onChange={(e) => {
                              setSelectedColumn(e.target.value)
                              saveConfiguration({ selected_column: e.target.value })
                            }}
                            className="form-input w-full appearance-none pr-10 pl-3.5 py-2.5 rounded-lg border border-hairline font-semibold text-ink bg-canvas shadow-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all text-body-sm"
                          >
                            {selectedDataset.summary?.columns?.map((col) => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" aria-hidden="true" />
                        </div>
                      </div>

                      {/* Preview Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-caption-mono text-ink uppercase tracking-wider flex items-center gap-1.5">
                            Data preview
                            <Badge variant="default" className="normal-case bg-canvas border border-hairline text-ink font-medium px-2 py-0.5 rounded-md text-[10px]">
                              First few rows
                            </Badge>
                          </span>
                        </div>

                        <div className="border border-hairline rounded-lg overflow-hidden shadow-sm max-h-[200px] overflow-y-auto bg-canvas">
                          <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                              <tr className="bg-canvas-soft border-b border-hairline text-caption font-semibold text-ink">
                                <th className="py-2.5 px-3.5 w-12 border-r border-hairline text-center">#</th>
                                <th className="py-2.5 px-3.5 w-full">{selectedColumn || "text"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDataset.summary?.sample_preview?.map((row, idx) => (
                                <tr key={idx} className="border-b border-hairline last:border-0 hover:bg-canvas-soft/30 transition-colors">
                                  <td className="py-2.5 px-3.5 border-r border-hairline text-center text-caption text-mute font-mono">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2.5 px-3.5 text-caption font-medium text-ink leading-relaxed truncate">
                                    {row[selectedColumn] !== undefined ? String(row[selectedColumn]) : JSON.stringify(row)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Options Panel */}
                    <div className="lg:col-span-5 bg-canvas-soft border border-hairline rounded-lg p-4 space-y-4">
                      <span className="font-mono text-caption-mono text-ink uppercase tracking-wider block">Additional options</span>

                      <div className="space-y-3">
                        {[
                          { label: "Header Row", desc: "Dataset contains header row", val: headerRow, set: setHeaderRow, key: "header_row" as const },
                          { label: "Data Type Detection", desc: "Detect field schema format", val: dataTypeDetect, set: setDataTypeDetect, key: "data_type_detect" as const },
                          { label: "Remove Empty Rows", desc: "Filter out empty string rows", val: removeEmpty, set: setRemoveEmpty, key: "remove_empty" as const },
                          { label: "Remove Duplicates", desc: "Exclude exact matching duplicates", val: removeDuplicates, set: setRemoveDuplicates, key: "remove_duplicates" as const },
                        ].map((option) => (
                          <div key={option.label} className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-caption font-bold text-ink">{option.label}</span>
                              <p className="text-[11px] text-mute leading-none">{option.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              aria-label={`Toggle option: ${option.label}`}
                              checked={option.val}
                              onChange={(e) => {
                                option.set(e.target.checked)
                                saveConfiguration({ [option.key]: e.target.checked })
                              }}
                              className="h-5 w-9 rounded-full bg-canvas cursor-pointer appearance-none checked:bg-accent-blue relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-3.5 after:h-3.5 after:rounded-full after:bg-mute checked:after:bg-white checked:after:left-[20px] after:transition-all shadow-inner border border-hairline shrink-0"
                            />
                          </div>
                        ))}

                        <div className="w-full h-[1px] bg-hairline" aria-hidden="true" />

                        <Input
                          id="custom_row_limit_field"
                          type="text"
                          label="Custom Row Limit (Optional)"
                          placeholder="Process all rows…"
                          value={rowLimit}
                          onChange={(e) => setRowLimit(e.target.value)}
                          onBlur={() => saveConfiguration({ row_limit: rowLimit })}
                          inputSize="sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-3 border border-dashed border-hairline rounded-lg bg-canvas-soft text-center">
                    <Database className="w-10 h-10 text-mute mb-3.5" aria-hidden="true" />
                    <p className="text-body-sm font-semibold text-ink">No dataset selected</p>
                    <p className="text-caption text-mute max-w-sm mt-1 leading-relaxed">
                      Select an existing dataset or upload a new file above to view configurations.
                    </p>
                  </div>
                )}
              </Card>
            </>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas-soft border border-hairline rounded-lg p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search input */}
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={14} />
                    <input
                      type="text"
                      placeholder="Search pipelines..."
                      value={pipelineSearchQuery}
                      onChange={(e) => setPipelineSearchQuery(e.target.value)}
                      className="form-input w-full pl-8 pr-3 py-1.5 border border-hairline rounded-md bg-canvas focus:border-accent-blue outline-none transition-all text-caption"
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="relative">
                    <select
                      value={pipelineCategory}
                      onChange={(e) => setPipelineCategory(e.target.value)}
                      className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-medium text-ink focus:border-accent-blue outline-none text-caption"
                    >
                      <option value="All">All Categories</option>
                      <option value="Social">Social</option>
                      <option value="Reviews">Reviews</option>
                      <option value="General">General</option>
                      <option value="NLP">NLP</option>
                      <option value="Formal">Formal</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={pipelineCreator}
                      onChange={(e) => setPipelineCreator(e.target.value)}
                      className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-medium text-ink focus:border-accent-blue outline-none text-caption"
                    >
                      <option value="All">Created by: All</option>
                      <option value="Karan">Karan</option>
                      <option value="Ananya">Ananya</option>
                      <option value="Rohit">Rohit</option>
                      <option value="Sarthak">Sarthak</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={pipelineSort}
                      onChange={(e) => setPipelineSort(e.target.value)}
                      className="appearance-none pr-8 pl-3 py-1.5 border border-hairline rounded-md bg-canvas font-medium text-ink focus:border-accent-blue outline-none text-caption"
                    >
                      <option value="Recent">Sort by: Recent</option>
                      <option value="Most Runs">Sort by: Most Runs</option>
                      <option value="Steps Count">Sort by: Steps Count</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
                  </div>

                  <div className="flex items-center border border-hairline rounded-md bg-canvas overflow-hidden">
                    <button className="p-1.5 hover:bg-canvas-soft text-mute border-r border-hairline">
                      <Grid size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-canvas-soft text-ink bg-canvas-soft">
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommended Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-body-sm-strong text-ink">Recommended for your dataset</h3>
                  <a href="#why" className="text-[11px] font-semibold text-accent-blue hover:underline">Why these?</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  {mockPipelines.filter(p => p.recommended).map((pipeline) => {
                    const isSelected = selectedPipeline === pipeline.id;
                    const isPreviewed = selectedPipelinePreviewId === pipeline.id;
                    const iconColorClass = 
                      pipeline.color === "purple" ? "text-purple-600 bg-purple-500/5 border-purple-500/10" :
                      pipeline.color === "red" ? "text-red-600 bg-red-500/5 border-red-500/10" :
                      "text-accent-blue bg-accent-blue/5 border-accent-blue/10";
                    return (
                      <Card
                        key={pipeline.id}
                        onClick={() => setSelectedPipelinePreviewId(pipeline.id)}
                        className={`p-4 border shadow-sm flex flex-col justify-between h-48 cursor-pointer transition-all duration-200 bg-canvas ${
                          isPreviewed ? "border-accent-blue ring-1 ring-accent-blue" : "border-hairline hover:border-accent-blue/50"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className={`p-1.5 rounded-lg border ${iconColorClass}`}>
                              <Layers size={14} />
                            </div>
                            <Badge variant="default" className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded">
                              Recommended
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-body-sm-strong font-bold text-ink truncate">{pipeline.name}</h4>
                            <p className="text-[11px] text-mute leading-snug line-clamp-2">{pipeline.description}</p>
                          </div>
                        </div>

                        {/* Card bottom details */}
                        <div className="flex items-center justify-between border-t border-hairline pt-3.5 mt-2">
                          <span className="text-[10px] font-mono text-mute">{pipeline.stepsCount} steps</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPipelinePreviewId(pipeline.id);
                              }}
                              className="p-1 rounded hover:bg-canvas-soft border border-hairline text-mute"
                              title="Preview Pipeline"
                            >
                              <Eye size={12} />
                            </button>
                            <Button
                              variant="primary-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPipeline(pipeline.id);
                                setSelectedPipelinePreviewId(pipeline.id);
                                toast.success(`Selected pipeline: ${pipeline.name}`);
                              }}
                              className={`py-1 px-3 text-[11px] rounded-md font-semibold ${
                                isSelected ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-accent-blue text-white hover:bg-link-deep"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Pipeline"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* All Pipelines List */}
              <div className="space-y-3">
                <h3 className="font-bold text-body-sm-strong text-ink">All Pipelines ({mockPipelines.filter(p => {
                  const matchesSearch = p.name.toLowerCase().includes(pipelineSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(pipelineSearchQuery.toLowerCase());
                  const matchesCategory = pipelineCategory === "All" || p.category === pipelineCategory;
                  const matchesCreator = pipelineCreator === "All" || p.creator.name === pipelineCreator;
                  return matchesSearch && matchesCategory && matchesCreator;
                }).length})</h3>

                <div className="border border-hairline rounded-lg overflow-hidden bg-canvas divide-y divide-hairline shadow-sm">
                  {mockPipelines.filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(pipelineSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(pipelineSearchQuery.toLowerCase());
                    const matchesCategory = pipelineCategory === "All" || p.category === pipelineCategory;
                    const matchesCreator = pipelineCreator === "All" || p.creator.name === pipelineCreator;
                    return matchesSearch && matchesCategory && matchesCreator;
                  }).map((pipeline) => {
                    const isSelected = selectedPipeline === pipeline.id;
                    const isPreviewed = selectedPipelinePreviewId === pipeline.id;
                    const colorClass = 
                      pipeline.color === "purple" ? "bg-purple-500/5 text-purple-600 border border-purple-500/10" :
                      pipeline.color === "red" ? "bg-red-500/5 text-red-600 border border-red-500/10" :
                      pipeline.color === "pink" ? "bg-pink-500/5 text-pink-600 border border-pink-500/10" :
                      pipeline.color === "green" ? "bg-emerald-500/5 text-emerald-600 border border-emerald-500/10" :
                      "bg-accent-blue/5 text-accent-blue border border-accent-blue/10";
                    return (
                      <div
                        key={pipeline.id}
                        onClick={() => setSelectedPipelinePreviewId(pipeline.id)}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 gap-4 transition-colors cursor-pointer ${
                          isPreviewed ? "bg-accent-blue/5" : "hover:bg-canvas-soft/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                            <Layers size={15} />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-body-sm-strong font-bold text-ink truncate leading-none">{pipeline.name}</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {pipeline.tags.map((tag) => (
                                  <Badge key={tag} variant="default" className="text-[9px] bg-canvas-soft border border-hairline text-mute py-0 px-1.5 rounded-sm">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-mute truncate max-w-lg leading-normal">{pipeline.description}</p>
                          </div>
                        </div>

                        {/* Middle Details & Action items */}
                        <div className="flex flex-wrap items-center gap-4 shrink-0 justify-end w-full sm:w-auto text-caption">
                          <span className="font-mono text-mute">{pipeline.stepsCount} steps</span>
                          
                          <div className="flex items-center gap-2 text-[11px] text-mute">
                            <div className="w-5 h-5 rounded-full bg-canvas-soft-2 border border-hairline flex items-center justify-center font-bold text-[9px] text-ink uppercase">
                              {pipeline.creator.avatar}
                            </div>
                            <span>{pipeline.creator.name}</span>
                            <span className="text-[10px] text-mute font-mono">• {pipeline.creator.date}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="secondary-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPipeline(pipeline.id);
                                setSelectedPipelinePreviewId(pipeline.id);
                                toast.success(`Selected pipeline: ${pipeline.name}`);
                              }}
                              className={`py-1 px-3 text-[11px] rounded-md font-semibold ${
                                isSelected ? "border-emerald-600 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10" : "border-hairline hover:bg-canvas-soft"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </Button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPipelinePreviewId(pipeline.id);
                              }}
                              className="p-1.5 rounded-md hover:bg-canvas-soft border border-hairline text-mute"
                              title="Preview"
                            >
                              <Eye size={12} />
                            </button>

                            <button className="p-1.5 rounded-md hover:bg-canvas-soft border border-transparent hover:border-hairline text-mute">
                              <MoreVertical size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center pt-2">
                  <Button variant="secondary-sm" className="gap-1 font-semibold text-caption">
                    <span>Load More Pipelines</span>
                    <ChevronDown size={13} />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <Card variant="marketing" className="p-4 border border-hairline shadow-sm">
              <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-3">
                <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-title-sm text-ink">Ready to batch process.</h3>
                  <p className="text-caption text-mute">Review and verify parameters before launching.</p>
                </div>
              </div>

              <div className="bg-canvas-soft border border-hairline rounded-lg p-4 space-y-2.5 text-caption font-semibold">
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-mute font-medium">Selected Dataset:</span>
                  <span className="text-ink font-bold">{selectedDataset?.file_name}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-mute font-medium">Text Field Column:</span>
                  <span className="text-ink font-bold">{selectedColumn}</span>
                </div>
                <div className="flex justify-between border-b border-hairline pb-2">
                  <span className="text-mute font-medium">Pipeline Strategy:</span>
                  <span className="text-accent-blue font-bold">
                    {selectedPipeline === "active-pipeline" ? "Active Editor Pipeline" : selectedPipeline}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mute font-medium">Total Rows:</span>
                  <span className="text-ink font-bold">{selectedDataset?.summary?.rows?.toLocaleString()} rows</span>
                </div>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 mt-4 border border-hairline rounded-lg bg-canvas-soft/30 animate-pulse">
                  <RotateCw className="w-10 h-10 text-accent-blue animate-spin mb-2" />
                  <p className="text-body-sm font-semibold text-ink">Executing Preprocessing Pipeline...</p>
                  <p className="text-caption text-mute mt-1">This will process all records asynchronously on the server.</p>
                </div>
              ) : (
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-hairline">
                  <Button variant="secondary-sm" onClick={() => setActiveStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary-sm"
                    className="gap-2 bg-accent-blue hover:bg-link-deep text-white"
                    onClick={handleProcessDataset}
                  >
                    <Play size={13} />
                    <span>Run Pipeline Now</span>
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeStep === 4 && (
            <Card variant="marketing" className="p-4 border border-hairline shadow-sm">
              <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Sparkle size={20} />
                </div>
                <div>
                  <h3 className="text-title-sm text-ink">Preprocessing completed.</h3>
                  <p className="text-caption text-mute">Bulk transformation completed. Review results below.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-mono text-caption-mono text-ink uppercase tracking-wider">Processed sample output (Preview)</h4>
                
                <div className="border border-hairline rounded-lg overflow-hidden shadow-sm max-h-[200px] overflow-y-auto bg-canvas">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-canvas-soft border-b border-hairline text-caption font-semibold text-ink">
                        <th className="py-2.5 px-3.5 w-[50%] border-r border-hairline">Original ({selectedColumn})</th>
                        <th className="py-2.5 px-3.5 w-[50%]">Processed ({selectedColumn}_processed)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processResult && processResult.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-b border-hairline last:border-0 hover:bg-canvas-soft/30 transition-colors">
                          <td className="py-2.5 px-3.5 border-r border-hairline text-caption font-medium text-mute truncate">
                            {row[selectedColumn]}
                          </td>
                          <td className="py-2.5 px-3.5 text-caption font-bold text-ink leading-relaxed truncate">
                            {row[`${selectedColumn}_processed`]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t border-hairline justify-between items-center">
                <Button
                  variant="secondary-sm"
                  onClick={() => {
                    setProcessResult(null)
                    setActiveStep(1)
                  }}
                >
                  Process Another Dataset
                </Button>
                <div className="flex gap-2">
                  <a href={`${API_URL}/api/dataset/download/${selectedDatasetId}`} download>
                    <Button variant="secondary-sm" className="gap-1.5 hover:border-accent-blue transition-colors">
                      <Download size={13} />
                      <span>Original File</span>
                    </Button>
                  </a>
                  <a href={`${API_URL}/api/dataset/download/processed_${selectedDatasetId}`} download>
                    <Button variant="primary-sm" className="gap-1.5 bg-accent-blue hover:bg-link-deep text-white shadow-md">
                      <Download size={13} />
                      <span>Cleaned CSV</span>
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side */}
        <div className="xl:col-span-4 space-y-5">
          {activeStep === 2 ? (
            <>
              {/* Pipeline Preview Card */}
              <Card variant="marketing" className="p-4 border border-hairline shadow-sm space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-mute uppercase tracking-wider block mb-1">Pipeline Preview</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm-strong font-bold text-ink truncate">
                      {selectedPipelinePreview?.name}
                    </span>
                    {selectedPipelinePreview?.recommended && (
                      <Badge variant="default" className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="default" className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-hairline text-mute">
                      {selectedPipelinePreview?.stepsCount} Steps
                    </Badge>
                    <Badge variant="default" className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-hairline text-mute">
                      {selectedPipelinePreview?.runs} runs
                    </Badge>
                    <Badge variant="default" className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-hairline text-mute">
                      Last used {selectedPipelinePreview?.lastUsed}
                    </Badge>
                  </div>
                </div>

                <div className="text-caption text-body leading-relaxed border-t border-hairline pt-3">
                  <span className="font-bold text-ink block mb-1">Description</span>
                  <p>{selectedPipelinePreview?.description}</p>
                </div>

                {/* Pipeline Flow (Timeline) */}
                <div className="border-t border-hairline pt-3 space-y-2">
                  <span className="font-bold text-ink block mb-2">Pipeline Flow</span>
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[1px] before:bg-hairline">
                    {selectedPipelinePreview?.steps.map((step, idx) => (
                      <div key={idx} className="relative flex flex-col items-start gap-0.5">
                        {/* Dot indicator */}
                        <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full border border-accent-blue bg-canvas z-10 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-accent-blue" />
                        </div>
                        <span className="text-caption font-bold text-ink flex items-center gap-1.5">
                          <span className="text-mute font-mono text-[10px]">{idx + 1}</span>
                          {step.name}
                        </span>
                        <span className="text-[11px] text-mute leading-none">{step.desc}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary-sm" className="w-full mt-2 font-semibold">
                    View Full Pipeline
                  </Button>
                </div>

                {/* Pipeline Compatibility */}
                <div className="border-t border-hairline pt-3 space-y-2 text-caption">
                  <span className="font-bold text-ink block mb-1">Pipeline Compatibility</span>
                  <div className="space-y-1.5 font-semibold text-body">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Check size={12} />
                      <span>Works well with your dataset</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Check size={12} />
                      <span>Text column detected: {selectedColumn || "tweet_text"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Check size={12} />
                      <span>Language: English (98.7%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-mute">
                      <Clock size={12} />
                      <span>Estimated processing time: ~2-3 mins for 125K rows</span>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Summary Stats */}
              <Card variant="marketing" className="p-4 border border-hairline shadow-sm">
                <h3 className="text-body-md-strong text-ink font-semibold mb-3 pb-1.5 border-b border-hairline">Dataset metadata.</h3>
                
                <div className="grid grid-cols-2 gap-3 tabular-nums">
                  {[
                    { label: "Total Rows", val: selectedDataset?.summary?.rows?.toLocaleString() || "—" },
                    { label: "Total Columns", val: selectedDataset?.summary?.columns?.length || "—" },
                    { label: "Missing Cells", val: selectedDataset?.summary?.missing_values_percent || "—" },
                    { label: "File Size", val: selectedDataset?.summary?.file_size || "—" },
                    { label: "Encoding", val: selectedDataset?.summary?.encoding || "—" },
                    { label: "Status", val: selectedDataset ? (
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                        {selectedDataset.status}
                      </span>
                    ) : "—" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-canvas-soft border border-hairline-soft rounded-lg p-2.5 shadow-sm transition-all hover:scale-[1.02] duration-200">
                      <div className="text-[10px] font-bold text-mute uppercase tracking-wider">{stat.label}</div>
                      <div className="text-caption font-bold text-ink mt-0.5 truncate">{stat.val}</div>
                    </div>
                  ))}
                </div>

                {selectedDataset?.summary?.columns && selectedDataset.summary.columns.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-hairline space-y-1.5">
                    <span className="font-mono text-[10px] font-bold text-mute uppercase tracking-wider block">Fields Schema</span>
                    <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1 border border-hairline-soft rounded bg-canvas-soft">
                      {selectedDataset.summary.columns.map((col) => (
                        <Badge
                          key={col}
                          variant="default"
                          className={`text-[10px] py-0.5 px-2 font-mono font-medium transition-colors border ${
                            col === selectedColumn
                              ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20"
                              : "bg-canvas text-body border-hairline"
                          }`}
                        >
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Benefits Info */}
              <Card variant="soft" className="p-4 border border-hairline bg-canvas-soft/80">
                <span className="font-mono text-caption-mono text-ink uppercase tracking-wider block mb-2">Bulk execution guide.</span>
                <div className="space-y-3.5 text-caption font-semibold text-body">
                  <div className="flex items-start gap-2.5">
                    <Check className="text-accent-blue shrink-0 mt-0.5" size={14} aria-hidden="true" />
                    <p className="leading-snug">Process large-scale text lists containing thousands of lines efficiently</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-accent-blue shrink-0 mt-0.5" size={14} aria-hidden="true" />
                    <p className="leading-snug">Apply normalization, slang correction, and regex cleaners dynamically</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-accent-blue shrink-0 mt-0.5" size={14} aria-hidden="true" />
                    <p className="leading-snug">Download cleaned outputs as structured CSV/JSON databases</p>
                  </div>
                </div>
              </Card>
            </>
          )}
      </div>
    </div>
  </div>
  )
}

export default function DatasetPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <RotateCw className="w-8 h-8 text-accent-blue animate-spin" />
      </div>
    }>
      <DatasetPageContent />
    </Suspense>
  )
}
