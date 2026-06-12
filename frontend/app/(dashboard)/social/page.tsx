"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Textarea } from "@/components/ui/Textarea"
import { Spinner } from "@/components/ui/Spinner"
import { api } from "@/services/api"
import { usePipelineStore } from "@/store/usePipelineStore"
import { AtSign, Hash, Link2, Smile, Sparkles, MessageSquareQuote } from "lucide-react"
import toast from "react-hot-toast"
import type { SocialMediaFeatures, TransformationResult } from "@/types"

export default function SocialPage() {
  const { inputText, setInputText, steps, addStep, setResults, setSocialFeatures, results } = usePipelineStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [features, setFeatures] = useState<SocialMediaFeatures | null>(null)
  const [socialText, setSocialText] = useState("")

  const handleAnalyze = useCallback(async () => {
    if (!socialText.trim()) {
      toast.error("Enter social media text to analyze")
      return
    }
    setIsProcessing(true)
    try {
      const [socialData, processData] = await Promise.all([
        api.preprocess.social(socialText),
        api.preprocess.execute(socialText, [
          { type: "remove_mentions", enabled: true },
          { type: "remove_hashtags", enabled: true },
          { type: "remove_urls", enabled: true },
          { type: "handle_emojis", enabled: true },
          { type: "normalize_slang", enabled: true },
          { type: "lowercase", enabled: true },
          { type: "remove_punctuation", enabled: true },
        ]),
      ])
      setFeatures(socialData)
      setSocialFeatures(socialData)
      setResults(processData.results)
      toast.success("Social media analysis complete")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsProcessing(false)
    }
  }, [socialText, setResults, setSocialFeatures])

  const examples = [
    "OMG I LOVED the movie!!! 😍😍 @bestfilms go watch it #mustsee https://example.com/review",
    "This is so bad lmaooooo 😡 @worstservice never again #scam https://scam.com",
    "Hey guys, gonna b @ the party 2nite! 🎉 bring ur friends #fun #party2024",
  ]

  return (
    <div className="pb-10 space-y-6">
      <div className="border-b border-hairline pb-5">
        <h1 className="text-headline text-ink font-semibold tracking-tight">Social Media Mode</h1>
        <p className="text-body-sm text-body mt-1">
          Analyze and clean social media text — handle emojis, mentions, hashtags, URLs, and slang.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <Card variant="default" padding="lg">
              <h2 className="text-title-md text-ink mb-4">Social Media Text</h2>
              <Textarea
                value={socialText}
                onChange={(e) => setSocialText(e.target.value)}
                placeholder="Paste social media text here..."
                rows={4}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSocialText(ex)}
                    className="text-caption text-muted hover:text-ink px-3 py-1.5 bg-surface-soft rounded-md border border-hairline transition-colors"
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>
            </Card>

            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={isProcessing || !socialText.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} /> Analyze & Clean
                </span>
              )}
            </Button>

            {features && (
              <Card variant="default" padding="lg">
                <h2 className="text-title-md text-ink mb-4">Analysis Results</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface-soft rounded-md text-center">
                    <AtSign size={20} className="mx-auto text-muted mb-1" />
                    <div className="text-title-md text-ink">{features.mentionCount}</div>
                    <div className="text-caption text-muted">Mentions</div>
                  </div>
                  <div className="p-4 bg-surface-soft rounded-md text-center">
                    <Hash size={20} className="mx-auto text-muted mb-1" />
                    <div className="text-title-md text-ink">{features.hashtagCount}</div>
                    <div className="text-caption text-muted">Hashtags</div>
                  </div>
                  <div className="p-4 bg-surface-soft rounded-md text-center">
                    <Link2 size={20} className="mx-auto text-muted mb-1" />
                    <div className="text-title-md text-ink">{features.urlCount}</div>
                    <div className="text-caption text-muted">URLs</div>
                  </div>
                  <div className="p-4 bg-surface-soft rounded-md text-center">
                    <Smile size={20} className="mx-auto text-muted mb-1" />
                    <div className="text-title-md text-ink">{features.emojiCount}</div>
                    <div className="text-caption text-muted">Emojis</div>
                  </div>
                </div>

                {features.emojiList.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-title-sm text-ink mb-3">Emoji Analysis</h3>
                    <div className="space-y-2">
                      {features.emojiList.map((emoji, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-2 bg-surface-soft rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-title-md">{emoji.emoji}</span>
                            <span className="text-body-md text-body">{emoji.meaning}</span>
                          </div>
                          <Badge
                            variant={
                              emoji.sentiment === "positive"
                                ? "success"
                                : emoji.sentiment === "negative"
                                ? "warning"
                                : "default"
                            }
                          >
                            {emoji.sentiment}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {results.length > 0 && (
              <Card variant="default" padding="lg">
                <h2 className="text-title-md text-ink mb-4">Cleaned Text</h2>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="p-3 bg-surface-soft rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info">Step {i + 1}</Badge>
                        <span className="text-caption text-muted">{r.step}</span>
                      </div>
                      <p className="text-body-md text-ink">{r.output}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card variant="signature-coral" padding="xl">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquareQuote size={24} className="text-on-primary/80" />
                <h3 className="text-title-md text-on-primary">Social Features</h3>
              </div>
              <ul className="space-y-2 text-body-md text-on-primary/80">
                <li className="flex items-center gap-2">
                  <Smile size={14} /> Emoji → Text conversion
                </li>
                <li className="flex items-center gap-2">
                  <Smile size={14} /> Emoji sentiment detection
                </li>
                <li className="flex items-center gap-2">
                  <AtSign size={14} /> Remove @mentions
                </li>
                <li className="flex items-center gap-2">
                  <Hash size={14} /> Remove #hashtags
                </li>
                <li className="flex items-center gap-2">
                  <Link2 size={14} /> Remove URLs
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles size={14} /> Slang normalization
                </li>
              </ul>
            </Card>
        </div>
      </div>
    </div>
  )
}
