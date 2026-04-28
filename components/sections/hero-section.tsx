"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps {
  onRunDemo: () => void
  onViewArchitecture: () => void
}

export function HeroSection({ onRunDemo, onViewArchitecture }: HeroSectionProps) {
  return (
    <section className="relative px-6 pb-14 pt-32 md:px-12 md:pb-20 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <Badge variant="outline" className="mb-6 border-foreground/20 bg-foreground/10 text-foreground/90">
          Distributed Urdu OCR
        </Badge>
        <h1 className="max-w-4xl text-balance font-sans text-5xl font-light leading-[1.08] tracking-tight text-foreground md:text-7xl">
          Restore and digitize degraded Urdu records at national scale.
        </h1>
        <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-foreground/85 md:text-xl">
          A deep-learning pipeline combines SMP U-Net restoration with Conv-Transformer OCR, then executes inference
          over distributed Hadoop workers to process large document batches in parallel.
        </p>
        <p className="mt-5 max-w-2xl text-right font-mono text-sm text-foreground/80 md:text-base" dir="rtl">
          تاریخی اور سرکاری اردو دستاویزات کی خودکار بحالی اور ڈیجیٹل تبدیلی
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <MagneticButton size="lg" variant="primary" onClick={onRunDemo}>
            Run Demo
          </MagneticButton>
          <MagneticButton size="lg" variant="secondary" onClick={onViewArchitecture}>
            View Architecture
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
