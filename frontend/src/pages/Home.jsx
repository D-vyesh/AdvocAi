"use client"

import {
  ArrowRight,
  Shield,
  FileText,
  Zap,
  CheckCircle2,
  Sparkles,
  X,
  PenTool,
  AlertTriangle,
  FileCheck,
  Scale,
  Award,
} from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Link } from "react-router-dom"
import React, { useState, useRef } from "react"
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [activeDemo, setActiveDemo] = useState("analyzer")
  const { isAuthenticated } = useAuth()

  // Interactive state for the Smart Contract Intelligence Console
  const [activeContractIndex, setActiveContractIndex] = useState(0)
  const [fixedClauses, setFixedClauses] = useState({})
  const [isStamped, setIsStamped] = useState(false)
  const [activeTool, setActiveTool] = useState("scanner")

  // Mouse coordinate + subtle 3D cushion tilt state for the Sentinel HUD
  const [mousePos, setMousePos] = useState({ x: 240, y: 180 })
  const [hudTilt, setHudTilt] = useState({ rx: 0, ry: 0 })
  const consoleRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!consoleRef.current) return
    const rect = consoleRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })
    const ry = ((x / rect.width) - 0.5) * 6
    const rx = (0.5 - (y / rect.height)) * 6
    setHudTilt({ rx, ry })
  }

  const handleMouseLeave = () => {
    setHudTilt({ rx: 0, ry: 0 })
  }

  const contractsData = [
    {
      id: "msa",
      name: "Enterprise MSA v2.4.pdf",
      category: "Master Services",
      score: "96%",
      scoreLabel: "Optimal Protection",
      auditHash: "0x9f4a...7c21 • Verified 2m ago",
      clauses: [
        {
          id: "c1",
          title: "§ 12.1 Mutual Indemnification",
          status: "Verified",
          statusColor: "emerald",
          desc: "Liability mutualized & strictly capped to 12 months fees paid. Standard compliance met.",
          fixable: false,
        },
        {
          id: "c2",
          title: "§ 8.3 Non-Compete Jurisdiction",
          status: "Flagged Exposure",
          statusColor: "amber",
          desc: "36-month worldwide non-compete is overly restrictive under modern statutory guidelines.",
          fixable: true,
          fixText: "Restricted to 12 months within direct competitive industry segments.",
        },
        {
          id: "c3",
          title: "§ 4.2 Work-for-Hire Assignment",
          status: "Protected",
          statusColor: "cyan",
          desc: "Irrevocable worldwide copyright and patent assignment with complete moral rights waiver.",
          fixable: false,
        },
      ]
    },
    {
      id: "nda",
      name: "Mutual Bilateral NDA.pdf",
      category: "Confidentiality",
      score: "98%",
      scoreLabel: "Bank-Grade Safe",
      auditHash: "0x4b12...88e0 • Verified 5m ago",
      clauses: [
        {
          id: "c1",
          title: "§ 2.1 Definition of Trade Secrets",
          status: "Verified",
          statusColor: "emerald",
          desc: "Clearly demarcates confidential proprietary data with standard carve-outs.",
          fixable: false,
        },
        {
          id: "c2",
          title: "§ 5.2 Return or Destruction",
          status: "Action Advised",
          statusColor: "amber",
          desc: "Missing mandatory 14-day written confirmation upon data purge request.",
          fixable: true,
          fixText: "Added 14-day certified written certificate of destruction requirement.",
        },
        {
          id: "c3",
          title: "§ 9.1 Governing Law & Venue",
          status: "Protected",
          statusColor: "cyan",
          desc: "Delaware Chancery Court designation with expedited injunctive relief rights.",
          fixable: false,
        },
      ]
    },
    {
      id: "advisor",
      name: "Strategic Advisor Deed.pdf",
      category: "Equity & Advisory",
      score: "94%",
      scoreLabel: "Verified Terms",
      auditHash: "0x7e01...31fa • Verified 9m ago",
      clauses: [
        {
          id: "c1",
          title: "§ 1.3 Advisory Service Commitments",
          status: "Verified",
          statusColor: "emerald",
          desc: "5 hours monthly advisory guidance with quarterly milestone governance.",
          fixable: false,
        },
        {
          id: "c2",
          title: "§ 3.4 Acceleration Upon Acquisition",
          status: "Review Recommended",
          statusColor: "amber",
          desc: "Single-trigger acceleration requires board consent before liquidation events.",
          fixable: true,
          fixText: "Structured into double-trigger acceleration with good-reason protections.",
        },
        {
          id: "c3",
          title: "§ 6.1 Assignment of Inventions",
          status: "Protected",
          statusColor: "cyan",
          desc: "Pre-existing advisor IP carved out; all new company advisory IP assigned.",
          fixable: false,
        },
      ]
    }
  ]

  const activeContract = contractsData[activeContractIndex]
  const hasFixedClause = activeContract.clauses.some(
    (c) => c.fixable && fixedClauses[`${activeContract.id}-${c.id}`]
  )
  const displayScore = hasFixedClause ? "99%" : activeContract.score
  const displayScoreLabel = hasFixedClause ? "Risk Neutralized" : activeContract.scoreLabel

  const toggleFixClause = (contractId, clauseId) => {
    const key = `${contractId}-${clauseId}`
    setFixedClauses((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const featureDetails = {
    analyzer: {
      title: "AI Document Analyzer",
      description:
        "Transform complex legal documents into clear, actionable insights with our advanced AI-powered analysis engine.",
      features: [
        "Instant clause-by-clause breakdown",
        "Risk flagging and liability alerts",
        "Ask follow-up questions about any document",
      ],
    },
    creator: {
      title: "Smart Document Creator",
      description:
        "Generate custom legal documents through an intuitive AI-powered chatbot. Describe what you need and edit through natural conversation.",
      features: [
        "Conversational document generation",
        "Edit through natural chat interaction",
        "Download, edit, or regenerate instantly",
      ],
    },
    signature: {
      title: "Secure E-Signature",
      description:
        "Sign documents with complete legal validity and security. Compliant with eIDAS, ESIGN Act, and other global regulations.",
      features: [
        "Legally binding digital signatures",
        "Multi-party signature workflows",
        "Bank-level encryption and audit trail",
      ],
    },
  }

  return (
    <div className="min-h-screen text-slate-100 overflow-hidden relative">
      <div className="relative z-10">

        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">

            {/* Left Column: Hero Text & Call to Actions */}
            <div className="lg:col-span-6 space-y-6 text-left animate-fade-in">
              {/* Fluffy Glossy Pill Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 glass-pill shadow-glass-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9] animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-200 via-white to-sky-200 bg-clip-text text-transparent">
                  Autonomous Liquid Legal Intelligence
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.06] text-white font-display">
                Legal clarity in{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">
                    seconds
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400/90 via-purple-400/80 to-amber-300/90 rounded-full blur-[2px]" />
                </span>
                , not hours.
              </h1>

              <p className="text-base sm:text-lg text-slate-200/85 leading-relaxed max-w-xl font-normal">
                Analyze contracts, detect hidden liabilities, compose customized agreements, and finalize legally binding digital signatures inside a weightless, liquid-glass workspace.
              </p>

              {/* Attractive Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      variant="aurora"
                      className="h-12 px-8 text-sm group"
                      asChild
                    >
                      <Link to="/document-creation">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <span>Open Document Studio</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="glass"
                      className="h-12 px-7 text-sm"
                      asChild
                    >
                      <Link to="/document-analyser">Analyze Agreement</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="aurora"
                      className="h-12 px-8 text-sm group"
                      asChild
                    >
                      <Link to="/signup">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="glass"
                      className="h-12 px-7 text-sm"
                      asChild
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Cushioned Feature Checklist */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-200/85">
                {["Zero Credit Card Required", "Bank-Grade Encryption", "eIDAS & ESIGN Compliant"].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 glass-subtle px-3 py-1.5 rounded-full">
                    <span className="w-4 h-4 rounded-full bg-cyan-400/25 text-cyan-300 flex items-center justify-center font-bold text-[10px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Fluffy Interactive Liquid Glass Sentinel Console */}
            <div className="lg:col-span-6 flex justify-center [perspective:1200px]">
              <div
                ref={consoleRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `rotateX(${hudTilt.rx.toFixed(2)}deg) rotateY(${hudTilt.ry.toFixed(2)}deg)`,
                }}
                className="relative w-full max-w-lg glass-panel glass-reactive p-6 sm:p-7 rounded-[2.5rem] border border-white/35 shadow-fluffy overflow-hidden transition-transform duration-300 ease-out group"
              >
                {/* Dynamic Specular Light Glint Tracking Mouse */}
                <div
                  className="absolute pointer-events-none transition-opacity duration-300 rounded-full"
                  style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    width: '340px',
                    height: '340px',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(0, 212, 255, 0.08) 42%, transparent 72%)',
                    zIndex: 1,
                  }}
                />

                {/* Top Interactive Contract Selector Tabs */}
                <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white truncate">
                      Contract Sentinel HUD
                    </span>
                  </div>

                  {/* 3 Interactive Fluffy Document Pills */}
                  <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                    {contractsData.map((contract, idx) => (
                      <button
                        key={contract.id}
                        type="button"
                        onClick={() => {
                          setActiveContractIndex(idx)
                          setIsStamped(false)
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ease-fluffy ${
                          activeContractIndex === idx
                            ? "bg-gradient-to-b from-white/30 to-cyan-400/20 text-white border border-white/45 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85),0_4px_12px_rgba(0,212,255,0.25)] scale-[1.04]"
                            : "text-slate-300/80 hover:text-white"
                        }`}
                      >
                        {contract.category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Document Header Banner with Live Risk Health Gauge */}
                <div className="relative z-10 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="glass-circle w-12 h-12 shadow-glass-glow flex-shrink-0">
                      <FileCheck className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {activeContract.name}
                      </h4>
                      <p className="text-xs text-slate-300/80 flex items-center gap-1.5">
                        <span className="text-cyan-300 font-semibold">{activeContract.category}</span>
                        <span>• {activeTool === "audit" ? activeContract.auditHash : "3 Verified Clauses"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Glossy Health Badge */}
                  <div className="glass-pill px-3.5 py-1.5 flex items-center gap-2 flex-shrink-0 border-white/35">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white block leading-none">
                        {displayScore}
                      </span>
                      <span className="text-[10px] text-emerald-300 font-semibold">
                        {displayScoreLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Clause Cards Deck */}
                <div className="relative z-10 space-y-2.5 py-1">
                  {activeContract.clauses.map((clause) => {
                    const isFixed = !!fixedClauses[`${activeContract.id}-${clause.id}`]
                    return (
                      <div
                        key={clause.id}
                        className={`p-3.5 rounded-2xl transition-all duration-300 border ${
                          clause.fixable && !isFixed
                            ? "bg-amber-500/12 border-amber-300/45 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25)] hover:border-amber-300/75"
                            : "glass-subtle border-white/20 hover:border-white/35"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {clause.fixable && !isFixed ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                            )}
                            {clause.title}
                          </span>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            clause.fixable && !isFixed
                              ? "bg-amber-400/20 text-amber-200 border border-amber-300/40"
                              : "bg-emerald-400/20 text-emerald-200 border border-emerald-300/40"
                          }`}>
                            {isFixed ? "Neutralized" : clause.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-200/85 leading-relaxed mb-2">
                          {isFixed ? clause.fixText : clause.desc}
                        </p>

                        {/* Interactive AI Fix Action Button */}
                        {clause.fixable && (
                          <div className="pt-1 flex justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant={isFixed ? "emerald" : "default"}
                              onClick={() => toggleFixClause(activeContract.id, clause.id)}
                              className="h-7 px-3.5 text-[11px]"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{isFixed ? "Undo AI Redraft" : "AI Auto-Redraft Clause"}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Bottom Interactive Toolbar */}
                <div className="relative z-10 pt-4 mt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={activeTool === "scanner" ? "default" : "glass"}
                      onClick={() => setActiveTool("scanner")}
                      className="h-8 px-3 text-xs"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Scanner</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant={activeTool === "audit" ? "secondary" : "glass"}
                      onClick={() => setActiveTool("audit")}
                      className="h-8 px-3 text-xs"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Audit Trail</span>
                    </Button>
                  </div>

                  {/* Stamp Digital Signature Preview */}
                  <Button
                    type="button"
                    size="sm"
                    variant={isStamped ? "emerald" : "glass"}
                    onClick={() => setIsStamped(!isStamped)}
                    className="h-8 px-3.5 text-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isStamped ? "✓ E-Sign Attached" : "Test E-Signature"}</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= INTERACTIVE DEMO VIEWER ================= */}
        <section className="relative py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="glass-panel glass-reactive p-7 sm:p-10 rounded-[2.5rem] border border-white/25 shadow-fluffy">

            {/* Segmented Pill Tabs */}
            <div className="relative z-10 flex justify-center mb-8">
              <div className="inline-flex p-1.5 rounded-full bg-white/[0.08] border border-white/25 backdrop-blur-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]">
                <button
                  type="button"
                  onClick={() => setActiveDemo("analyzer")}
                  className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ease-fluffy ${
                    activeDemo === "analyzer"
                      ? "bg-gradient-to-b from-white/30 to-cyan-400/20 text-white border border-white/45 shadow-[inset_0_2px_2px_rgba(255,255,255,0.85),0_6px_18px_rgba(0,212,255,0.28)] scale-[1.03]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  AI Document Analysis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemo("creator")}
                  className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ease-fluffy ${
                    activeDemo === "creator"
                      ? "bg-gradient-to-b from-white/30 to-cyan-400/20 text-white border border-white/45 shadow-[inset_0_2px_2px_rgba(255,255,255,0.85),0_6px_18px_rgba(0,212,255,0.28)] scale-[1.03]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Smart Generator
                </button>
              </div>
            </div>

            {/* Demo Content Cards */}
            {activeDemo === "analyzer" ? (
              <div className="relative z-10 space-y-4 animate-fade-in">
                <div className="flex items-center gap-4 pb-4 border-b border-white/15">
                  <div className="glass-circle w-12 h-12 shadow-glass-glow">
                    <FileText className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">Non-Disclosure Agreement (NDA)</h3>
                    <p className="text-xs text-slate-300/80">Clause Breakdown & Real-Time Risk Profiler</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-3xl border border-white/20">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-cyan-300">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Clause Decoded</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Section 4.1 Indemnity</p>
                      <p className="text-xs text-slate-300/85 leading-relaxed">
                        Instant translation: Mutual protection applies only up to total fees paid, capping liability.
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-3xl border border-white/20">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-amber-300">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Risk Flagged</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Non-Compete Scope</p>
                      <p className="text-xs text-slate-300/85 leading-relaxed">
                        High risk: 36-month clause exceeds typical jurisdiction limits. AI recommends 12 months.
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-3xl border border-white/20">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-emerald-300">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Smart Action</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-1">Governing Law</p>
                      <p className="text-xs text-slate-300/85 leading-relaxed">
                        Arbitration clause aligns with standard ICC regulations. Safe to execute.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-4 animate-fade-in">
                <div className="flex items-center gap-4 pb-4 border-b border-white/15">
                  <div className="glass-circle w-12 h-12 shadow-[inset_0_2px_3px_rgba(255,255,255,0.85),0_6px_20px_rgba(245,158,11,0.35)]">
                    <PenTool className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">Conversational Legal Composer</h3>
                    <p className="text-xs text-slate-300/80">Draft, refine, and enforce agreements in real time</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-end">
                    <div className="glass-pill px-5 py-3 max-w-md text-xs sm:text-sm text-white border-white/35">
                      "Draft a master consulting agreement with IP assignment and net 30 invoices."
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="glass-panel p-5 max-w-lg rounded-3xl border border-cyan-300/35 text-xs sm:text-sm text-slate-100">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AdvocAI Generated in 1.4s</span>
                        </div>
                        <p className="leading-relaxed text-slate-200/90">
                          Drafted standard 9-clause agreement including explicit Work-for-Hire transfers, indemnity mutualization, and statutory net 30 payment terms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= CORE CAPABILITIES ================= */}
        <section id="features-detailed" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-200">
                End-To-End Architecture
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              Comprehensive Legal Automation Suite
            </h2>
            <p className="text-slate-300/80 text-base max-w-xl mx-auto">
              Every workflow engineered with liquid transparency, cushion responsiveness, and legal precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              onClick={() => setSelectedFeature("analyzer")}
              className="glass-panel glass-reactive glass-panel-interactive p-8 rounded-[2.25rem] border border-white/25 cursor-pointer space-y-5 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="glass-circle w-14 h-14 mb-6 shadow-[inset_0_2px_3px_rgba(255,255,255,0.92),0_10px_24px_rgba(0,212,255,0.35)]">
                  <FileText className="w-7 h-7 text-cyan-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-display">Instant Analyzer</h3>
                <p className="text-slate-300/85 text-sm leading-relaxed">
                  Deep NLP reads through dense contracts, decrypts convoluted legalese, flags one-sided liabilities, and generates instant summaries.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">Explore Capabilities</span>
                <span className="glass-circle w-8 h-8 text-cyan-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => setSelectedFeature("creator")}
              className="glass-panel glass-reactive glass-panel-interactive p-8 rounded-[2.25rem] border border-white/25 cursor-pointer space-y-5 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="glass-circle w-14 h-14 mb-6 shadow-[inset_0_2px_3px_rgba(255,255,255,0.92),0_10px_24px_rgba(245,158,11,0.35)]">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-display">Smart Generator</h3>
                <p className="text-slate-300/85 text-sm leading-relaxed">
                  Compose robust contracts from conversational briefs. Prompt edits, refine tone, add multi-party riders, and finalize with precision.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Explore Capabilities</span>
                <span className="glass-circle w-8 h-8 text-amber-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => setSelectedFeature("signature")}
              className="glass-panel glass-reactive glass-panel-interactive p-8 rounded-[2.25rem] border border-white/25 cursor-pointer space-y-5 flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="glass-circle w-14 h-14 mb-6 shadow-[inset_0_2px_3px_rgba(255,255,255,0.92),0_10px_24px_rgba(0,245,180,0.35)]">
                  <Shield className="w-7 h-7 text-emerald-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-display">Sign & Verify</h3>
                <p className="text-slate-300/85 text-sm leading-relaxed">
                  Legally enforceable e-signatures compliant with global eIDAS frameworks. Maintain tamper-evident audit trails with cryptographic version hashing.
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Explore Capabilities</span>
                <span className="glass-circle w-8 h-8 text-emerald-300">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (3 STEPS) ================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              Three Steps to Legal Clarity
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base">
              From raw intake to legally enforceable completion in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Upload or Describe",
                description:
                  "Drag and drop any PDF/DOCX contract for instant risk analysis, or instruct the AI assistant to draft a new customized legal agreement.",
              },
              {
                number: "02",
                title: "Inspect & Version",
                description:
                  "Review clause recommendations, adjust terms in the rich visual editor, and track version differentials with chronological rollback.",
              },
              {
                number: "03",
                title: "Sign & Secure",
                description:
                  "Dispatch signature invitations, capture certified signatures, and download verified high-resolution PDF documents.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="glass-panel glass-reactive glass-panel-interactive p-8 rounded-[2.25rem] border border-white/20 relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center glass-pill px-4 py-1 text-sm font-black text-cyan-300 mb-5 font-mono">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-display">{step.title}</h3>
                  <p className="text-slate-300/85 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CTA BANNER ================= */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="glass-panel glass-reactive p-8 sm:p-12 rounded-[2.75rem] border border-white/30 text-center space-y-5 shadow-fluffy">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Ready in Seconds
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
                Experience Frictionless Legal Workflows
              </h2>
              <p className="text-sm text-slate-300/85 max-w-lg mx-auto">
                Draft, review, collaborate, and cryptographically sign legal contracts in one cohesive glass workspace.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Button asChild size="lg" variant="aurora" className="h-12 px-8 text-sm">
                  <Link to={isAuthenticated ? "/document-creation" : "/signup"}>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>{isAuthenticated ? "Launch Studio" : "Start Free Workspace"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass" className="h-12 px-7 text-sm">
                  <Link to="/document-analyser">Try Contract Analyzer</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-12 border-t border-white/15 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="glass-circle w-9 h-9">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-lg font-extrabold text-white font-display">AdvocAI</span>
              <span className="text-xs text-slate-400">© 2026 AdvocAI Platform. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300/85 font-semibold">
              <span className="glass-pill px-3.5 py-1.5 cursor-pointer hover:text-white">Privacy Policy</span>
              <span className="glass-pill px-3.5 py-1.5 cursor-pointer hover:text-white">Terms of Service</span>
              <span className="glass-pill px-3.5 py-1.5 cursor-pointer hover:text-white">Security Whitepaper</span>
            </div>
          </div>
        </footer>

        {/* Feature Detail Modal */}
        {selectedFeature && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedFeature(null)}
          >
            <div
              className="glass-panel glass-reactive p-8 rounded-[2.25rem] max-w-xl w-full border border-white/35 space-y-6 shadow-fluffy relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="glass-circle"
                size="icon-sm"
                onClick={() => setSelectedFeature(null)}
                className="w-8 h-8 absolute top-5 right-5 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-white mb-2 font-display">
                  {featureDetails[selectedFeature]?.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {featureDetails[selectedFeature]?.description}
                </p>

                <div className="space-y-3">
                  {featureDetails[selectedFeature]?.features.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-100 glass-subtle p-3 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-cyan-400/25 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                        ✓
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/15 flex justify-end">
                <Button
                  onClick={() => setSelectedFeature(null)}
                  variant="aurora"
                  className="px-6 h-10 text-xs"
                >
                  Got It
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
