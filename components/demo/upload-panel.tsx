"use client"

import { useId, useState, type ChangeEvent, type DragEvent } from "react"
import { AlertTriangle, FileArchive, FileImage, FileText, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DemoPhase, ExtractedInputFile } from "@/lib/demo-simulator"

interface UploadPanelProps {
  phase: DemoPhase
  selectedZipName: string | null
  extractedFiles: ExtractedInputFile[]
  validationMessage: string | null
  onZipSelected: (file: File) => void
  onStart: () => void
}

export function UploadPanel({
  phase,
  selectedZipName,
  extractedFiles,
  validationMessage,
  onZipSelected,
  onStart,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputId = useId()

  const validFiles = extractedFiles.filter((file) => file.supported)
  const invalidFiles = extractedFiles.filter((file) => !file.supported)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onZipSelected(file)
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      onZipSelected(file)
    }
  }

  return (
    <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-wide text-foreground/70">Input panel</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">Zip uploader</h3>
      </div>

      <label
        htmlFor={inputId}
        className={`block cursor-pointer rounded-xl border border-dashed p-5 text-center transition ${
          isDragging
            ? "border-primary bg-primary/12"
            : "border-foreground/20 bg-background/40 hover:border-foreground/35 hover:bg-background/55"
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className="mx-auto size-8 text-foreground/80" />
        <p className="mt-3 text-sm text-foreground/85">Drag and drop a .zip file or click to browse</p>
        <p className="mt-1 text-xs text-foreground/65">Supports .jpg, .png, and .pdf files inside the archive</p>
      </label>
      <input id={inputId} type="file" accept=".zip,application/zip" className="hidden" onChange={handleFileChange} />

      {selectedZipName && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-foreground/10 bg-background/45 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-foreground/85">
            <FileArchive className="size-4" />
            <span>{selectedZipName}</span>
          </div>
          <Badge variant="outline" className="border-foreground/20 text-foreground/80">
            {validFiles.length} extracted
          </Badge>
        </div>
      )}

      {validationMessage && (
        <div className="mt-4 rounded-lg border border-destructive/45 bg-destructive/10 p-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 text-destructive" />
            <span>{validationMessage}</span>
          </div>
        </div>
      )}

      {extractedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-foreground/65">Extracted files</p>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {extractedFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-background/35 px-3 py-2.5 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 text-foreground/85">
                  {file.extension === ".pdf" ? <FileText className="size-4" /> : <FileImage className="size-4" />}
                  <span className="truncate">{file.name}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    file.supported
                      ? "ml-2 shrink-0 border-chart-1/45 bg-chart-1/10 px-2.5 py-0.5 text-foreground/90"
                      : "ml-2 shrink-0 border-destructive/45 bg-destructive/10 px-2.5 py-0.5 text-foreground/90"
                  }
                >
                  {file.supported ? "Valid" : "Unsupported"}
                </Badge>
              </div>
            ))}
          </div>
          {invalidFiles.length > 0 && (
            <p className="text-xs text-foreground/70">
              Unsupported files will be ignored. Only .jpg, .png, and .pdf are accepted.
            </p>
          )}
        </div>
      )}

      <Button
        className="mt-5 w-full"
        onClick={onStart}
        disabled={
          phase === "uploading" ||
          phase === "processing" ||
          !selectedZipName ||
          validFiles.length === 0 ||
          Boolean(validationMessage)
        }
      >
        {phase === "uploading" ? "Uploading..." : "Start Distributed Job"}
      </Button>
    </article>
  )
}
