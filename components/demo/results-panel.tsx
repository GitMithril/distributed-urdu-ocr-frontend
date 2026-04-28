import { Copy, Download, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DemoPhase, JobResult } from "@/lib/demo-simulator"

interface ResultsPanelProps {
  phase: DemoPhase
  result: JobResult | null
  selectedOutput: string | null
  onSelectOutput: (fileName: string) => void
  onCopy: () => void
  onDownload: () => void
  errorMessage: string | null
}

export function ResultsPanel({
  phase,
  result,
  selectedOutput,
  onSelectOutput,
  onCopy,
  onDownload,
  errorMessage,
}: ResultsPanelProps) {
  const selectedFile = result?.outputs.find((output) => output.outputFile === selectedOutput) ?? result?.outputs[0] ?? null

  return (
    <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-wide text-foreground/70">Results panel</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">Output mapping and Urdu text viewer</h3>
      </div>

      {phase === "failed" && errorMessage && (
        <div className="rounded-lg border border-destructive/45 bg-destructive/10 p-3 text-sm text-foreground">
          {errorMessage}
        </div>
      )}

      {!result && phase !== "failed" && (
        <div className="rounded-xl border border-foreground/10 bg-background/35 p-4 text-sm text-foreground/75">
          Run a job to view 1:1 output mapping (<span className="font-mono">A.pdf → A.txt</span>), then inspect
          line-level OCR text.
        </div>
      )}

      {result && (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-2">
            {result.outputs.map((output) => (
              <button
                key={output.outputFile}
                onClick={() => onSelectOutput(output.outputFile)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedFile?.outputFile === output.outputFile
                    ? "border-primary/55 bg-primary/12 text-foreground"
                    : "border-foreground/10 bg-background/35 text-foreground/85 hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{output.inputFile}</span>
                  <Badge variant="outline" className="border-foreground/20 text-foreground/80">
                    {output.outputFile}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-foreground/10 bg-background/35 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-foreground/85">
                <FileText className="size-4" />
                <span>{selectedFile?.outputFile ?? "No file selected"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={onCopy} disabled={!selectedFile}>
                  <Copy className="mr-1 size-3.5" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={onDownload} disabled={!selectedFile}>
                  <Download className="mr-1 size-3.5" />
                  Download
                </Button>
              </div>
            </div>

            <div
              className="max-h-64 space-y-4 overflow-y-auto rounded-lg border border-foreground/10 bg-black/10 p-3 text-right"
              dir="rtl"
            >
              {selectedFile?.pages.map((page) => (
                <div key={`${selectedFile.outputFile}-${page.pageNumber}`}>
                  <p className="mb-2 text-xs text-foreground/65">صفحہ {page.pageNumber}</p>
                  <div className="space-y-1">
                    {page.lines.map((line) => (
                      <p key={`${page.pageNumber}-${line.lineNumber}`} className="text-sm leading-7 text-foreground/90">
                        {line.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
