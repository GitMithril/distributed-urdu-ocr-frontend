"use client"

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { AlertTriangle, FileArchive, FileImage, FileText, FolderOpen, UploadCloud, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DemoPhase, ExtractedInputFile } from "@/lib/demo-simulator"
import { zipFilesToFile } from "@/lib/demo-simulator"

interface UploadPanelProps {
  phase: DemoPhase
  selectedZipName: string | null
  extractedFiles: ExtractedInputFile[]
  validationMessage: string | null
  multiline: boolean
  onMultilineChange: (value: boolean) => void
  onZipSelected: (file: File) => void
  onClear: () => void
  onStart: () => void
}

/** Recursively collect all File objects from a DataTransferItem directory entry. */
async function collectFilesFromEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      ;(entry as FileSystemFileEntry).file((f) => resolve([f]), () => resolve([]))
    })
  }

  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    const allEntries: FileSystemEntry[] = []

    await new Promise<void>((resolve) => {
      const readBatch = () => {
        reader.readEntries((batch) => {
          if (batch.length === 0) {
            resolve()
          } else {
            allEntries.push(...batch)
            readBatch()
          }
        }, () => resolve())
      }
      readBatch()
    })

    const nested = await Promise.all(allEntries.map(collectFilesFromEntry))
    return nested.flat()
  }

  return []
}

export function UploadPanel({
  phase,
  selectedZipName,
  extractedFiles,
  validationMessage,
  multiline,
  onMultilineChange,
  onZipSelected,
  onClear,
  onStart,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isZipping, setIsZipping] = useState(false)
  const zipInputId = useId()
  const folderInputRef = useRef<HTMLInputElement>(null)

  const validFiles = extractedFiles.filter((file) => file.supported)
  const invalidFiles = extractedFiles.filter((file) => !file.supported)
  const busy = phase === "uploading" || phase === "processing" || isZipping

  const handleZipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onZipSelected(file)
    event.target.value = ""
  }

  const handleFolderChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    event.target.value = ""

    setIsZipping(true)
    try {
      const fileList = Array.from(files)
      const folderName = fileList[0].webkitRelativePath.split("/")[0] || "folder"
      const zip = await zipFilesToFile(fileList, `${folderName}.zip`)
      onZipSelected(zip)
    } finally {
      setIsZipping(false)
    }
  }

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const items = Array.from(event.dataTransfer.items ?? [])

    // Check if the drop contains a directory
    const dirEntry = items
      .map((item) => item.webkitGetAsEntry?.())
      .find((entry): entry is FileSystemDirectoryEntry => !!entry?.isDirectory)

    if (dirEntry) {
      setIsZipping(true)
      try {
        const files = await collectFilesFromEntry(dirEntry)
        if (files.length > 0) {
          const zip = await zipFilesToFile(files, `${dirEntry.name}.zip`)
          onZipSelected(zip)
        }
      } finally {
        setIsZipping(false)
      }
      return
    }

    // Fall back to plain file (zip)
    const file = event.dataTransfer.files?.[0]
    if (file) onZipSelected(file)
  }

  return (
    <article className="rounded-2xl border border-foreground/15 bg-foreground/10 p-5 backdrop-blur-md">
      <div className="mb-4">
        <p className="font-mono text-xs uppercase tracking-wide text-foreground/70">Input panel</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">Upload images</h3>
      </div>

      <label
        htmlFor={zipInputId}
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
        {isZipping ? (
          <p className="mt-3 text-sm text-foreground/85">Zipping folder…</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-foreground/85">Drag and drop a .zip file or folder, or click to browse</p>
            <p className="mt-1 text-xs text-foreground/65">Supports .jpg, .png, and .pdf files</p>
          </>
        )}
      </label>

      {/* Hidden inputs */}
      <input id={zipInputId} type="file" accept=".zip,application/zip" className="hidden" onChange={handleZipChange} />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error — webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleFolderChange}
      />

      {/* Folder browse shortcut */}
      <button
        type="button"
        onClick={() => folderInputRef.current?.click()}
        disabled={busy}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-foreground/15 bg-background/30 py-2 text-xs text-foreground/70 transition hover:border-foreground/30 hover:text-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FolderOpen className="size-3.5" />
        Browse folder instead
      </button>

      {selectedZipName && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-foreground/10 bg-background/45 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-sm text-foreground/85">
            <FileArchive className="size-4 shrink-0" />
            <span className="truncate">{selectedZipName}</span>
          </div>
          <Badge variant="outline" className="ml-2 shrink-0 border-foreground/20 text-foreground/80">
            {validFiles.length} extracted
          </Badge>
        </div>
      )}

      {validationMessage && (
        <div className="mt-4 rounded-lg border border-destructive/45 bg-destructive/10 p-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
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
                  {file.extension === ".pdf" ? <FileText className="size-4 shrink-0" /> : <FileImage className="size-4 shrink-0" />}
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

      {/* Single-line / Multi-line toggle */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-foreground/10 bg-background/30 px-3 py-2.5">
        <span className="flex-1 text-sm text-foreground/80">Line segmentation</span>
        <button
          type="button"
          onClick={() => onMultilineChange(false)}
          disabled={busy}
          className={`rounded px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            !multiline
              ? "bg-primary text-primary-foreground"
              : "border border-foreground/20 text-foreground/60 hover:text-foreground/90"
          }`}
        >
          Single line
        </button>
        <button
          type="button"
          onClick={() => onMultilineChange(true)}
          disabled={busy}
          className={`rounded px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            multiline
              ? "bg-primary text-primary-foreground"
              : "border border-foreground/20 text-foreground/60 hover:text-foreground/90"
          }`}
        >
          Multi-line
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button
          className="flex-1"
          onClick={onStart}
          disabled={
            busy ||
            !selectedZipName ||
            validFiles.length === 0 ||
            Boolean(validationMessage)
          }
        >
          {phase === "uploading" ? "Uploading…" : isZipping ? "Preparing…" : "Start Distributed Job"}
        </Button>
        <button
          type="button"
          onClick={onClear}
          disabled={busy && !isZipping || (!selectedZipName && extractedFiles.length === 0 && !validationMessage)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Clear selected files"
        >
          <X className="size-4" />
        </button>
      </div>
    </article>
  )
}
