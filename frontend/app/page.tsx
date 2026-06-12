"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Settings,
  Database,
  Share2,
  BarChart3,
  Terminal,
  Zap,
  Shield,
  Layers,
  Cpu,
  List,
  Smile,
  Hash,
  Link2,
  CaseSensitive,
  ChevronRight,
  Globe,
  Clock,
  TrendingUp,
  Lock,
  Sparkles,
  FileText,
  GitBranch,
} from "lucide-react"

const features = [
  {
    id: "pipeline",
    tab: "Pipeline Builder",
    icon: Settings,
    color: "text-ink bg-canvas-soft border-hairline",
    title: "Build preprocessing pipelines visually",
    description:
      "Chain 50+ NLP operations together in a visual drag-and-drop interface. No boilerplate code, no configuration files — just connect the steps and run.",
    highlights: ["50+ NLP operations", "Visual drag-and-drop", "JSON export", "Version control"],
  },
  {
    id: "dataset",
    tab: "Dataset Mode",
    icon: Database,
    color: "text-ink bg-canvas-soft border-hairline",
    title: "Process entire datasets in one click",
    description:
      "Upload CSV, JSON or text files. Select columns, preview results in real time, and export cleaned data ready for model training.",
    highlights: ["CSV & JSON import", "Column selection", "Real-time preview", "Bulk processing"],
  },
  {
    id: "social",
    tab: "Social Media",
    icon: Smile,
    color: "text-ink bg-canvas-soft border-hairline",
    title: "Handle messy social text effortlessly",
    description:
      "Automatically detect and process emojis, hashtags, mentions, URLs, slang and code-switching text across 20+ languages.",
    highlights: ["Emoji detection", "Slang expansion", "Multi-language", "Hashtag segmentation"],
  },
  {
    id: "insights",
    tab: "Text Insights",
    icon: BarChart3,
    color: "text-ink bg-canvas-soft border-hairline",
    title: "Understand your text with analytics",
    description:
      "Get token distributions, vocabulary richness, readability scores, and sentiment breakdowns — all visualized in real time.",
    highlights: ["Token analytics", "Readability scores", "Sentiment analysis", "Word frequency"],
  },
]

const steps = [
  { num: "1", label: "Lowercase", icon: CaseSensitive, color: "text-ink bg-canvas-soft border-hairline" },
  { num: "2", label: "Remove URLs", icon: Link2, color: "text-ink bg-canvas-soft border-hairline" },
  { num: "3", label: "Remove Emojis", icon: Smile, color: "text-ink bg-canvas-soft border-hairline" },
  { num: "4", label: "Remove Punct.", icon: Hash, color: "text-ink bg-canvas-soft border-hairline" },
  { num: "5", label: "Tokenization", icon: List, color: "text-ink bg-canvas-soft border-hairline" },
]

const products = [
  {
    name: "Pipeline Builder",
    icon: GitBranch,
    color: "bg-canvas hover:bg-canvas-soft border border-hairline",
    textColor: "text-ink",
    description: "Create custom preprocessing pipelines with 50+ NLP operations in an intuitive interface.",
  },
  {
    name: "Dataset Mode",
    icon: Database,
    color: "bg-canvas hover:bg-canvas-soft border border-hairline",
    textColor: "text-ink",
    description: "Process large datasets in bulk with column selection, preview and export.",
  },
  {
    name: "Social Media Mode",
    icon: Smile,
    color: "bg-canvas hover:bg-canvas-soft border border-hairline",
    textColor: "text-ink",
    description: "Handle emojis, hashtags, mentions, slang and noisy social media text.",
  },
  {
    name: "Text Insights",
    icon: BarChart3,
    color: "bg-canvas hover:bg-canvas-soft border border-hairline",
    textColor: "text-ink",
    description: "Get detailed analytics, stats and visualizations of your processed text.",
  },
  {
    name: "API Playground",
    icon: Terminal,
    color: "bg-canvas hover:bg-canvas-soft border border-hairline",
    textColor: "text-ink",
    description: "Test our APIs, generate code snippets and integrate easily into your applications.",
  },
  {
    name: "Export & Integrate",
    icon: Share2,
    color: "bg-ink hover:bg-ink/90 text-canvas",
    textColor: "text-canvas",
    description: "Export results in multiple formats and connect with your ML workflows.",
  },
]

function bgBlackHover() {
  return "bg-ink hover:bg-ink/90 text-canvas"
}

export default function MarketingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased">
      {/* Top Nav */}
      <header className="h-14 bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="max-w-content mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-ink">
            <span className="w-6 h-6 bg-ink rounded flex items-center justify-center text-canvas font-bold text-xs" aria-hidden="true">
              TP
            </span>
            <span className="font-sans font-semibold text-body-sm text-ink tracking-tight">
              TextPrep Pro
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {["Features", "Solutions", "Resources", "Pricing", "API", "Docs"].map((item) => (
              <Link
                key={item}
                href={item === "API" ? "/playground" : "/dashboard"}
                className="text-body-sm text-body hover:text-ink transition-colors font-medium focus-visible:ring-2 focus-visible:ring-ink"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-body-sm text-body hover:text-ink font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ink">
              Log in
            </Link>
            <Link href="/dashboard" className="focus-visible:ring-2 focus-visible:ring-ink rounded-md">
              <span className="bg-ink text-canvas text-xs font-bold rounded-md px-3.5 py-2 inline-flex items-center justify-center hover:bg-ink/90 transition-colors shadow-sm cursor-pointer">
                Sign up
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-20 bg-canvas border-b border-hairline-soft">
        <div className="max-w-content mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6 relative z-10">
            <div className="space-y-4">
              <span className="text-eyebrow font-medium uppercase tracking-wider text-ink bg-canvas-soft-2 px-2.5 py-1 rounded">
                NLP Preprocessing Platform
              </span>
              <h1 className="text-headline md:text-[50px] text-ink leading-[1.1] tracking-tight font-semibold text-balance">
                Clean, normalize and transform text like <span className="text-body">never before</span>
              </h1>
            </div>
            <p className="text-body-sm text-body leading-relaxed max-w-lg font-medium text-pretty">
              The all-in-one NLP text preprocessing platform to build pipelines,
              handle messy text, analyze social content and prepare data
              for machine learning models.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard" className="focus-visible:ring-2 focus-visible:ring-ink rounded-md">
                <span className="bg-ink text-canvas text-xs font-bold rounded-md px-5 py-3.5 inline-flex items-center gap-2 hover:bg-ink/90 transition-colors shadow-sm cursor-pointer">
                  Get Started for Free <ArrowRight size={14} />
                </span>
              </Link>
              <Link href="/pipeline" className="focus-visible:ring-2 focus-visible:ring-ink rounded-md">
                <span className="bg-canvas text-ink text-xs font-bold rounded-md px-5 py-3.5 border border-hairline inline-flex items-center gap-2 hover:bg-canvas-soft transition-colors shadow-sm cursor-pointer">
                  <Play size={12} fill="currentColor" className="text-ink" aria-hidden="true" /> Live Demo
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-caption text-mute font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-ink" aria-hidden="true" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-ink" aria-hidden="true" /> Free pipeline templates
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-ink" aria-hidden="true" /> Export in multiple formats
              </span>
            </div>
          </div>

          {/* Right: full app mockup */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full bg-canvas rounded-lg border border-hairline shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline bg-canvas-soft">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-mute/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-mute/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-mute/40" />
                </div>
                <div className="flex items-center gap-2 bg-canvas rounded border border-hairline px-3 py-1 shadow-sm">
                  <Sparkles size={11} className="text-ink" aria-hidden="true" />
                  <span className="text-caption font-medium text-body">Pipeline Builder</span>
                </div>
                <div className="w-8 h-1" />
              </div>

              <div className="p-5 space-y-5">
                <div className="bg-canvas-soft rounded border border-hairline p-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {steps.map((step, i) => {
                      const Icon = step.icon
                      return (
                        <div key={i} className="flex items-center gap-1.5 shrink-0">
                          {i > 0 && (
                            <div className="w-4 h-[1px] bg-mute/40" aria-hidden="true" />
                          )}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-hairline bg-canvas text-caption font-medium shadow-sm">
                            <Icon size={12} className="text-body" aria-hidden="true" />
                            <span>{step.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <span className="text-eyebrow text-mute font-medium uppercase tracking-wider">Input Text</span>
                    <div className="flex-1 bg-canvas-soft border border-hairline rounded p-3.5 min-h-[160px] text-body-sm text-body leading-relaxed flex flex-col justify-between">
                      <p className="font-medium text-[13px]">
                        OMG!!! 🔥 This is sooo good 😃😃 Check this out: https://example.com #awesome @user
                      </p>
                      <div className="flex items-center justify-between mt-4 text-eyebrow font-medium text-mute tabular-nums">
                        <span>23 words</span>
                        <span>166 chars</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex md:flex-col items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center shadow-sm" aria-hidden="true">
                      <ChevronRight size={14} className="text-ink" />
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-eyebrow text-mute font-medium uppercase tracking-wider">Output Text</span>
                      <span className="text-eyebrow text-ink bg-canvas-soft-2 px-2 py-0.5 rounded font-medium border border-hairline">Text Cleaned</span>
                    </div>
                    <div className="flex-1 bg-canvas-soft border border-hairline rounded p-3.5 min-h-[160px] flex flex-col justify-between">
                      <p className="text-[13px] text-ink font-medium bg-canvas p-2.5 rounded border border-hairline leading-relaxed shadow-sm">
                        omg this is sooo good check this out awesome user
                      </p>
                      <div className="flex items-center justify-between mt-4 text-eyebrow font-medium text-mute tabular-nums">
                        <span>10 words</span>
                        <span>50 chars</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-canvas-soft rounded border border-hairline p-4 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                        <path className="text-hairline" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-ink" strokeDasharray="78, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-eyebrow font-medium text-ink tabular-nums">78%</span>
                    </div>
                    <div>
                      <h4 className="text-caption font-medium text-ink">Noise Removed</h4>
                      <p className="text-caption text-body font-medium">Your text is highly optimized for NLP</p>
                    </div>
                  </div>

                  <div className="flex gap-5 text-right tabular-nums">
                    <div>
                      <div className="text-eyebrow text-mute font-medium uppercase tracking-wider">Tokens</div>
                      <div className="text-body-sm font-semibold text-ink">32</div>
                    </div>
                    <div>
                      <div className="text-eyebrow text-mute font-medium uppercase tracking-wider">Unique</div>
                      <div className="text-body-sm font-semibold text-ink">18</div>
                    </div>
                    <div>
                      <div className="text-eyebrow text-mute font-medium uppercase tracking-wider">Characters</div>
                      <div className="text-body-sm font-semibold text-ink">166</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="py-20 bg-canvas border-b border-hairline">
        <div className="max-w-content mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-eyebrow font-medium uppercase tracking-wider text-ink bg-canvas-soft-2 px-2 py-0.5 rounded">
              Powerful Modules
            </span>
            <h2 className="text-headline text-ink font-semibold tracking-tight text-balance">
              Everything you need for advanced text preprocessing
            </h2>
            <p className="text-body-sm text-body font-medium leading-relaxed">
              Build custom pipelines, clean datasets in bulk, extract key variables, and verify pipeline quality instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const Icon = product.icon
              return (
                <Link key={product.name} href="/dashboard" className="block group focus-visible:ring-2 focus-visible:ring-ink rounded-lg">
                  <div className="bg-canvas border border-hairline rounded-lg p-6 min-h-[200px] flex flex-col justify-between hover:border-ink hover:shadow-lg transition-all duration-200">
                    <div className="w-9 h-9 rounded bg-canvas-soft border border-hairline flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-canvas transition-colors" aria-hidden="true">
                      <Icon size={16} />
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <h3 className="text-body-sm font-medium text-ink group-hover:text-ink">
                        {product.name}
                      </h3>
                      <p className="text-[13px] text-body font-medium leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="py-12 bg-canvas-soft border-b border-hairline">
        <div className="max-w-content mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-0.5">
            <h4 className="text-caption font-medium text-ink">
              Trusted by developers and teams worldwide
            </h4>
            <p className="text-caption text-body font-medium">
              Join 10,000+ users building better NLP-powered products.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-mute font-semibold tracking-wider text-xs">
            {["Google", "Microsoft", "Amazon", "Airbnb", "Spotify", "Docker", "IBM"].map((name) => (
              <span key={name} className="hover:text-body transition-colors cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Characteristics/Benefits */}
      <section className="py-20 bg-canvas">
        <div className="max-w-content mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Optimized execution engine processing text in milliseconds." },
            { icon: Shield, title: "Privacy First", desc: "Your data is fully encrypted and never stored on our servers." },
            { icon: Layers, title: "Highly Scalable", desc: "Built to process datasets with millions of rows effortlessly." },
            { icon: Cpu, title: "Developer Friendly", desc: "Includes REST APIs, webhooks, and client SDKs in Python/Node." },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-canvas-soft border border-hairline rounded flex items-center justify-center text-ink shrink-0 shadow-sm" aria-hidden="true">
                  <Icon size={16} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-body-sm font-medium text-ink">{item.title}</h4>
                  <p className="text-[13px] text-body leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 bg-ink text-canvas/60 border-t border-ink">
        <div className="max-w-content mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-6 h-6 bg-canvas rounded flex items-center justify-center text-ink font-extrabold text-xs">TP</span>
                <span className="font-sans font-semibold text-body-sm text-canvas tracking-tight">TextPrep Pro</span>
              </Link>
              <p className="text-caption text-canvas/60 leading-relaxed font-medium">
                The NLP preprocessing platform for modern data teams.
              </p>
            </div>

            {[
              { heading: "Product", links: ["Pipeline Builder", "Dataset Mode", "Social Media Mode", "Text Insights", "API Playground"] },
              { heading: "Developers", links: ["Documentation", "API Reference", "SDKs", "Changelog", "Status"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
            ].map((col) => (
              <div key={col.heading} className="space-y-3.5">
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-canvas">{col.heading}</h5>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-[13px] text-canvas/60 hover:text-canvas transition-colors cursor-pointer font-medium">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-canvas/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-caption text-canvas/40 font-medium tabular-nums">
            <span>&copy;&nbsp;{new Date().getFullYear()}&nbsp;TextPrep Pro. All rights reserved.</span>
            <div className="flex items-center gap-6">
              {["Twitter", "GitHub", "Discord", "LinkedIn"].map((s) => (
                <span key={s} className="hover:text-canvas transition-colors cursor-pointer font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
