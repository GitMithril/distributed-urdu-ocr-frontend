"use client"

import { useMemo } from "react"
import {
  Background,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react"

import { distributedTechStack } from "@/lib/ocr-metrics"

export function DistributedArchitectureSection() {
  const nodeStyle = {
    background: "rgba(10, 10, 12, 0.9)",
    color: "#F8FAFC",
    border: "1px solid rgba(248,250,252,0.2)",
    borderRadius: "9px",
    padding: "7px 9px",
    fontSize: 10.5,
    whiteSpace: "pre-line" as const,
    textAlign: "center" as const,
    width: 125,
  }

  const accentNodeStyle = {
    ...nodeStyle,
    border: "1px solid rgba(167,139,250,0.75)",
    boxShadow: "0 0 0 1px rgba(167,139,250,0.2)",
  }

  const nodes = useMemo<Node[]>(
    () => [
      { id: "hdfs", position: { x: 18, y: 25 }, data: { label: "HDFS\nStorage" }, type: "input", style: accentNodeStyle },
      {
        id: "orchestrator",
        position: { x: 175, y: 25 },
        data: { label: "MapReduce\nOrchestrator" },
        style: accentNodeStyle,
      },
      { id: "pre1", position: { x: 78, y: 105 }, data: { label: "Worker 1\nPreprocess" }, style: nodeStyle },
      { id: "rest1", position: { x: 78, y: 170 }, data: { label: "U-Net\nRestore" }, style: nodeStyle },
      { id: "ocr1", position: { x: 78, y: 235 }, data: { label: "Conv-Trans\nOCR" }, style: nodeStyle },
      { id: "out1", position: { x: 78, y: 300 }, data: { label: "Text Out 1" }, style: nodeStyle },
      { id: "preN", position: { x: 270, y: 105 }, data: { label: "Worker N\nPreprocess" }, style: nodeStyle },
      { id: "restN", position: { x: 270, y: 170 }, data: { label: "U-Net\nRestore" }, style: nodeStyle },
      { id: "ocrN", position: { x: 270, y: 235 }, data: { label: "Conv-Trans\nOCR" }, style: nodeStyle },
      { id: "outN", position: { x: 270, y: 300 }, data: { label: "Text Out N" }, style: nodeStyle },
      { id: "reducer", position: { x: 470, y: 170 }, data: { label: "Reducer\nMerge + order" }, style: accentNodeStyle },
      {
        id: "final",
        position: { x: 630, y: 170 },
        data: { label: "Final Urdu\nText File" },
        type: "output",
        style: accentNodeStyle,
      },
    ],
    [],
  )

  const edges = useMemo<Edge[]>(
    () => [
      edge("hdfs", "orchestrator"),
      edge("orchestrator", "pre1"),
      edge("orchestrator", "preN"),
      edge("pre1", "rest1"),
      edge("rest1", "ocr1"),
      edge("ocr1", "out1"),
      edge("preN", "restN"),
      edge("restN", "ocrN"),
      edge("ocrN", "outN"),
      edge("out1", "reducer"),
      edge("outN", "reducer"),
      edge("reducer", "final"),
    ],
    [],
  )

  return (
    <section className="px-6 pb-6 pt-32 md:px-12 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Section 5</p>
          <h2 className="mt-2 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Distributed Inference Architecture
          </h2>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-4 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground">Execution flow</h3>
            <p className="mt-2 text-sm text-foreground/80">
              Uploaded batches enter HDFS, MapReduce shards page groups across workers, each worker runs the same
              preprocessing → restoration → OCR block, and reducer stages merge outputs into ordered Urdu text files.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <StagePill label="Input batch" />
              <StageArrow />
              <StagePill label="Mapper nodes" />
              <StageArrow />
              <StagePill label="Parallel inference" />
              <StageArrow />
              <StagePill label="Reducer" />
              <StageArrow />
              <StagePill label="Output bundle" />
            </div>
          </article>

          <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-4 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground">Tech stack</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {distributedTechStack.map((tech) => (
                <div
                  key={tech}
                  className="rounded-xl border border-foreground/20 bg-background/40 px-2.5 py-2 text-center text-xs text-foreground/90"
                >
                  {tech}
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-3 rounded-2xl border border-foreground/15 bg-foreground/10 p-2.5 backdrop-blur-md">
          <p className="mb-2 px-1 text-xs uppercase tracking-[0.15em] text-foreground/65">
            Graph composition from distributed architecture
          </p>
          <div className="h-[235px] w-full overflow-hidden rounded-xl border border-foreground/15 bg-background/40">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 0.18 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                style={{ background: "transparent" }}
              >
                <Background color="#F8FAFC1F" gap={16} />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </article>
      </div>
    </section>
  )
}

function edge(source: string, target: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#F8FAFC99" },
    style: { stroke: "#F8FAFC99", strokeWidth: 1.1 },
  }
}

function StagePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-foreground/25 bg-background/40 px-2.5 py-1 text-foreground/90">
      {label}
    </span>
  )
}

function StageArrow() {
  return <span className="text-foreground/55">→</span>
}
