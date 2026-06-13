"use client"

import React from "react"
import { Handle, Position } from "@xyflow/react"
import { 
  Play, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle
} from "lucide-react"

// Types
interface CustomNodeProps {
  data: {
    id: string
    label: string
    type: string
    enabled: boolean
    config?: Record<string, any>
    isProcessing?: boolean
    status?: "idle" | "success" | "error" | "processing"
    errorMsg?: string
    onToggle?: (id: string) => void
    onConfigure?: (id: string) => void
    onDelete?: (id: string) => void
    onTest?: (id: string) => void
    inputText?: string
    outputText?: string
  }
}

// Input Node
export const InputNode = ({ data }: CustomNodeProps) => {
  return (
    <div className="bg-canvas border border-hairline hover:border-accent-blue/50 rounded-xl shadow-lg w-72 overflow-hidden transition-all duration-200">
      <div className="bg-gradient-to-r from-accent-blue/10 to-indigo-500/10 px-4 py-3 border-b border-hairline-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-[12px] font-bold text-ink uppercase tracking-wider">Pipeline Input</span>
        </div>
        <span className="text-[10px] text-mute font-mono">Source</span>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-[11px] text-mute uppercase tracking-wider font-semibold font-mono">Data Sample</p>
        <div className="bg-canvas-soft border border-hairline-soft p-3 rounded-lg max-h-24 overflow-y-auto text-caption text-ink font-mono whitespace-pre-wrap leading-relaxed select-all">
          {data.inputText || "No input text provided..."}
        </div>
        <div className="flex items-center justify-between text-[10px] text-mute pt-1">
          <span>{data.inputText?.length || 0} characters</span>
          <span>·</span>
          <span>{data.inputText?.split(/\s+/).filter(Boolean).length || 0} words</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent-blue !border-2 !border-canvas hover:!scale-125 transition-transform"
      />
    </div>
  )
}

// Preprocessing Step Node
export const OperatorNode = ({ data }: CustomNodeProps) => {
  const isEnabled = data.enabled
  const statusColor = 
    data.status === "processing" ? "text-accent-blue animate-spin" :
    data.status === "success" ? "text-emerald-500" :
    data.status === "error" ? "text-rose-500" : "text-mute"

  return (
    <div className={`bg-canvas border rounded-xl shadow-lg w-64 overflow-hidden transition-all duration-200 ${
      isEnabled ? "border-hairline hover:border-accent-blue" : "border-hairline-soft opacity-60 hover:opacity-80"
    }`}>
      {/* Handle Inputs */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent-blue !border-2 !border-canvas hover:!scale-125 transition-transform"
      />

      <div className={`px-3 py-2.5 border-b flex items-center justify-between ${
        isEnabled ? "bg-canvas-soft border-hairline-soft" : "bg-canvas border-hairline-soft"
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-6 h-6 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-ink shrink-0 ${
            isEnabled ? "shadow-sm text-accent-blue" : "text-mute"
          }`} aria-hidden="true">
            {data.status === "processing" ? (
              <span className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-[10px] font-bold">f</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-[12px] font-bold truncate leading-tight ${isEnabled ? "text-ink" : "text-mute"}`}>
              {data.label}
            </span>
            <span className="text-[9px] text-mute leading-none font-mono mt-0.5 uppercase">
              {data.type.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Enabled Checkbox / Toggle */}
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={() => data.onToggle?.(data.id)}
          className="h-4 w-7 rounded-full bg-canvas-soft-2 cursor-pointer appearance-none checked:bg-accent-blue relative after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:w-3 after:h-3 after:rounded-full after:bg-mute checked:after:bg-white checked:after:left-[13px] after:transition-all border border-hairline shrink-0"
          aria-label={`Enable ${data.label}`}
        />
      </div>

      <div className="p-3 space-y-2 bg-canvas">
        {/* Isolated Execution Preview / Actions */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={() => data.onConfigure?.(data.id)}
            disabled={!isEnabled}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-canvas-soft border border-hairline hover:bg-canvas-soft-2 text-ink text-[10px] font-bold disabled:opacity-50 transition-colors"
          >
            <Settings size={10} />
            <span>Configure</span>
          </button>
          
          <button
            onClick={() => data.onTest?.(data.id)}
            disabled={!isEnabled}
            className="p-1 rounded bg-canvas-soft border border-hairline hover:bg-canvas-soft-2 text-ink disabled:opacity-50 transition-colors"
            title="Run step preview"
          >
            <Play size={10} />
          </button>
          
          <button
            onClick={() => data.onDelete?.(data.id)}
            className="p-1 rounded bg-canvas-soft border border-hairline hover:bg-error/10 hover:text-error hover:border-error/20 text-mute transition-colors"
            title="Delete step"
          >
            <Trash2 size={10} />
          </button>
        </div>

        {/* Step parameters summary */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="bg-canvas-soft rounded p-1.5 border border-hairline-soft text-[9px] font-mono text-mute overflow-hidden text-ellipsis whitespace-nowrap">
            {Object.entries(data.config)
              .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
              .join(", ")}
          </div>
        )}

        {/* Node Status Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] mt-1">
          {data.status === "success" && (
            <>
              <CheckCircle2 size={10} className="text-emerald-500" />
              <span className="text-mute font-medium">Ready</span>
            </>
          )}
          {data.status === "error" && (
            <>
              <XCircle size={10} className="text-rose-500" />
              <span className="text-rose-500 font-medium truncate" title={data.errorMsg}>{data.errorMsg || "Failed"}</span>
            </>
          )}
          {data.status === "processing" && (
            <>
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
              <span className="text-accent-blue font-medium">Processing...</span>
            </>
          )}
          {(!data.status || data.status === "idle") && (
            <>
              <HelpCircle size={10} className="text-mute" />
              <span className="text-mute font-medium">Pending run</span>
            </>
          )}
        </div>
      </div>

      {/* Handle Outputs */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-accent-blue !border-2 !border-canvas hover:!scale-125 transition-transform"
      />
    </div>
  )
}

// Output Node
export const OutputNode = ({ data }: CustomNodeProps) => {
  return (
    <div className="bg-canvas border border-hairline hover:border-accent-blue/50 rounded-xl shadow-lg w-72 overflow-hidden transition-all duration-200">
      {/* Handle Inputs */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent-blue !border-2 !border-canvas hover:!scale-125 transition-transform"
      />

      <div className="bg-gradient-to-r from-indigo-500/10 to-accent-blue/10 px-4 py-3 border-b border-hairline-soft flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[12px] font-bold text-ink uppercase tracking-wider">Pipeline Output</span>
        </div>
        <span className="text-[10px] text-mute font-mono">Sink</span>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-[11px] text-mute uppercase tracking-wider font-semibold font-mono">Processed Output</p>
        <div className="bg-canvas-soft border border-hairline-soft p-3 rounded-lg max-h-24 overflow-y-auto text-caption text-ink font-mono whitespace-pre-wrap leading-relaxed select-all">
          {data.outputText || <span className="text-mute italic">No output generated yet...</span>}
        </div>
        <div className="flex items-center justify-between text-[10px] text-mute pt-1">
          <span>{data.outputText?.length || 0} characters</span>
          <span>·</span>
          <span>{data.outputText?.split(/\s+/).filter(Boolean).length || 0} tokens</span>
        </div>
      </div>
    </div>
  )
}
