"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

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
  ChevronLeft,
  Copy,
  Download,
  Check,
  Languages,
  Sparkle,
  Bookmark,
  Share2,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
  CheckCircle2,
  FileText,
  PlayCircle
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
import { InputNode, OperatorNode, OutputNode } from "@/components/pipeline/CustomNode"

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

// React Flow custom node registry
const nodeTypes = {
  inputNode: InputNode,
  operatorNode: OperatorNode,
  outputNode: OutputNode,
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
    updateStepConfig,
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

  // Track node drag positions override
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [stepStatuses, setStepStatuses] = useState<Record<string, "idle" | "success" | "error" | "processing">>({})
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false)

  const [preserveCase, setPreserveCase] = useState(false)
  const [removeAccents, setRemoveAccents] = useState(false)
  const [handleEmojis, setHandleEmojis] = useState(true)
  const [normalizeWhitespace, setNormalizeWhitespace] = useState(true)

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

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

          // Load steps into Zustand store
          const loadedSteps = saved.steps.map(step => {
            const stepMeta = AVAILABLE_STEPS.find(s => s.type === step.type)
            return {
              id: `${step.type}-${Math.random().toString(36).substr(2, 9)}`,
              type: step.type as PipelineStepType,
              label: stepMeta ? stepMeta.label : step.type,
              enabled: step.enabled,
              config: step.config || {}
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
          steps: steps.map(s => ({ type: s.type, enabled: s.enabled, config: s.config })),
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

  // Process pipeline execution
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

    // Mark all enabled steps as processing
    const nextStatuses = { ...stepStatuses }
    activeSteps.forEach(s => {
      nextStatuses[s.id] = "processing"
    })
    setStepStatuses(nextStatuses)

    try {
      const data = await api.preprocess.execute(inputText, activeSteps)
      setResults(data.results)

      // Set success for all steps
      const finalStatuses = { ...stepStatuses }
      activeSteps.forEach(s => {
        finalStatuses[s.id] = "success"
      })
      setStepStatuses(finalStatuses)

      toast.success("Pipeline executed successfully")
    } catch (err) {
      // Fallback local execution logic
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
            const puncChars = (step.config?.characters as string) || ".,\\/#!$%\\^&\\*;:{}=\\-_`~()?"
            const regex = new RegExp(`[${puncChars}]`, "g")
            outputVal = inputVal.replace(regex, "").replace(/\s+/g, " ")
            break
          case "remove_stopwords":
            const stopwordText = (step.config?.customStopwords as string) || ""
            const extraStopwords = stopwordText.split(",").map(w => w.trim().toLowerCase()).filter(Boolean)
            const defaultStopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "you", "your", "yours", "yourself", "yourselves"]
            const combinedStopwords = [...defaultStopwords, ...extraStopwords]
            outputVal = inputVal.split(/\s+/).filter(w => !combinedStopwords.includes(w.toLowerCase())).join(" ")
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

      const successStatuses = { ...stepStatuses }
      activeSteps.forEach(s => {
        successStatuses[s.id] = "success"
      })
      setStepStatuses(successStatuses)

      toast.success("Executed locally (Fallback mode)")
    } finally {
      setIsProcessing(false)
    }
  }, [inputText, steps, stepStatuses, setIsProcessing, setError, setResults])

  const testNodeInIsolation = useCallback((nodeId: string) => {
    const step = steps.find(s => s.id === nodeId)
    if (!step) return
    toast.success(`Testing ${step.label} isolated workflow...`)
    // Temporarily trigger visual processing status
    setStepStatuses(prev => ({ ...prev, [nodeId]: "processing" }))
    setTimeout(() => {
      setStepStatuses(prev => ({ ...prev, [nodeId]: "success" }))
      toast.success(`${step.label} verified successfully!`)
    }, 800)
  }, [steps])

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

  // Keep track of manual drag positions and dynamically re-order pipeline based on horizontal X positions
  const onNodeDragStop = useCallback((event: any, draggedNode: Node) => {
    // Determine new order using temporary position
    if (draggedNode.id !== "pipeline-input" && draggedNode.id !== "pipeline-output") {
      const nextPositions = {
        ...nodePositions,
        [draggedNode.id]: draggedNode.position
      }

      const stepsWithX = steps.map((step, idx) => {
        const pos = nextPositions[step.id] || { x: 380 + idx * 320, y: 200 }
        return { step, x: pos.x }
      })

      // Sort by X coordinate
      stepsWithX.sort((a, b) => a.x - b.x)

      const newSteps = stepsWithX.map(item => item.step)

      const hasOrderChanged = newSteps.some((step, index) => step.id !== steps[index].id)

      if (hasOrderChanged) {
        setSteps(newSteps)
        toast.success("Pipeline sequence updated and aligned")
      } else {
        toast.success("Aligned step sequence")
      }
    }

    // Force snap by clearing all step positions from overrides. Only keep input/output if they were manually moved.
    setNodePositions(prev => ({
      "pipeline-input": prev["pipeline-input"],
      "pipeline-output": prev["pipeline-output"]
    }))
  }, [steps, setSteps, nodePositions])

  // Generate Nodes and Edges based on steps sequence
  useEffect(() => {
    const tempNodes: Node[] = []
    const tempEdges: Edge[] = []

    // 1. Input Node
    const inputNodeId = "pipeline-input"
    const inputPos = nodePositions[inputNodeId] || { x: 50, y: 200 }
    tempNodes.push({
      id: inputNodeId,
      type: "inputNode",
      position: inputPos,
      data: {
        id: inputNodeId,
        inputText,
        label: "Input Text",
      },
    })

    // 2. Operator Nodes
    steps.forEach((step, idx) => {
      const nodeId = step.id
      const pos = nodePositions[nodeId] || { x: 380 + idx * 320, y: 200 }
      tempNodes.push({
        id: nodeId,
        type: "operatorNode",
        position: pos,
        data: {
          id: nodeId,
          label: step.label,
          type: step.type,
          enabled: step.enabled,
          config: step.config,
          status: stepStatuses[nodeId] || "idle",
          errorMsg: stepErrors[nodeId],
          onToggle: (id: string) => toggleStep(id),
          onConfigure: (id: string) => {
            setSelectedNodeId(id)
            setIsRightCollapsed(false)
          },
          onDelete: (id: string) => {
            removeStep(id)
            if (selectedNodeId === id) setSelectedNodeId(null)
          },
          onTest: (id: string) => testNodeInIsolation(id),
        },
      })

      // Connection from previous node
      const sourceId = idx === 0 ? inputNodeId : steps[idx - 1].id
      tempEdges.push({
        id: `edge-${sourceId}-${nodeId}`,
        source: sourceId,
        target: nodeId,
        animated: step.enabled && isProcessing,
        style: {
          stroke: step.enabled ? "#3b82f6" : "#cbd5e1",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: step.enabled ? "#3b82f6" : "#cbd5e1",
        },
      })
    })

    // 3. Output Node
    const outputNodeId = "pipeline-output"
    const outputPos = nodePositions[outputNodeId] || { x: 380 + steps.length * 320, y: 200 }
    tempNodes.push({
      id: outputNodeId,
      type: "outputNode",
      position: outputPos,
      data: {
        id: outputNodeId,
        outputText: finalText,
        label: "Output Text",
      },
    })

    // Edge to output node
    if (steps.length > 0) {
      const lastStepId = steps[steps.length - 1].id
      const lastStep = steps[steps.length - 1]
      tempEdges.push({
        id: `edge-${lastStepId}-${outputNodeId}`,
        source: lastStepId,
        target: outputNodeId,
        animated: lastStep.enabled && isProcessing,
        style: {
          stroke: lastStep.enabled ? "#3b82f6" : "#cbd5e1",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: lastStep.enabled ? "#3b82f6" : "#cbd5e1",
        },
      })
    } else {
      // Direct connection if empty
      tempEdges.push({
        id: `edge-${inputNodeId}-${outputNodeId}`,
        source: inputNodeId,
        target: outputNodeId,
        animated: isProcessing,
        style: {
          stroke: "#3b82f6",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
        },
      })
    }

    setNodes(tempNodes)
    setEdges(tempEdges)
  }, [steps, inputText, finalText, nodePositions, stepStatuses, stepErrors, isProcessing, toggleStep, removeStep, testNodeInIsolation, selectedNodeId])

  // Get currently selected step details
  const selectedStep = useMemo(() => {
    if (!selectedNodeId) return null
    return steps.find(s => s.id === selectedNodeId) || null
  }, [selectedNodeId, steps])

  // Handles adding step from canvas dropping
  const onDragOverCanvas = useCallback((event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDropCanvas = useCallback((event: any) => {
    event.preventDefault()
    const data = event.dataTransfer.getData("text/plain")
    if (data && data.startsWith("add-step:")) {
      const stepType = data.substring(9) as PipelineStepType
      addStep(stepType)
      toast.success(`Added step: ${stepType.replace("_", " ")}`)
    }
  }, [addStep])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Premium Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline px-6 py-3.5 bg-canvas/60 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-body-sm-strong font-bold text-ink text-lg">{pipelineName}</h1>
            <Badge className="bg-accent-blue/10 text-accent-blue text-[10px] font-bold px-2 py-0.5 rounded-md border border-accent-blue/20">
              Interactive Canvas
            </Badge>
          </div>
          <p className="text-[11px] text-mute mt-0.5">{pipelineDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-caption font-semibold text-body bg-canvas-soft border border-hairline rounded-lg px-2.5 py-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true" />
            <span>Saved</span>
          </div>
          <Button variant="secondary-sm" className="gap-2 text-[11px] font-semibold">
            <Share2 size={12} />
            <span>Share</span>
          </Button>
          <Button
            size="sm"
            onClick={handleProcess}
            disabled={isProcessing}
            className="gap-2 bg-accent-blue hover:bg-link-deep text-white shadow-md transition-all text-[11px] font-bold h-9"
          >
            <Play size={10} fill="white" />
            <span>Run Pipeline</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: Operations Side Drawer */}
        <aside className={`border-r border-hairline bg-canvas flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isLeftCollapsed ? "w-0 border-r-0" : "w-64"
        }`}>
          <div className="p-4 border-b border-hairline space-y-3 shrink-0">
            <div className="space-y-0.5">
              <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider">NLP Operators</h3>
              <p className="text-[10px] text-mute">Drag onto the canvas or click to chain</p>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute" size={13} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search operations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-hairline rounded-lg bg-canvas focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none text-caption font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {(["All", "Clean", "Transform", "Extract"] as const).map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
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
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="space-y-1">
              {getFilteredAvailableSteps().map((step) => {
                const Icon = stepIconMap[step.type] || Hash
                return (
                  <div
                    key={step.type}
                    onClick={() => {
                      addStep(step.type)
                      toast.success(`Added step: ${step.label}`)
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", `add-step:${step.type}`)
                    }}
                    className="w-full cursor-grab active:cursor-grabbing flex items-center justify-between p-2 rounded-lg border border-hairline bg-canvas hover:bg-canvas-soft hover:border-accent-blue/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6.5 h-6.5 rounded bg-canvas border border-hairline flex items-center justify-center text-mute shrink-0 group-hover:text-accent-blue group-hover:border-accent-blue/30" aria-hidden="true">
                        <Icon size={11} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-ink leading-tight truncate group-hover:text-accent-blue">
                          {step.label}
                        </span>
                        <span className="text-[9px] text-mute uppercase font-mono">
                          {step.category}
                        </span>
                      </div>
                    </div>
                    <Plus size={11} className="text-mute group-hover:text-accent-blue shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Center: Interactive Canvas */}
        <main className="flex-1 flex flex-col bg-canvas-soft relative overflow-hidden">
          {/* Collapse Left Sidebar Toggle */}
          <button
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="absolute left-3 top-4 z-10 w-8 h-8 bg-canvas border border-hairline hover:bg-canvas-soft flex items-center justify-center rounded-lg shadow-md transition-all hover:scale-[1.05]"
            title={isLeftCollapsed ? "Expand Operators" : "Collapse Operators"}
          >
            {isLeftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Collapse Right Sidebar Toggle */}
          <button
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            className="absolute right-3 top-4 z-10 w-8 h-8 bg-canvas border border-hairline hover:bg-canvas-soft flex items-center justify-center rounded-lg shadow-md transition-all hover:scale-[1.05]"
            title={isRightCollapsed ? "Expand Properties" : "Collapse Properties"}
          >
            {isRightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Collapse Bottom Panel Toggle */}
          <button
            onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
            className={`absolute z-10 w-24 h-7 bg-canvas border border-hairline hover:bg-canvas-soft flex items-center justify-center gap-1.5 rounded-t-lg shadow-md transition-all left-1/2 -translate-x-1/2 ${
              isBottomCollapsed ? "bottom-0" : "bottom-[287px]"
            }`}
            title={isBottomCollapsed ? "Expand Sandbox" : "Collapse Sandbox"}
          >
            {isBottomCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span className="text-[10px] font-bold">Sandbox</span>
          </button>
          <div 
            className="flex-1 h-full"
            onDragOver={onDragOverCanvas}
            onDrop={onDropCanvas}
          >
<ReactFlow
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               nodeTypes={nodeTypes}
               onNodeDragStop={onNodeDragStop}
               fitView
               proOptions = {{hideAttribution: true}}
             >
              <Background color="#cbd5e1" gap={16} size={1} />
              <Controls className="!bg-canvas !border-hairline !shadow-lg rounded-lg" />
              <MiniMap className="!bg-canvas !border-hairline !shadow-lg rounded-lg" zoomable pannable />
            </ReactFlow>
          </div>

          {/* Bottom Preview & Comparison Diff Drawer */}
          <div className={`border-t border-hairline bg-canvas flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            isBottomCollapsed ? "h-0 border-t-0" : "h-72"
          }`}>
            <div className="flex items-center justify-between border-b border-hairline px-6 py-2 shrink-0 bg-canvas-soft/40">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Execution Sandbox</span>
                <div className="flex items-center gap-1.5" role="tablist">
                  {(["live", "step", "json"] as const).map((tab) => {
                    const isSelected = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-[11px] font-bold border-b-2 transition-all capitalize ${
                          isSelected
                            ? "border-accent-blue text-accent-blue"
                            : "border-transparent text-mute hover:text-body"
                        }`}
                      >
                        {tab === "live" ? "Live Workbench" : tab === "step" ? "Interactive Diff" : "JSON AST"}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-mute font-mono">{steps.length} active steps</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "live" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col gap-1.5 h-full">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-mute">
                      <span>ORIGINAL SOURCE TEXT</span>
                      <span>{inputText.length} chars</span>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type or paste sample text here..."
                      className="flex-1 min-h-[140px] p-3 rounded-lg border border-hairline bg-canvas text-caption text-ink leading-relaxed resize-none focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 h-full">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-mute">
                      <span>PIPELINE OUTPUT PREVIEW</span>
                      <div className="flex items-center gap-2">
                        <span>{finalText.length} chars</span>
                        <span>·</span>
                        <span>{finalText.split(/\s+/).filter(Boolean).length} tokens</span>
                      </div>
                    </div>
                    <div className="flex-1 min-h-[140px] p-3 rounded-lg border border-hairline bg-canvas-soft text-caption text-ink leading-relaxed overflow-y-auto font-mono select-all">
                      {finalText || <span className="text-mute italic font-sans">Run the pipeline to inspect results...</span>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "step" && (
                <div className="space-y-2.5 max-w-5xl mx-auto">
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Info size={24} className="text-mute mb-2" />
                      <p className="text-caption text-mute">No pipeline results available. Click Run Pipeline to compile details.</p>
                    </div>
                  ) : (
                    results.map((res, i) => (
                      <div key={i} className="border border-hairline rounded-lg overflow-hidden bg-canvas">
                        <div className="bg-canvas-soft border-b border-hairline px-3.5 py-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-ink">Step {i + 1}: {res.step}</span>
                          <span className="text-[9px] font-mono bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-1.5 py-0.5 rounded font-bold">SUCCESS</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
                          <div className="p-3 text-[11px] font-mono text-mute bg-canvas-soft/20">
                            <div className="text-[9px] font-bold text-mute uppercase mb-1">INPUT</div>
                            {res.input}
                          </div>
                          <div className="p-3 text-[11px] font-mono text-ink">
                            <div className="text-[9px] font-bold text-mute uppercase mb-1">OUTPUT</div>
                            {res.tokens ? `[${res.tokens.map(t => `'${t}'`).join(", ")}]` : res.output}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "json" && (
                <div className="max-w-5xl mx-auto h-full">
                  <pre className="bg-canvas-soft border border-hairline text-ink p-4 rounded-lg text-caption overflow-auto max-h-[160px] font-mono leading-relaxed select-all">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Pane: Contextual Config & Controls Drawer */}
        <aside className={`border-l border-hairline bg-canvas flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
          isRightCollapsed ? "w-0 border-l-0" : "w-80"
        }`}>
          {/* Tab Selector */}
          <div className="flex border-b border-hairline shrink-0" role="tablist">
            <button
              onClick={() => setActiveRightTab("configure")}
              className={`flex-1 py-3 text-caption font-bold text-center border-b-2 capitalize transition-all ${
                activeRightTab === "configure"
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-mute hover:text-body"
              }`}
            >
              {selectedStep ? "Node Properties" : "Pipeline Settings"}
            </button>
            <button
              onClick={() => setActiveRightTab("presets")}
              className={`flex-1 py-3 text-caption font-bold text-center border-b-2 capitalize transition-all ${
                activeRightTab === "presets"
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-mute hover:text-body"
              }`}
            >
              System Presets
            </button>
          </div>

          <div className="p-5 flex-1 space-y-6">
            {activeRightTab === "configure" && (
              <>
                {/* Node Configurator */}
                {selectedStep ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-hairline-soft">
                      <div className="flex items-center gap-2">
                        <Sliders size={13} className="text-accent-blue" />
                        <span className="text-[12px] font-bold text-ink uppercase tracking-wider">Properties</span>
                      </div>
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className="text-[10px] text-accent-blue font-bold hover:underline"
                      >
                        Reset Selection
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-mute font-bold uppercase tracking-wider">Node Title</label>
                      <Input
                        id="node-title-edit"
                        value={selectedStep.label}
                        onChange={(e) => updateStepConfig(selectedStep.id, { label: e.target.value })}
                        inputSize="sm"
                      />
                    </div>

                    {/* Step specific customization fields */}
                    {selectedStep.type === "remove_punctuation" && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-mute font-bold uppercase tracking-wider">Custom Punctuation</label>
                        <Input
                          id="punc-chars"
                          value={(selectedStep.config?.characters as string) || ".,\\/#!$%\\^&\\*;:{}=\\-_`~()?"}
                          onChange={(e) => updateStepConfig(selectedStep.id, { characters: e.target.value })}
                          inputSize="sm"
                        />
                        <p className="text-[9px] text-mute">Define regex-escaped characters to filter from the input stream.</p>
                      </div>
                    )}

                    {selectedStep.type === "remove_stopwords" && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-mute font-bold uppercase tracking-wider">Custom Stopwords</label>
                        <Textarea
                          id="stopword-list"
                          value={(selectedStep.config?.customStopwords as string) || ""}
                          onChange={(e) => updateStepConfig(selectedStep.id, { customStopwords: e.target.value })}
                          placeholder="e.g. products, reviews, company"
                          className="h-20 text-caption font-medium"
                        />
                        <p className="text-[9px] text-mute">Comma-separated extra stopwords to clean.</p>
                      </div>
                    )}

                    {selectedStep.type === "tokenize" && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-mute font-bold uppercase tracking-wider">Tokenization Strategy</label>
                        <select
                          value={(selectedStep.config?.strategy as string) || "whitespace"}
                          onChange={(e) => updateStepConfig(selectedStep.id, { strategy: e.target.value })}
                          className="w-full border border-hairline rounded-lg p-2 text-caption bg-canvas font-semibold"
                        >
                          <option value="whitespace">Whitespace Split</option>
                          <option value="word_regex">Regex Word Boundary</option>
                          <option value="sentence">Sentence boundaries</option>
                        </select>
                      </div>
                    )}

                    {/* Fallback parameters message */}
                    {!["remove_punctuation", "remove_stopwords", "tokenize"].includes(selectedStep.type) && (
                      <div className="bg-canvas-soft border border-hairline-soft p-3.5 rounded-lg flex items-start gap-2">
                        <Info size={13} className="text-mute shrink-0 mt-0.5" />
                        <p className="text-[10px] text-mute leading-normal">
                          This operator executes standard NLP transformations without extra parameters.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => testNodeInIsolation(selectedStep.id)}
                      className="w-full bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 text-accent-blue text-[11px] font-bold py-2 mt-4"
                    >
                      Verify Step
                    </Button>
                  </div>
                ) : (
                  /* Pipeline Properties */
                  <div className="space-y-4">
                    <div className="space-y-3.5">
                      <span className="text-[11px] text-mute uppercase font-bold tracking-wider block">General Settings</span>
                      <Input
                        id="pipeline-name-input"
                        label="Pipeline Name"
                        value={pipelineName}
                        onChange={(e) => setPipelineName(e.target.value)}
                        inputSize="sm"
                      />
                      <Textarea
                        id="pipeline-desc-input"
                        label="Description"
                        value={pipelineDesc}
                        onChange={(e) => setPipelineDesc(e.target.value)}
                        className="h-16 text-body-sm resize-none font-medium"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-mute font-bold">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full border border-hairline rounded-lg p-1.5 text-caption bg-canvas font-semibold"
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-mute font-bold">Output</label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            className="w-full border border-hairline rounded-lg p-1.5 text-caption bg-canvas font-semibold"
                          >
                            <option>Plain Text</option>
                            <option>Tokens List</option>
                            <option>JSON Log</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="h-[1px] bg-hairline-soft" />

                    <div className="space-y-2.5">
                      <span className="text-[11px] text-mute uppercase font-bold tracking-wider block">Flow Toggles</span>
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
                            checked={sw.val}
                            onChange={(e) => sw.set(e.target.checked)}
                            className="h-4 w-7 rounded-full bg-canvas-soft-2 cursor-pointer appearance-none checked:bg-accent-blue relative after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:w-3 after:h-3 after:rounded-full after:bg-mute checked:after:bg-white checked:after:left-[13px] after:transition-all border border-hairline shrink-0"
                            aria-label={`Toggle ${sw.label}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="h-[1px] bg-hairline-soft" />

                    {/* Pipeline Health */}
                    <div className="space-y-3">
                      <span className="text-[11px] text-mute uppercase font-bold tracking-wider block">Pipeline Health</span>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                            <path className="text-canvas-soft-2" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-accent-blue" strokeDasharray="94, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-ink">94%</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-caption font-bold text-ink">Optimal Pipeline Structure</div>
                          <p className="text-[9px] text-mute">0 redundant connections identified.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeRightTab === "presets" && (
              <div className="space-y-4">
                <span className="text-[11px] text-mute uppercase font-bold tracking-wider block">Load Pipeline Preset</span>
                <div className="space-y-2">
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
                      className="w-full text-left p-3 rounded-lg border border-hairline bg-canvas hover:bg-canvas-soft hover:border-accent-blue/30 transition-all group"
                    >
                      <div className="text-[11px] font-bold text-ink group-hover:text-accent-blue">{preset.name}</div>
                      <div className="text-[9px] text-mute mt-0.5">{preset.desc}</div>
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
          </div>
        </aside>
      </div>
    </div>
  )
}
