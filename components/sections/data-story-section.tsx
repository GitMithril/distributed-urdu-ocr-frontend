"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

import { ImageLightbox } from "@/components/image-lightbox"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  datasetComposition,
  preprocessingSteps,
  splitComposition,
  syntheticDegradationChips,
  syntheticDegradationSample,
} from "@/lib/ocr-metrics"

const GRAPH_COLORS = {
  purple: "#A78BFA",
  softPurple: "#C4B5FD",
  white: "#F8FAFC",
}

const chartConfig = {
  mmu: { label: "MMU-OCR-21", color: GRAPH_COLORS.purple },
  uhwr: { label: "NUST-UHWR", color: GRAPH_COLORS.white },
  train: { label: "Train", color: GRAPH_COLORS.purple },
  validation: { label: "Validation", color: GRAPH_COLORS.softPurple },
  test: { label: "Test", color: GRAPH_COLORS.white },
}

export function DataStorySection() {
  const [isSampleOpen, setIsSampleOpen] = useState(false)

  const splitChartData = useMemo(
    () =>
      splitComposition.map((entry) => ({
        name: entry.split,
        count: entry.count,
      })),
    [],
  )

  return (
    <section className="px-6 pb-8 pt-32 md:px-12 md:pb-10 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 2</p>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-foreground md:text-4xl">Data + Preprocessing</h2>
          <p className="mt-3 max-w-3xl text-sm text-foreground/80 md:text-base">
            111,143 records combine printed Nastaleeq and handwritten Urdu. Inputs are standardized to{" "}
            <span className="font-mono">1 x 128 x 2048</span> grayscale tensors before restoration and OCR.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-12">
          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-3.5 backdrop-blur-md xl:col-span-4">
            <h3 className="text-base font-semibold text-foreground">Dataset composition</h3>
            <ChartContainer config={chartConfig} className="mt-2 h-44 justify-center [&_.recharts-pie-label-text]:fill-white">
              <PieChart>
                <Pie data={datasetComposition} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>
                  <Cell fill="var(--color-mmu)" />
                  <Cell fill="var(--color-uhwr)" />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 space-y-1.5">
              {datasetComposition.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs text-foreground/80 md:text-sm">
                  <span>{item.name}</span>
                  <span style={{ color: index === 0 ? GRAPH_COLORS.softPurple : GRAPH_COLORS.white }}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-3.5 backdrop-blur-md xl:col-span-4">
            <h3 className="text-base font-semibold text-foreground">Train / Val / Test split</h3>
            <ChartContainer
              config={chartConfig}
              className="mt-2 h-44 [&_.recharts-cartesian-axis-tick_text]:fill-white"
            >
              <BarChart data={splitChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: GRAPH_COLORS.white }} />
                <YAxis tickLine={false} axisLine={false} width={55} tick={{ fill: GRAPH_COLORS.white }} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => Number(value).toLocaleString()} hideIndicator />}
                />
                <Bar dataKey="count" radius={6}>
                  <Cell fill="var(--color-train)" />
                  <Cell fill="var(--color-validation)" />
                  <Cell fill="var(--color-test)" />
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              {splitComposition.map((entry) => (
                <div key={entry.split} className="rounded-xl border border-foreground/10 bg-background/45 p-2.5">
                  <p className="text-xs text-foreground/70">{entry.split}</p>
                  <p className="text-sm font-semibold text-foreground">{entry.count.toLocaleString()}</p>
                  <p className="font-mono text-xs text-foreground/70">{entry.ratio}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-3.5 backdrop-blur-md xl:col-span-4">
            <h3 className="text-base font-semibold text-foreground">Standardization pipeline</h3>
            <ol className="mt-2 space-y-1.5">
              {preprocessingSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-[10px]">
                    {index + 1}
                  </span>
                  <span className="text-xs text-foreground/85 md:text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-12">
          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-3.5 backdrop-blur-md xl:col-span-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Synthetic degradations used</h3>
                <p className="mt-1 text-xs text-foreground/70">
                  Applied transformations used to stress-test restoration robustness
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-foreground/10 bg-background/35 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {syntheticDegradationChips.map((degradation) => (
                  <span
                    key={degradation}
                    className="rounded-full border border-foreground/20 bg-background/45 px-3 py-1 text-xs text-foreground/85"
                  >
                    {degradation}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setIsSampleOpen(true)}
                className="rounded-full border border-foreground/25 bg-background/45 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-background/75"
              >
                View Sample
              </button>
            </div>
          </article>
        </div>

        <ImageLightbox
          open={isSampleOpen}
          title={syntheticDegradationSample.title}
          imageSrc={syntheticDegradationSample.imageSrc}
          onClose={() => setIsSampleOpen(false)}
        />
      </div>
    </section>
  )
}
