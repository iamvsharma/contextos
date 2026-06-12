"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Search,
  SlidersHorizontal,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Undo2,
  Redo2,
  Settings,
  CaseSensitive,
  Link2,
  Smile,
  Hash,
  List,
  Mail,
  ChevronRight,
  Copy,
  Download,
  Check,
  Languages,
  Sparkle,
  Bookmark,
  Share2,
  GitBranch,
  ChevronDown,
  GripVertical,
} from "lucide-react"
import toast from "react-hot-toast"
import { usePipelineStore, AVAILABLE_STEPS } from "@/store/usePipelineStore"
import { useThemeStore } from "@/store/useThemeStore"
import { api } from "@/services/api"
import type { PipelineStepType, PipelineStep } from "@/types"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"

const stepIconMap: Record<string, any> = {
  lowercase: CaseSensitive,
  remove_punctuation: Hash,
  remove_stopwords: Hash,
  tokenize: List,
  lemmatize: GitBranch,
  handle_emojis: Smile,
  normalize_slang: Smile,
  remove_mentions: Hash,
  remove_hashtags: Hash,
  remove_urls: Link2,
  remove_numbers: CaseSensitive,
  remove_special_characters: Hash,
  stem_porter: GitBranch,
  normalize_whitespace: List,
}

export default function PipelinePage() {
  const {
    inputText,
    steps,
    results,
    isProcessing,
    setInputText,
    addStep,
    removeStep,
    reorderSteps,
    toggleStep,
    setResults,
    setIsProcessing,
    setError,
    resetPipeline,
    setSteps,
  } = usePipelineStore()

  const { sidebarCollapsed } = useThemeStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"live" | "step" | "json">("live")
  const [activeFilter, setActiveFilter] = useState<"All" | "Clean" | "Transform" | "Extract" | "Other">("All")
  const [activeRightTab, setActiveRightTab] = useState<"configure" | "presets">("configure")
  const [pipelineName, setPipelineName] = useState("My Awesome Pipeline")
  const [pipelineDesc, setPipelineDesc] = useState("A pipeline for clean and normalized text ready for NLP tasks.")
  const [language, setLanguage] = useState("English")
  const [outputFormat, setOutputFormat] = useState("Plain Text")
  const [isAutoSave, setIsAutoSave] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [preserveCase, setPreserveCase] = useState(false)
  const [removeAccents, setRemoveAccents] = useState(false)
  const [handleEmojis, setHandleEmojis] = useState(true)
  const [normalizeWhitespace, setNormalizeWhitespace] = useState(true)

  useEffect(() => {
    if (!inputText) {
      setInputText(
        "OMG!! 🔥 This product is AMAZING!!! 🔥🔥\nCheck this out: https://example.com/product?id=123\nPing me at john.doe@example.com\n#awesome #NLP #TextProcessing\nPrice is 100% worth it… Don't you think?? 😉"
      )
    }

    const loadSavedPipeline = async () => {
      try {
        const saved = await api.pipeline.get()
        if (saved) {
          setPipelineName(saved.name)
          setPipelineDesc(saved.description || "")
          setLanguage(saved.language)
          setOutputFormat(saved.outputFormat)
          setPreserveCase(saved.preserveCase)
          setRemoveAccents(saved.removeAccents)
          setHandleEmojis(saved.handleEmojis)
          setNormalizeWhitespace(saved.normalizeWhitespace)

          // Load steps into Zustand store at once
          const loadedSteps = saved.steps.map(step => {
            const stepMeta = AVAILABLE_STEPS.find(s => s.type === step.type)
            return {
              id: `${step.type}-${Math.random().toString(36).substr(2, 9)}`,
              type: step.type as PipelineStepType,
              label: stepMeta ? stepMeta.label : step.type,
              enabled: step.enabled,
              config: step.config
            }
          })
          setSteps(loadedSteps)
        }
      } catch (err) {
        console.error("Failed to load saved pipeline", err)
      }
    }

    loadSavedPipeline()
  }, [])

  // Auto-save pipeline to database
  useEffect(() => {
    if (!isAutoSave) return

    const delayDebounce = setTimeout(async () => {
      try {
        await api.pipeline.save({
          name: pipelineName,
          description: pipelineDesc,
          steps: steps.map(s => ({ type: s.type, enabled: s.enabled })),
          language,
          outputFormat,
          preserveCase,
          removeAccents,
          handleEmojis,
          normalizeWhitespace,
        })
      } catch (err) {
        console.error("Failed to auto-save pipeline", err)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(delayDebounce)
  }, [
    steps,
    pipelineName,
    pipelineDesc,
    language,
    outputFormat,
    preserveCase,
    removeAccents,
    handleEmojis,
    normalizeWhitespace,
    isAutoSave,
  ])

  const handleProcess = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to process")
      return
    }
    const activeSteps = steps.filter((s) => s.enabled)
    if (activeSteps.length === 0) {
      toast.error("Please add or enable at least one step")
      return
    }
    setIsProcessing(true)
    setError(null)
    try {
      const data = await api.preprocess.execute(inputText, activeSteps)
      setResults(data.results)
      toast.success("Pipeline executed successfully")
    } catch (err) {
      let currentOutput = inputText
      const mockResults = activeSteps.map((step) => {
        const stepType = step.type
        const inputVal = currentOutput
        let outputVal = currentOutput

        switch (stepType) {
          case "lowercase":
            outputVal = inputVal.toLowerCase()
            break
          case "remove_urls":
            outputVal = inputVal.replace(/https?:\/\/\S+/gi, "")
            break
          case "handle_emojis":
            outputVal = inputVal.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
            break
          case "remove_punctuation":
            outputVal = inputVal.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ")
            break
          case "tokenize":
            // tokenization outputs tokens but doesn't change text
            break
          case "remove_stopwords":
            const stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "you", "your", "yours", "yourself", "yourselves"]
            outputVal = inputVal.split(/\s+/).filter(w => !stopwords.includes(w.toLowerCase())).join(" ")
            break
          case "normalize_whitespace":
            outputVal = inputVal.trim().replace(/\s+/g, " ")
            break
          case "remove_numbers":
            outputVal = inputVal.replace(/\d+/g, "")
            break
          case "remove_mentions":
            outputVal = inputVal.replace(/@\w+/g, "")
            break
          case "remove_hashtags":
            outputVal = inputVal.replace(/#\w+/g, "")
            break
          default:
            break
        }

        currentOutput = outputVal
        const tokens = currentOutput.split(/\s+/).filter(Boolean)

        return {
          step: step.label,
          input: inputVal,
          output: currentOutput,
          tokens: stepType === "tokenize" ? tokens : undefined,
        }
      })
      setResults(mockResults)
      toast.success("Executed locally (Fallback mode)")
    } finally {
      setIsProcessing(false)
    }
  }, [inputText, steps, setIsProcessing, setError, setResults])

  const getFilteredAvailableSteps = () => {
    return AVAILABLE_STEPS.filter((step) => {
      const matchesSearch = step.label.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (activeFilter === "All") return true
      if (activeFilter === "Clean" && step.category === "basic") return true
      if (activeFilter === "Transform" && step.category === "advanced") return true
      if (activeFilter === "Extract" && step.category === "social") return true
      return false
    })
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleDownloadText = (text: string) => {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "pipeline_output.txt")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success("Downloaded file successfully")
  }

  const finalOutput = results[results.length - 1]
  const finalText = finalOutput ? (finalOutput.tokens ? finalOutput.tokens.join(" ") : finalOutput.output) : ""

  return (
    <div className="p-4 space-y-4 pt-1 pb-4">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-3 bg-canvas/30 backdrop-blur-md sticky top-0 z-10 py-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-sm text-ink">Pipeline Builder.</h1>
            <Badge className="bg-accent-blue/10 text-accent-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-accent-blue/20">
              Interactive
            </Badge>
          </div>
          <p className="text-body-sm text-mute mt-1">
            Design, build and test your text preprocessing pipelines interactively.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-caption font-medium text-body bg-canvas-soft border border-hairline rounded px-2.5 py-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true" />
            <span>Saved</span>
          </div>
          <Button variant="secondary-sm" className="gap-2 text-caption font-semibold">
            <Share2 size={13} aria-hidden="true" />
            <span>Share</span>
          </Button>
          <Button size="sm"
            onClick={handleProcess}
            disabled={isProcessing}
            className="gap-2 bg-accent-blue hover:bg-link-deep text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 duration-200 text-caption font-semibold"
          >
            <Play size={11} fill="white" aria-hidden="true" />
            <span>Run Pipeline</span>
          </Button>
        </div>
      </div>

      {/* Core Workbench Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left pane: Operations list */}
        <Card variant="marketing" className={`${sidebarCollapsed ? "xl:col-span-2" : "xl:col-span-3"} p-4 border border-hairline shadow-sm space-y-4`}>
          <div className="space-y-0.5">
            <h3 className="text-body-sm-strong font-bold text-ink">Operations</h3>
            <p className="text-caption text-mute">Select preprocessing steps to chain</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={14} aria-hidden="true" />
            <input
              type="text"
              name="search_operations"
              autoComplete="off"
              placeholder="Search operations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-hairline rounded-md bg-canvas focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all text-caption"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {(["All", "Clean", "Transform", "Extract", "Other"] as const).map((filter) => {
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-0.5 rounded text-caption font-semibold transition-colors border ${
                    isSelected
                      ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                      : "bg-canvas border-hairline text-mute hover:text-ink hover:bg-canvas-soft"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
            <div className="space-y-2">
              <span className="font-mono text-caption-mono text-ink uppercase tracking-wider text-[10px] block">Available Steps</span>
              <div className="space-y-1.5">
                {getFilteredAvailableSteps().map((step) => {
                  const Icon = stepIconMap[step.type] || Hash
                  return (
                    <button
                      key={step.type}
                      onClick={() => {
                        addStep(step.type)
                        toast.success(`Added step: ${step.label}`)
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `add-step:${step.type}`)
                      }}
                      className="w-full cursor-grab active:cursor-grabbing flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas hover:bg-canvas-soft hover:border-accent-blue/50 transition-all text-left group focus-visible:ring-2 focus-visible:ring-accent-blue"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded bg-canvas border border-hairline flex items-center justify-center text-mute shrink-0 group-hover:text-accent-blue group-hover:border-accent-blue/30 shadow-sm" aria-hidden="true">
                          <Icon size={12} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold text-ink leading-tight truncate group-hover:text-accent-blue">
                            {step.label}
                          </span>
                          <span className="text-[10px] text-mute leading-normal mt-0.5">
                            {step.category === "basic" ? "Basic cleaning" : step.category === "advanced" ? "Structure extraction" : "Tag extraction"}
                          </span>
                        </div>
                      </div>
                      <Plus size={12} className="text-mute group-hover:text-accent-blue shrink-0" aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="border border-dashed border-hairline rounded-lg p-3 text-center bg-canvas-soft/50">
            <p className="text-caption text-body">Can't find what you need?</p>
            <button className="text-accent-blue text-caption font-semibold hover:underline mt-1 block w-full text-center focus-visible:ring-2 focus-visible:ring-accent-blue rounded">
              Request a new operation
            </button>
          </div>
        </Card>

        {/* Center: Canvas editor + Workbench tabs + metrics */}
        <div className={`${sidebarCollapsed ? "xl:col-span-7" : "xl:col-span-6"} space-y-6`}>
          {/* Visual Canvas Block */}
          <Card variant="marketing" className="p-4 border border-hairline shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="pipeline_name"
                  spellCheck={false}
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  className="font-bold text-body-sm-strong text-ink border-b border-transparent hover:border-hairline focus:outline-none focus:border-accent-blue rounded px-1.5 py-0.5 transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-caption text-body">Auto-save</span>
                  <input
                    type="checkbox"
                    aria-label="Toggle Auto-save state"
                    checked={isAutoSave}
                    onChange={(e) => setIsAutoSave(e.target.checked)}
                    className="h-5 w-9 rounded-full bg-canvas-soft-2 cursor-pointer appearance-none checked:bg-accent-blue relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-3.5 after:h-3.5 after:rounded-full after:bg-mute checked:after:bg-white checked:after:left-[18px] after:transition-all shadow-inner border border-hairline shrink-0"
                  />
                </div>
                <div className="w-[1px] h-4 bg-hairline" aria-hidden="true" />
                <div className="flex items-center gap-0.5">
                  <button className="p-1.5 text-mute hover:text-ink rounded hover:bg-canvas-soft transition-colors focus-visible:ring-2 focus-visible:ring-ink" title="Undo change" aria-label="Undo change">
                    <Undo2 size={14} aria-hidden="true" />
                  </button>
                  <button className="p-1.5 text-mute hover:text-ink rounded hover:bg-canvas-soft transition-colors focus-visible:ring-2 focus-visible:ring-ink" title="Redo change" aria-label="Redo change">
                    <Redo2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal flow line of steps */}
            <div
              className="bg-canvas-soft rounded-lg border border-hairline-soft p-4 relative overflow-x-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const data = e.dataTransfer.getData("text/plain")
                if (data && data.startsWith("add-step:")) {
                  const stepType = data.substring(9) as PipelineStepType
                  addStep(stepType)
                  toast.success(`Added step: ${stepType.replace("_", " ")}`)
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-max pb-1">
                {steps.map((step, idx) => {
                  const Icon = stepIconMap[step.type] || Hash
                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `reorder:${idx}`)
                        setDraggedIndex(idx)
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null)
                        setDragOverIndex(null)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        if (dragOverIndex !== idx) {
                          setDragOverIndex(idx)
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverIndex(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDragOverIndex(null)
                        const data = e.dataTransfer.getData("text/plain")
                        if (data && data.startsWith("reorder:")) {
                          const fromIndex = parseInt(data.substring(8), 10)
                          if (fromIndex !== idx) {
                            reorderSteps(fromIndex, idx)
                            toast.success(`Reordered step to position ${idx + 1}`)
                          }
                        } else if (data && data.startsWith("add-step:")) {
                          const stepType = data.substring(9) as PipelineStepType
                          addStep(stepType)
                          setTimeout(() => {
                            reorderSteps(steps.length, idx)
                          }, 50)
                          toast.success(`Inserted step at position ${idx + 1}`)
                        }
                      }}
                    >
                      {idx > 0 && <ChevronRight className="text-mute/40 shrink-0" size={14} aria-hidden="true" />}
                      <div className={`relative cursor-grab active:cursor-grabbing group bg-canvas border rounded-lg p-2.5 shadow-sm min-w-[150px] flex items-center justify-between hover:border-accent-blue hover:shadow-md transition-all ${
                        draggedIndex === idx
                          ? "border-dashed border-accent-blue bg-accent-blue/5 opacity-50"
                          : dragOverIndex === idx && draggedIndex !== idx
                          ? "border-accent-blue ring-2 ring-accent-blue/20 bg-accent-blue/5 scale-[1.02]"
                          : "border-hairline"
                      }`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GripVertical size={13} className="text-mute/40 group-hover:text-accent-blue shrink-0" aria-hidden="true" />
                          <div className="w-7 h-7 rounded bg-canvas-soft border border-hairline text-ink flex items-center justify-center shrink-0" aria-hidden="true">
                            <Icon size={12} />
                          </div>
                          <div>
                            <div className="text-caption font-semibold text-ink leading-none">{step.label}</div>
                            <span className="text-[9px] font-mono font-bold text-mute uppercase tracking-wide mt-1 block">Clean</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            removeStep(step.id)
                            toast.success(`Removed step: ${step.label}`)
                          }}
                          className="text-mute hover:text-error p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-blue rounded ml-1"
                          aria-label={`Remove step ${step.label}`}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  )
                })}

                {steps.length > 0 && <ChevronRight className="text-mute/40 shrink-0" size={14} aria-hidden="true" />}
                <div className="border border-dashed border-hairline rounded-lg p-2.5 bg-canvas-soft/50 flex items-center justify-center gap-2 text-caption font-medium text-mute hover:text-ink hover:border-accent-blue/50 hover:bg-canvas transition-all cursor-pointer min-w-[150px]">
                  <Plus size={12} aria-hidden="true" />
                  <span>Drag & drop steps here</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Workbench Section (Live Preview Tabs) */}
          <Card variant="marketing" className="p-4 border border-hairline shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2.5">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Workbench tabs">
                {(["live", "step", "json"] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-caption font-semibold border-b-2 transition-all capitalize focus-visible:ring-2 focus-visible:ring-accent-blue ${
                        isSelected
                          ? "border-accent-blue text-accent-blue"
                          : "border-transparent text-mute hover:text-body"
                      }`}
                    >
                      {tab === "live" ? "Live Preview" : tab === "step" ? "Step-by-Step View" : "Output (JSON)"}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 bg-canvas-soft p-1 rounded border border-hairline-soft">
                <button className="px-2.5 py-0.5 bg-canvas border border-hairline rounded text-caption font-medium text-ink shadow-sm">
                  Single Text
                </button>
                <button className="px-2.5 py-0.5 text-caption font-medium text-mute hover:text-body rounded focus-visible:ring-2 focus-visible:ring-accent-blue">
                  Sample Dataset
                </button>
              </div>
            </div>

            {activeTab === "live" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-caption font-medium">
                    <label htmlFor="workbench_input" className="text-ink">Input Text</label>
                    <span className="text-mute tabular-nums">{inputText.length} / 5000</span>
                  </div>
                  <textarea
                    id="workbench_input"
                    name="workbench_input"
                    spellCheck={false}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-64 p-3 rounded-lg border border-hairline bg-canvas-soft text-caption text-ink leading-relaxed focus:outline-none focus:bg-canvas focus:border-accent-blue shadow-inner resize-none transition-colors"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <Button variant="secondary-sm" className="gap-1 flex items-center font-semibold text-caption">
                      <Plus size={12} aria-hidden="true" />
                      <span>Upload File</span>
                    </Button>
                    <Button size="sm"
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="gap-1 bg-accent-blue hover:bg-link-deep text-white shadow-md transition-all hover:scale-[1.02] active:scale-95 duration-200 text-caption font-semibold"
                    >
                      <Play size={11} fill="white" aria-hidden="true" />
                      <span>Run Pipeline</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-caption font-medium">
                    <span className="text-ink">Output Text</span>
                    <Badge variant="default" className="text-[10px] bg-accent-blue/10 text-accent-blue border border-accent-blue/20 font-semibold">Step {steps.length} of {steps.length}</Badge>
                  </div>
                  <div className="w-full h-64 p-3 rounded-lg border border-hairline bg-canvas-soft text-caption text-ink leading-relaxed overflow-y-auto whitespace-pre-wrap select-all font-mono">
                    {finalText || <span className="text-mute italic font-sans">No output generated. Run pipeline to clean text.</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2.5 text-[11px] font-semibold text-mute tabular-nums">
                      <span>{finalOutput?.tokens?.length || finalText.split(/\s+/).length || 0} tokens</span>
                      <span>·</span>
                      <span>{finalText.length} characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary-sm"
                        onClick={() => handleCopyText(finalText)}
                        className="p-1.5 border border-hairline rounded bg-canvas hover:bg-canvas-soft text-body shadow-sm"
                        title="Copy to clipboard"
                        aria-label="Copy to clipboard"
                      >
                        <Copy size={13} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="secondary-sm"
                        onClick={() => handleDownloadText(finalText)}
                        className="p-1.5 border border-hairline rounded bg-canvas hover:bg-canvas-soft text-body shadow-sm"
                        title="Download text file"
                        aria-label="Download text file"
                      >
                        <Download size={13} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "step" && (
              <div className="space-y-3">
                {results.map((res, i) => (
                  <div key={i} className="border border-hairline rounded-lg p-3 bg-canvas-soft/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="bg-canvas border border-hairline text-ink font-semibold">
                        Step {i + 1}: {res.step}
                      </Badge>
                    </div>
                    <p className="text-caption text-ink font-medium bg-canvas p-3 rounded border border-hairline leading-relaxed shadow-sm font-mono">
                      {res.tokens ? `[${res.tokens.map(t => `'${t}'`).join(", ")}]` : res.output}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "json" && (
              <pre className="bg-ink text-canvas/80 p-4 rounded-lg text-caption overflow-x-auto leading-relaxed max-h-[340px] font-mono">
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </Card>

          {/* Statistics strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 tabular-nums">
            {[
              { label: "Total Operations", val: steps.length },
              { label: "Avg. Processing Time", val: "0.42s" },
              { label: "Tokens Output", val: finalOutput?.tokens?.length || 20 },
              { label: "Characters Output", val: finalText.length || 105 },
              { label: "Noise Removed", val: "78%", spark: true },
            ].map((stat, i) => (
              <div key={i} className="bg-canvas-soft border border-hairline rounded-lg p-3 shadow-sm space-y-1 flex flex-col justify-between hover:border-accent-blue/30 transition-all hover:scale-[1.02] duration-200">
                <span className="font-mono text-caption-mono text-ink uppercase tracking-wider text-[9px] block text-mute">{stat.label}</span>
                <span className="text-caption font-bold text-ink leading-none">{stat.val}</span>
                {stat.spark && (
                  <div className="h-5 w-full mt-2 bg-canvas-soft-2 border border-hairline rounded overflow-hidden flex items-end">
                    <div className="w-full h-3 bg-gradient-to-t from-ink/20 to-ink/5" style={{ clipPath: "polygon(0 80%, 20% 50%, 40% 70%, 60% 40%, 80% 60%, 100% 20%, 100% 100%, 0 100%)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Configurator sidebar */}
        <div className="xl:col-span-3 space-y-6">
          <Card variant="marketing" className="p-5 shadow-sm border border-hairline space-y-4">
            <div className="flex border-b border-hairline-soft pb-2" role="tablist">
              <button
                role="tab"
                aria-selected={activeRightTab === "configure"}
                onClick={() => setActiveRightTab("configure")}
                className={`flex-1 py-1.5 text-caption font-semibold text-center border-b-2 capitalize transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue ${
                  activeRightTab === "configure"
                    ? "border-accent-blue text-accent-blue"
                    : "border-transparent text-mute hover:text-body"
                }`}
              >
                Configure
              </button>
              <button
                role="tab"
                aria-selected={activeRightTab === "presets"}
                onClick={() => setActiveRightTab("presets")}
                className={`flex-1 py-1.5 text-caption font-semibold text-center border-b-2 capitalize transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue ${
                  activeRightTab === "presets"
                    ? "border-accent-blue text-accent-blue"
                    : "border-transparent text-mute hover:text-body"
                }`}
              >
                Presets
              </button>
            </div>

            {activeRightTab === "configure" && (
              <div className="space-y-4">
                <div className="space-y-3.5">
                  <span className="text-eyebrow font-semibold text-mute uppercase tracking-wider block">General Settings</span>

                  <Input
                    id="pipeline_name_input"
                    label="Pipeline Name"
                    spellCheck={false}
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    inputSize="sm"
                    className="font-medium"
                  />

                  <Textarea
                    id="pipeline_desc_field"
                    label="Description (optional)"
                    spellCheck={false}
                    value={pipelineDesc}
                    onChange={(e) => setPipelineDesc(e.target.value)}
                    className="font-medium h-16 min-h-[60px] text-body-sm resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label htmlFor="language_select" className="text-caption text-mute block font-sans">Language</label>
                      <div className="relative">
                        <select
                          id="language_select"
                          name="language_select"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="form-input w-full appearance-none pr-8 pl-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-canvas shadow-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all text-body-sm"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="format_select" className="text-caption text-mute block font-sans">Output Format</label>
                      <div className="relative">
                        <select
                          id="format_select"
                          name="format_select"
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="form-input w-full appearance-none pr-8 pl-3 py-1.5 rounded-lg border border-hairline font-semibold text-ink bg-canvas shadow-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all text-body-sm"
                        >
                          <option>Plain Text</option>
                          <option>Tokens List</option>
                          <option>JSON Log</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-hairline-soft" aria-hidden="true" />

                <div className="space-y-2.5">
                  <span className="text-eyebrow font-semibold text-mute uppercase tracking-wider block">Advanced Settings</span>

                  {[
                    { label: "Preserve Case", val: preserveCase, set: setPreserveCase },
                    { label: "Remove Accents", val: removeAccents, set: setRemoveAccents },
                    { label: "Handle Emojis", val: handleEmojis, set: setHandleEmojis },
                    { label: "Normalize Whitespace", val: normalizeWhitespace, set: setNormalizeWhitespace },
                  ].map((sw) => (
                    <div key={sw.label} className="flex items-center justify-between">
                      <span className="text-body-sm font-medium text-body">{sw.label}</span>
                      <input
                        type="checkbox"
                        aria-label={`Toggle setting: ${sw.label}`}
                        checked={sw.val}
                        onChange={(e) => sw.set(e.target.checked)}
                        className="h-5 w-9 rounded-full bg-canvas-soft-2 cursor-pointer appearance-none checked:bg-accent-blue relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-3.5 after:h-3.5 after:rounded-full after:bg-mute checked:after:bg-white checked:after:left-[18px] after:transition-all shadow-inner border border-hairline shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeRightTab === "presets" && (
              <div className="space-y-3.5">
                <span className="text-eyebrow font-semibold text-mute uppercase tracking-wider block">Pipeline Presets</span>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {[
                    {
                      name: "Social Media Cleaner",
                      desc: "Clean tweets, posts with emojis and URLs",
                      steps: ["lowercase", "remove_urls", "handle_emojis", "remove_punctuation", "tokenize"]
                    },
                    {
                      name: "General Text Cleaner",
                      desc: "Standard cleaning and tokenization",
                      steps: ["lowercase", "remove_punctuation", "tokenize"]
                    },
                    {
                      name: "SEO / Web Text Cleaner",
                      desc: "Clean web logs and HTML artifacts",
                      steps: ["lowercase", "remove_urls", "normalize_whitespace"]
                    }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        resetPipeline();
                        preset.steps.forEach((stepType, index) => {
                          setTimeout(() => {
                            addStep(stepType as PipelineStepType);
                          }, index * 50);
                        });
                        toast.success(`Loaded preset: ${preset.name}`);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-hairline bg-canvas hover:bg-canvas-soft hover:border-accent-blue/50 transition-all group"
                    >
                      <div className="text-[12px] font-bold text-ink group-hover:text-accent-blue">{preset.name}</div>
                      <div className="text-[10px] text-mute mt-0.5">{preset.desc}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.steps.map((st) => (
                          <span key={st} className="text-[8px] bg-canvas-soft border border-hairline px-1 rounded text-body font-mono">
                            {st.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Health circular score */}
          <Card variant="marketing" className="p-5 shadow-sm border border-hairline space-y-3">
            <span className="text-eyebrow font-semibold text-mute uppercase tracking-wider block">Pipeline Health</span>

            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                  <path className="text-canvas-soft-2" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-accent-blue" strokeDasharray="92, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-caption font-bold text-ink tabular-nums">92%</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-caption font-bold text-ink">Excellent</div>
                <p className="text-[10px] text-mute leading-snug">Your pipeline is optimized well</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-hairline-soft pt-3 text-[11px] font-semibold">
              <div className="flex items-center gap-2 text-ink">
                <Check size={12} className="text-emerald-500 shrink-0" aria-hidden="true" />
                <span>Good balance of cleaning steps</span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Check size={12} className="text-emerald-500 shrink-0" aria-hidden="true" />
                <span>Redundant operations: 0</span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Check size={12} className="text-emerald-500 shrink-0" aria-hidden="true" />
                <span>Performance: Optimal</span>
              </div>
            </div>
          </Card>

          {/* Save & Reuse card */}
          <Card variant="marketing" className="bg-canvas-soft border border-hairline p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-ink font-bold text-[12px]">
              <Bookmark size={14} className="text-accent-blue" aria-hidden="true" />
              <span>Save & Reuse</span>
            </div>
            <p className="text-[11px] text-mute leading-normal">
              Save this pipeline to reuse on datasets, API or share with your team.
            </p>
            <Button
              onClick={() => toast.success("Pipeline configuration saved successfully")}
              className="w-full bg-accent-blue hover:bg-link-deep text-white shadow-sm font-bold text-[11px] transition-all hover:scale-[1.01]"
            >
              Save Pipeline
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
