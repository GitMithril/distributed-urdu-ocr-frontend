import { distributedTechStack } from "@/lib/ocr-metrics"

export function DistributedArchitectureSection() {
  return (
    <section className="px-6 pb-12 pt-28 md:px-12 md:pb-14 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 5</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Distributed Inference Architecture
          </h2>
        </div>

        <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-6 backdrop-blur-md">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1.2fr_auto_1fr_auto_1fr] md:items-center">
            <Node title="Input batch" subtitle="Uploaded documents in .zip" />
            <Connector />
            <Node title="Mapper nodes" subtitle="MapReduce shards pages/files" />
            <Connector />
            <Node title="Inference block per node" subtitle="Restoration + OCR in parallel" />
            <Connector />
            <Node title="Reducer + output bundle" subtitle="Ordered text artifacts (.txt)" />
          </div>
          <p className="mt-5 text-sm text-foreground/80">
            HDFS stores batch uploads, mappers distribute pages across worker nodes, each worker runs the identical
            inference block, and reducers merge page-level outputs into document-ordered text files.
          </p>
        </article>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {distributedTechStack.map((tech) => (
            <div
              key={tech}
              className="rounded-xl border border-foreground/15 bg-foreground/10 px-4 py-3 text-center text-sm text-foreground/90 backdrop-blur-md"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Node({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-foreground/15 bg-background/45 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-foreground/70">{subtitle}</p>
    </div>
  )
}

function Connector() {
  return <div className="mx-auto h-px w-8 bg-foreground/30 md:w-10" />
}
