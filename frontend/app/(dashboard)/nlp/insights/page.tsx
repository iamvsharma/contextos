"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Textarea } from "@/components/ui/Textarea"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"
import { InsightCard } from "@/modules/insights/InsightCard"
import { api } from "@/services/api"
import { usePipelineStore } from "@/store/usePipelineStore"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Sparkles, Hash, Type, Percent, Smile, Heart } from "lucide-react"
import toast from "react-hot-toast"
import type { InsightReport } from "@/types"

const PIE_COLORS = ["#181d26", "#aa2d00", "#a8d8c4", "#fcab79", "#f4d35e", "#0a2e0e"]

export default function InsightsPage() {
  const { steps } = usePipelineStore()
  const [text, setText] = useState("")
  const [report, setReport] = useState<InsightReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) {
      toast.error("Enter text to analyze")
      return
    }
    setIsLoading(true)
    try {
      const data = await api.preprocess.insights(text, steps.length > 0 ? steps : [
        { type: "lowercase", enabled: true },
        { type: "remove_punctuation", enabled: true },
        { type: "remove_stopwords", enabled: true },
      ])
      setReport(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }, [text, steps])

  const sentimentData = report
    ? [
        { name: "Before", score: Math.round(report.sentimentBefore.score * 100) },
        { name: "After", score: Math.round(report.sentimentAfter.score * 100) },
      ]
    : []

  const emojiSentimentData = report
    ? Object.entries(report.emojiSentiments).map(([name, value]) => ({ name, value }))
    : []

  const topWordsData = report?.topWords.slice(0, 10) ?? []

  return (
    <div className="pb-10 space-y-6">
      <div className="border-b border-hairline pb-5">
        <h1 className="text-headline text-ink font-semibold tracking-tight">Insights Dashboard</h1>
        <p className="text-body-sm text-body mt-1">
          Analyze text and compare metrics before and after preprocessing.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <Card variant="default" padding="lg">
              <h2 className="text-title-md text-ink mb-4">Input Text</h2>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to analyze..."
                rows={4}
              />
              <Button
                variant="primary"
                onClick={handleAnalyze}
                disabled={isLoading || !text.trim()}
                className="mt-4 w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} /> Generate Insights
                  </span>
                )}
              </Button>
            </Card>

            {report && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InsightCard
                    label="Original Tokens"
                    value={report.originalTokens}
                    icon={<Type size={20} />}
                  />
                  <InsightCard
                    label="Processed Tokens"
                    value={report.processedTokens}
                    icon={<Type size={20} />}
                  />
                  <InsightCard
                    label="Unique Words"
                    value={report.uniqueWords}
                    icon={<Hash size={20} />}
                  />
                  <InsightCard
                    label="Noise Removed"
                    value={`${report.noiseRemovedPercent}%`}
                    icon={<Percent size={20} />}
                    variant="coral"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InsightCard
                    label="Emoji Count"
                    value={report.emojiCount}
                    icon={<Smile size={20} />}
                    variant="mint"
                  />
                  <InsightCard
                    label="Sentiment (Before)"
                    value={`${report.sentimentBefore.label} ${Math.round(report.sentimentBefore.score * 100)}%`}
                    icon={<Heart size={20} />}
                    variant="peach"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card variant="default" padding="lg">
                    <h3 className="text-title-sm text-ink mb-4">Sentiment Comparison</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={sentimentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e2e6" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#41454d" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#41454d" }} />
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #dddddd",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="score" fill="#181d26" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card variant="default" padding="lg">
                    <h3 className="text-title-sm text-ink mb-4">Emoji Sentiment Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={emojiSentimentData.length > 0 ? emojiSentimentData : [{ name: "No data", value: 1 }]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                        >
                          {(emojiSentimentData.length > 0 ? emojiSentimentData : [{ name: "No data", value: 1 }]).map(
                            (_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #dddddd",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        />
                        <Legend fontSize={12} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {topWordsData.length > 0 && (
                  <Card variant="default" padding="lg">
                    <h3 className="text-title-sm text-ink mb-4">Top Words in Processed Text</h3>
                    <div className="flex flex-wrap gap-2">
                      {topWordsData.map((w, i) => (
                        <Badge key={i} variant="info" className="text-body-md">
                          {w.word}
                          <span className="ml-1 text-muted">({w.count})</span>
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {!report && !isLoading && (
              <div className="p-12 text-center text-muted text-body-md border border-dashed border-hairline rounded-md">
                <BarChart className="mx-auto mb-3" width={40} height={40} data={[]}>
                  <Bar dataKey="score" fill="#e0e2e6" />
                </BarChart>
                <p>Enter text and click Generate Insights to see analysis.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card variant="dark" padding="xl">
              <h3 className="text-title-md text-on-dark">Pipeline Used</h3>
              {steps.length === 0 ? (
                <p className="text-body-md text-on-dark/70 mt-2">
                  Default pipeline: lowercase, remove punctuation, remove stopwords.
                </p>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {steps.map((s) => (
                    <Badge key={s.id} variant="default" className="bg-on-dark/10 text-on-dark">
                      {s.label}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card variant="cream" padding="lg">
              <h3 className="text-title-sm text-ink">Metrics Tracked</h3>
              <ul className="mt-3 space-y-1.5 text-body-md text-body">
                <li>• Token count (before & after)</li>
                <li>• Unique words</li>
                <li>• Noise removal %</li>
                <li>• Emoji count & sentiment</li>
                <li>• Sentiment shift</li>
                <li>• Top frequency words</li>
              </ul>
            </Card>
        </div>
      </div>
    </div>
  )
}
