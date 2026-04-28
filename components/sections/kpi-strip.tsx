import { projectKpis } from "@/lib/ocr-metrics"

export function KpiStrip() {
  return (
    <section className="px-6 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectKpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md"
          >
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/70">{kpi.label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{kpi.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
