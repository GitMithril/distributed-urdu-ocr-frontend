import { ArrowRight } from "lucide-react"

import { ocrMetrics, restorationMetrics } from "@/lib/ocr-metrics"

export function PipelineSection() {
  return (
    <section className="px-6 pb-12 pt-28 md:px-12 md:pb-14 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 3</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight text-foreground md:text-5xl">Deep Learning Pipeline</h2>
        </div>

        <div className="rounded-2xl border border-foreground/15 bg-foreground/10 p-6 backdrop-blur-md">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground">Restoration block</h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/85">
              <li>U-Net with ResNet34 encoder (ImageNet pretrained)</li>
              <li>Trainable parameters: {restorationMetrics.trainableParams}</li>
              <li>Test MSE: {restorationMetrics.mse}</li>
              <li>Test PSNR: {restorationMetrics.psnr} dB</li>
              <li>Test SSIM: {restorationMetrics.ssim}</li>
              <li className="text-foreground/70">{restorationMetrics.architecture}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground">OCR block</h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/85">
              <li>CNN backbone (7 blocks) + positional encoding</li>
              <li>Transformer layers: 3 encoder / 3 decoder</li>
              <li>{ocrMetrics.transformer}</li>
              <li>Trainable parameters: {ocrMetrics.trainableParams}</li>
              <li>Vocabulary size: {ocrMetrics.vocabSize} characters</li>
              <li>Training objective: {ocrMetrics.objective}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
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
