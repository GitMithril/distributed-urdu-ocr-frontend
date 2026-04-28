import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { benchmarkPairs, finalTestMetrics } from "@/lib/ocr-metrics"

const GRAPH_COLORS = {
  purple: "#A78BFA",
  white: "#F8FAFC",
}

const chartConfig = {
  tesseract: { label: "Tesseract", color: GRAPH_COLORS.white },
  deepLearning: { label: "DL model", color: GRAPH_COLORS.purple },
}

const cerDelta = benchmarkPairs[0].tesseract - benchmarkPairs[0].deepLearning
const werDelta = benchmarkPairs[1].tesseract - benchmarkPairs[1].deepLearning

export function BenchmarkSection() {
  return (
    <section className="px-6 pb-12 pt-28 md:px-12 md:pb-14 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 4</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight text-foreground md:text-5xl">Results + Benchmarking</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-foreground">Final OCR test metrics</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Loss" value={finalTestMetrics.loss.toString()} />
                <MetricCard label="CER" value={`${finalTestMetrics.cer}%`} />
                <MetricCard label="WER" value={`${finalTestMetrics.wer}%`} />
              </div>
            </article>

            <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-foreground">DL vs Tesseract benchmark</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge
                  variant="outline"
                  className="text-foreground"
                  style={{ borderColor: "#A78BFA80", backgroundColor: "#A78BFA1F" }}
                >
                  CER improvement: {cerDelta.toFixed(2)} pp
                </Badge>
                <Badge
                  variant="outline"
                  className="text-foreground"
                  style={{ borderColor: "#F8FAFC75", backgroundColor: "#F8FAFC14" }}
                >
                  WER improvement: {werDelta.toFixed(2)} pp
                </Badge>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/85">
                <li>Tesseract: CER 62.04%, WER 93.15%</li>
                <li>DL model: CER 3.75%, WER 10.32%</li>
              </ul>
            </article>
          </div>

          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground">Error-rate comparison</h3>
            <ChartContainer config={chartConfig} className="mt-4 h-72 [&_.recharts-cartesian-axis-tick_text]:fill-white">
              <BarChart data={benchmarkPairs}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: GRAPH_COLORS.white }} />
                <YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: GRAPH_COLORS.white }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tesseract" radius={6}>
                  <Cell fill="var(--color-tesseract)" />
                  <Cell fill="var(--color-tesseract)" />
                </Bar>
                <Bar dataKey="deepLearning" radius={6}>
                  <Cell fill="var(--color-deepLearning)" />
                  <Cell fill="var(--color-deepLearning)" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-foreground">Handwriting challenge note</h3>
          <p className="mt-2 text-sm text-foreground/85">
            UHWR handwritten mini-sample remains harder: CER 29.89% and WER 55.29%, reinforcing handwriting as the
            current difficult regime.
          </p>
        </article>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/45 p-3">
      <p className="text-xs text-foreground/70">{label}</p>
      <p className="mt-1 font-mono text-lg text-foreground">{value}</p>
    </div>
  )
}
