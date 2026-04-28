"use client"

import { ArrowRight, Layers3, Network, Sparkles } from "lucide-react"
import { useState, type ReactNode } from "react"

import { ImageLightbox } from "@/components/image-lightbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ocrMetrics, restorationMetrics } from "@/lib/ocr-metrics"

export function PipelineSection() {
  const [lightbox, setLightbox] = useState<{ title: string; src: string } | null>(null)

  return (
    <>
      <section className="px-6 pb-8 pt-32 md:px-12 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 3</p>
            <h2 className="mt-2 text-4xl font-light tracking-tight text-foreground md:text-5xl">Deep Learning Pipeline</h2>
          </div>

          <div className="rounded-2xl border border-foreground/15 bg-foreground/10 p-4 backdrop-blur-md md:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              <FlowBlock title="Noisy Input" subtitle="Degraded scanned page" />
              <FlowArrow />
              <FlowBlock title="SMP U-Net Restoration" subtitle="ResNet34 encoder" />
              <FlowArrow />
              <FlowBlock title="Restored Image" subtitle="PSNR 34.52 / SSIM 0.9932" />
              <FlowArrow />
              <FlowBlock title="Conv-Transformer OCR" subtitle="Urdu sequence decoding" />
            </div>
          </div>

          <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
            <ArchitectureCard
              icon={<Sparkles className="size-4 text-chart-2" />}
              title="Restoration block"
              subtitle="SMP U-Net + ResNet34 encoder"
              badges={[
                `Params ${restorationMetrics.trainableParams}`,
                `MSE ${restorationMetrics.mse}`,
                `PSNR ${restorationMetrics.psnr} dB`,
                `SSIM ${restorationMetrics.ssim}`,
              ]}
              points={[
                "ImageNet-pretrained encoder for stable low-level feature extraction.",
                "Restores contrast and edge fidelity before OCR decoding.",
                "Optimized for degraded archive and government document scans.",
              ]}
              onViewArchitecture={() =>
                setLightbox({
                  title: "Restoration Architecture",
                  src: "/Resto_Arch.png",
                })
              }
            />

            <ArchitectureCard
              icon={<Network className="size-4 text-chart-1" />}
              title="OCR block"
              subtitle="Conv-Transformer sequence recognition"
              badges={[
                `Params ${ocrMetrics.trainableParams}`,
                `Vocab ${ocrMetrics.vocabSize}`,
                "7 CNN blocks",
                "3 Encoder / 3 Decoder",
                "Cross-Entropy objective",
              ]}
              points={[
                "CNN backbone encodes visual tokens from restored Urdu text lines.",
                ocrMetrics.transformer,
                "Transformer decoder outputs character sequence without CTC.",
              ]}
              onViewArchitecture={() =>
                setLightbox({
                  title: "OCR Architecture",
                  src: "/OCR_Arch.png",
                })
              }
            />
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              className="border-foreground/30 bg-foreground/5 text-foreground hover:bg-foreground/15"
              onClick={() =>
                setLightbox({
                  title: "Sample Pipeline",
                  src: "/sample_pipeline.png",
                })
              }
            >
              <Layers3 className="mr-2 size-4" />
              View sample pipeline
            </Button>
          </div>
        </div>
      </section>

      <ImageLightbox
        open={Boolean(lightbox)}
        title={lightbox?.title ?? ""}
        imageSrc={lightbox?.src ?? ""}
        onClose={() => setLightbox(null)}
      />
    </>
  )
}

function FlowBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-foreground/15 bg-background/45 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground/70">{subtitle}</p>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-1">
      <ArrowRight className="size-4 text-foreground/60" />
    </div>
  )
}

interface ArchitectureCardProps {
  icon: ReactNode
  title: string
  subtitle: string
  badges: string[]
  points: string[]
  onViewArchitecture: () => void
}

function ArchitectureCard({ icon, title, subtitle, badges, points, onViewArchitecture }: ArchitectureCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-foreground/15 bg-foreground/10 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background/45 px-2.5 py-1">
            {icon}
            <span className="text-xs font-medium text-foreground/85">Model block</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-foreground/70">{subtitle}</p>
        </div>
      </div>

      <div className="mb-3 flex min-h-[72px] flex-wrap content-start gap-2">
        {badges.map((badge) => (
          <Badge key={badge} variant="outline" className="border-foreground/25 bg-background/35 text-foreground/90">
            {badge}
          </Badge>
        ))}
      </div>

      <ul className="mb-4 space-y-2 text-sm text-foreground/85">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="mt-auto w-full border-foreground/30 bg-foreground/5 text-foreground hover:bg-foreground/15"
        onClick={onViewArchitecture}
      >
        View Architecture
      </Button>
    </article>
  )
}
