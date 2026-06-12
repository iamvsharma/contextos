"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { CodeBlock } from "@/modules/playground/CodeBlock"
import { usePipelineStore } from "@/store/usePipelineStore"
import { Textarea } from "@/components/ui/Textarea"
import { useState } from "react"
import { api } from "@/services/api"
import { Spinner } from "@/components/ui/Spinner"
import toast from "react-hot-toast"
import { Terminal, Copy, Check } from "lucide-react"

export default function PlaygroundPage() {
  const { steps } = usePipelineStore()
  const [testText, setTestText] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const apiCode = useMemo(() => {
    const activeSteps = steps.filter((s) => s.enabled)
    const body = {
      text: "YOUR_TEXT_HERE",
      steps: activeSteps.map((s) => ({
        type: s.type,
        enabled: s.enabled,
      })),
    }
    return JSON.stringify(body, null, 2)
  }, [steps])

  const curlCommand = useMemo(() => {
    return `curl -X POST http://localhost:8000/api/preprocess \\
  -H "Content-Type: application/json" \\
  -d '${apiCode.replace(/'/g, "'\\''")}'`
  }, [apiCode])

  const pythonCode = useMemo(() => {
    return `import requests

response = requests.post(
    "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/preprocess",
    json=${apiCode.replace(/"YOUR_TEXT_HERE"/, '"your text here"')}
)
print(response.json())`
  }, [apiCode])

  const handleTestRequest = async () => {
    if (!testText.trim()) {
      toast.error("Enter test text")
      return
    }
    setIsLoading(true)
    try {
      const data = await api.preprocess.execute(testText, steps)
      setResponse(JSON.stringify(data, null, 2))
      toast.success("Request succeeded")
    } catch (err) {
      setResponse(JSON.stringify({ error: err instanceof Error ? err.message : "Request failed" }, null, 2))
      toast.error("Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pb-10 space-y-6">
      <div className="border-b border-hairline pb-5">
        <h1 className="text-headline text-ink font-semibold tracking-tight">API Playground</h1>
        <p className="text-body-sm text-body mt-1">
          Test your pipeline configuration and generate API requests for external integration.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-title-md text-ink">Request Body</h2>
                <Badge variant="info">{steps.filter((s) => s.enabled).length} active steps</Badge>
              </div>
              <CodeBlock code={apiCode} language="json" />

              {steps.length === 0 && (
                <p className="text-caption text-muted mt-3">
                  No pipeline steps configured. Go to Pipeline Builder to add steps first.
                </p>
              )}
            </Card>

            <Card variant="default" padding="lg">
              <h2 className="text-title-md text-ink mb-4">cURL</h2>
              <CodeBlock code={curlCommand} language="bash" />
            </Card>

            <Card variant="default" padding="lg">
              <h2 className="text-title-md text-ink mb-4">Python (requests)</h2>
              <CodeBlock code={pythonCode} language="python" />
            </Card>

            <Card variant="default" padding="lg">
              <h2 className="text-title-md text-ink mb-4">Test Request</h2>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter test text..."
                rows={3}
              />
              <Button
                variant="primary"
                onClick={handleTestRequest}
                disabled={isLoading || !testText.trim()}
                className="mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Terminal size={16} /> Send Request
                  </span>
                )}
              </Button>
              {response && (
                <div className="mt-4">
                  <h3 className="text-title-sm text-ink mb-2">Response</h3>
                  <CodeBlock code={response} language="json" />
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card variant="signature-forest" padding="xl">
              <h3 className="text-title-md text-on-dark">Pipeline Steps</h3>
              {steps.length === 0 ? (
                <p className="text-body-md text-on-dark/70 mt-2">No steps configured.</p>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {steps.map((s) => (
                    <Badge key={s.id} variant="default" className="bg-on-dark/10 text-on-dark flex items-center gap-2">
                      {s.label}
                      {s.enabled ? <Check size={12} /> : <span className="opacity-50">disabled</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="cream" padding="lg">
              <h3 className="text-title-sm text-ink">API Endpoints</h3>
              <div className="mt-3 space-y-2">
                <div>
                  <code className="text-caption bg-surface-soft px-1.5 py-0.5 rounded">POST /api/preprocess</code>
                  <p className="text-body-md text-muted mt-0.5">Single text preprocessing</p>
                </div>
                <div>
                  <code className="text-caption bg-surface-soft px-1.5 py-0.5 rounded">POST /api/insights</code>
                  <p className="text-body-md text-muted mt-0.5">Text analysis & insights</p>
                </div>
                <div>
                  <code className="text-caption bg-surface-soft px-1.5 py-0.5 rounded">POST /api/social/analyze</code>
                  <p className="text-body-md text-muted mt-0.5">Social media analysis</p>
                </div>
              </div>
            </Card>
        </div>
      </div>
    </div>
  )
}
