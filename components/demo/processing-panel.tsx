import { Clock3, Cpu, Server } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DemoPhase, ProcessingStatus, ServiceMode } from "@/lib/demo-simulator"

interface ProcessingPanelProps {
  phase: DemoPhase
  mode: ServiceMode
  status: ProcessingStatus | null
}

export function ProcessingPanel({ phase, mode, status }: ProcessingPanelProps) {
  return (
    <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-foreground/70">Processing panel</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Distributed scheduler (2 Hadoop data nodes)</h3>
        </div>
        <Badge variant="outline" className="border-foreground/20 text-foreground/80">
          {mode === "mock" ? "Mock mode" : "Backend mode"}
        </Badge>
      </div>

      {!status && phase === "idle" && (
        <div className="rounded-xl border border-foreground/10 bg-background/35 p-4 text-sm text-foreground/75">
          Upload a zip to start the lifecycle: idle → uploading → processing → completed | failed.
        </div>
      )}

      {status && (
        <div className="space-y-4">
          <div className="rounded-xl border border-foreground/10 bg-background/35 p-4">
            <div className="flex items-center justify-between text-sm text-foreground/85">
              <span className="font-medium capitalize">Stage: {status.stage}</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="mt-2" />
            <div className="mt-3 flex items-center gap-2 text-xs text-foreground/70">
              <Clock3 className="size-3.5" />
              <span>Elapsed {status.elapsedSeconds}s</span>
            </div>
          </div>

          <div className="grid gap-3">
            {status.nodes.map((node) => (
              <div key={node.id} className="rounded-xl border border-foreground/10 bg-background/35 p-3">
                <div className="flex items-center justify-between text-sm text-foreground/85">
                  <div className="flex items-center gap-2">
                    <Server className="size-4" />
                    <span>{node.id}</span>
                  </div>
                  <span>{node.progress}%</span>
                </div>
                <Progress value={node.progress} className="mt-2" />
                <p className="mt-2 text-xs text-foreground/70">
                  {node.stage} • {node.currentFile}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-foreground/10 bg-background/35 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/65">
              <Cpu className="size-3.5" />
              Live logs
            </div>
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {status.logs.length === 0 && <p className="text-xs text-foreground/60">Waiting for log stream...</p>}
              {status.logs.map((log) => (
                <div key={log.id} className="rounded-md border border-foreground/10 bg-background/45 px-2 py-1.5 text-xs">
                  <span className="text-foreground/60">{log.timestamp}</span>
                  <span className="ml-2 text-foreground/85">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
