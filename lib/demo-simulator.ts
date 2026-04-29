import JSZip from "jszip"

export const MAX_ZIP_SIZE_BYTES = 75 * 1024 * 1024

export type DemoPhase = "idle" | "uploading" | "processing" | "completed" | "failed"
export type ServiceMode = "backend" | "mock"
export type ProcessingStage = "queued" | "mapping" | "inferencing" | "reducing" | "completed" | "failed"

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"] as const

export interface ExtractedInputFile {
  name: string
  extension: string
  supported: boolean
}

export interface ProcessingNodeStatus {
  id: string
  progress: number
  currentFile: string
  stage: string
}

export interface ProcessingLogEntry {
  id: string
  timestamp: string
  message: string
  level: "info" | "success" | "error"
}

export interface ProcessingStatus {
  jobId: string
  stage: ProcessingStage
  progress: number
  elapsedSeconds: number
  nodes: ProcessingNodeStatus[]
  logs: ProcessingLogEntry[]
}

export interface OcrLine {
  lineNumber: number
  text: string
}

export interface OcrPage {
  pageNumber: number
  lines: OcrLine[]
}

export interface OcrOutputFile {
  inputFile: string
  outputFile: string
  pages: OcrPage[]
}

export interface JobResult {
  jobId: string
  outputs: OcrOutputFile[]
}

export interface UploadJobResult {
  mode: ServiceMode
  jobId: string
  inputFiles: string[]
}

type ValidationCode = "wrong-file-type" | "oversize" | "empty-zip" | "unsupported-content"

export class ZipValidationError extends Error {
  readonly code: ValidationCode

  constructor(code: ValidationCode, message: string) {
    super(message)
    this.name = "ZipValidationError"
    this.code = code
  }
}

export class BackendUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BackendUnavailableError"
  }
}

interface MockJobState {
  jobId: string
  startedAt: number
  inputFiles: string[]
}

const mockJobs = new Map<string, MockJobState>()

const stageMilestones: Array<{ progress: number; stage: ProcessingStage; message: string; level: ProcessingLogEntry["level"] }> =
  [
    { progress: 0, stage: "queued", message: "Batch accepted and queued in scheduler.", level: "info" },
    { progress: 12, stage: "mapping", message: "Map phase started: pages sharded across 2 data nodes.", level: "info" },
    { progress: 38, stage: "mapping", message: "Map outputs persisted to HDFS intermediate partitions.", level: "info" },
    { progress: 58, stage: "inferencing", message: "Node workers running restoration + OCR inference.", level: "info" },
    { progress: 84, stage: "reducing", message: "Reduce phase merging page-level text in source order.", level: "info" },
    { progress: 100, stage: "completed", message: "Distributed OCR job completed successfully.", level: "success" },
  ]

const urduSampleLines = [
  "یہ نمونہ متن تقسیم شدہ اردو او سی آر کے ذریعے حاصل کیا گیا ہے۔",
  "تصویری شور کم کرنے کے بعد حروف کی شناخت نمایاں طور پر بہتر ہوئی۔",
  "حتمی متن کو صفحہ وار ترتیب دے کر فائل میں محفوظ کیا گیا۔",
] as const

/** Zip a flat list of File objects into a single File named `zipName`. */
export async function zipFilesToFile(files: File[], zipName: string): Promise<File> {
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.name, file)
  }
  const blob = await zip.generateAsync({ type: "blob" })
  return new File([blob], zipName, { type: "application/zip" })
}

export function validateZipSelection(file: File) {
  if (!file.name.toLowerCase().endsWith(".zip")) {
    throw new ZipValidationError("wrong-file-type", "Only .zip archives are accepted.")
  }

  if (file.size > MAX_ZIP_SIZE_BYTES) {
    throw new ZipValidationError("oversize", "Zip file is too large. Maximum supported size is 75 MB.")
  }
}

export async function extractInputFilesFromZip(file: File) {
  const archive = await JSZip.loadAsync(file)
  const entries = Object.values(archive.files).filter((entry) => !entry.dir)

  if (entries.length === 0) {
    throw new ZipValidationError("empty-zip", "Zip archive is empty.")
  }

  const extractedFiles: ExtractedInputFile[] = entries.map((entry) => {
    const extension = `.${entry.name.split(".").pop()?.toLowerCase() ?? ""}`
    return {
      name: entry.name,
      extension,
      supported: allowedExtensions.includes(extension as (typeof allowedExtensions)[number]),
    }
  })

  if (!extractedFiles.some((entry) => entry.supported)) {
    throw new ZipValidationError(
      "unsupported-content",
      "Zip archive must contain at least one .jpg, .png, or .pdf file.",
    )
  }

  return extractedFiles
}

export function startMockJob(inputFiles: string[]) {
  const jobId = `mock-job-${Date.now()}`
  mockJobs.set(jobId, {
    jobId,
    startedAt: Date.now(),
    inputFiles,
  })

  return jobId
}

export async function uploadDocumentBatch(file: File, inputFiles: string[], multiline: boolean): Promise<UploadJobResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("multiline", multiline ? "true" : "false")

  try {
    const response = await fetch("/api/DL/process-batch", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      if (isUnavailableStatus(response.status)) {
        throw new BackendUnavailableError("Upload endpoint is unavailable.")
      }
      throw new Error(`Upload failed (${response.status}).`)
    }

    const parsed = await parseJson(response)
    const payload = asRecord(parsed)
    const backendJobId = readString(payload, ["jobId", "job_id", "id"]) ?? "active-distributed-job"

    return {
      mode: "backend",
      jobId: backendJobId,
      inputFiles,
    }
  } catch (error) {
    if (error instanceof BackendUnavailableError || isNetworkError(error)) {
      const jobId = startMockJob(inputFiles)
      return {
        mode: "mock",
        jobId,
        inputFiles,
      }
    }
    throw error
  }
}

export async function getJobStatus(mode: ServiceMode, jobId: string, inputFiles: string[]) {
  if (mode === "mock") {
    return readMockStatus(jobId)
  }

  const response = await fetch(`/api/DL/jobs/${jobId}/status`, { cache: "no-store" })

  if (!response.ok) {
    if (isUnavailableStatus(response.status)) {
      throw new BackendUnavailableError("Status endpoint is unavailable.")
    }
    throw new Error(`Status request failed (${response.status}).`)
  }

  const parsed = await parseJson(response)
  return normalizeBackendStatus(parsed, jobId, inputFiles)
}

export async function getJobResult(mode: ServiceMode, jobId: string, inputFiles: string[]) {
  if (mode === "mock") {
    return readMockResult(jobId)
  }

  const response = await fetch(`/api/DL/jobs/${jobId}/results`, { cache: "no-store" })

  if (!response.ok) {
    if (isUnavailableStatus(response.status)) {
      throw new BackendUnavailableError("Result endpoint is unavailable.")
    }
    throw new Error(`Result request failed (${response.status}).`)
  }

  const parsed = await parseJson(response)
  return normalizeBackendResult(parsed, jobId, inputFiles)
}

function readMockStatus(jobId: string): ProcessingStatus {
  const job = mockJobs.get(jobId)
  if (!job) {
    throw new Error("Mock job not found.")
  }

  const elapsedSeconds = Math.floor((Date.now() - job.startedAt) / 1000)
  const progress = clamp(Math.min(100, elapsedSeconds * 10))
  const stage = deriveStage(progress)

  const nodeAssignments = buildNodeAssignments(job.inputFiles, progress, stage)
  const logs = stageMilestones
    .filter((entry) => progress >= entry.progress)
    .map((entry) => ({
      id: `${jobId}-${entry.progress}`,
      timestamp: new Date(job.startedAt + entry.progress * 140).toLocaleTimeString(),
      message: entry.message,
      level: entry.level,
    }))

  return {
    jobId,
    stage,
    progress,
    elapsedSeconds,
    nodes: nodeAssignments,
    logs,
  }
}

function readMockResult(jobId: string): JobResult {
  const job = mockJobs.get(jobId)
  if (!job) {
    throw new Error("Mock result not found.")
  }

  const progress = clamp(Math.min(100, Math.floor(((Date.now() - job.startedAt) / 1000) * 10)))
  if (progress < 100) {
    throw new Error("Mock job is not completed yet.")
  }

  return {
    jobId,
    outputs: job.inputFiles.map((fileName, index) => ({
      inputFile: fileName,
      outputFile: mapOutputName(fileName),
      pages: [
        {
          pageNumber: 1,
          lines: urduSampleLines.map((text, lineIndex) => ({
            lineNumber: lineIndex + 1,
            text,
          })),
        },
        {
          pageNumber: 2,
          lines: [
            {
              lineNumber: 1,
              text: `فائل ${index + 1}: تقسیم شدہ نوڈز سے حاصل شدہ متن کامیابی سے ضم کر دیا گیا۔`,
            },
            {
              lineNumber: 2,
              text: "یہ ڈیمو موڈ ہے، مگر مکمل اپ لوڈ → پراسیسنگ → رزلٹ فلو فعال ہے۔",
            },
          ],
        },
      ],
    })),
  }
}

function normalizeBackendStatus(data: unknown, jobId: string, inputFiles: string[]): ProcessingStatus {
  const payload = asRecord(data)
  const rawState = readString(payload, ["stage", "state", "status"]) ?? "queued"
  const stage = normalizeStage(rawState)
  const progress = clamp(readNumber(payload, ["progress", "percent", "percentage"]) ?? 0)

  // Derive elapsed from start_time if the backend doesn't send it directly
  const startTime = readNumber(payload, ["start_time", "startTime"])
  const elapsedSeconds = Math.max(
    0,
    Math.floor(
      readNumber(payload, ["elapsedSeconds", "elapsed", "duration"]) ??
        (startTime ? (Date.now() / 1000 - startTime) : 0),
    ),
  )

  const nodes = readNodes(payload, inputFiles, progress, stage)
  const logs = readLogs(payload)

  return {
    jobId,
    stage,
    progress,
    elapsedSeconds,
    nodes,
    logs,
  }
}

function normalizeBackendResult(data: unknown, jobId: string, inputFiles: string[]): JobResult {
  const payload = asRecord(data)

  // DL backend returns { results: [{ filename, lines: string[], ... }] }
  const resultsValue = payload?.results
  if (Array.isArray(resultsValue)) {
    const outputs: OcrOutputFile[] = resultsValue.map((item, index) => {
      const r = asRecord(item)
      const inputFile = readString(r, ["filename", "inputFile", "input"]) ?? inputFiles[index] ?? `file-${index + 1}`
      const outputFile = mapOutputName(inputFile)
      const rawLines = r?.lines
      const lines: OcrLine[] = Array.isArray(rawLines)
        ? rawLines.map((lineItem, lineIndex) => ({
            lineNumber: lineIndex + 1,
            text: typeof lineItem === "string" ? lineItem : String(lineItem),
          }))
        : []
      return {
        inputFile,
        outputFile,
        pages: [{ pageNumber: 1, lines }],
      }
    })
    return { jobId, outputs }
  }

  // Fallback: legacy shape with top-level "outputs" array
  const outputsValue = payload?.outputs
  if (!Array.isArray(outputsValue)) {
    throw new Error("Result response missing 'results' or 'outputs' array.")
  }

  const outputs: OcrOutputFile[] = outputsValue.map((item, index) => {
    const outputPayload = asRecord(item)
    const inputFile = readString(outputPayload, ["inputFile", "input", "source"]) ?? inputFiles[index] ?? `file-${index + 1}`
    const outputFile = readString(outputPayload, ["outputFile", "output", "target"]) ?? mapOutputName(inputFile)

    const pagesPayload = outputPayload?.pages
    const pages: OcrPage[] = Array.isArray(pagesPayload)
      ? pagesPayload.map((pageItem, pageIndex) => {
          const pagePayload = asRecord(pageItem)
          const linesPayload = pagePayload?.lines
          const lines: OcrLine[] = Array.isArray(linesPayload)
            ? linesPayload.map((lineItem, lineIndex) => {
                if (typeof lineItem === "string") {
                  return { lineNumber: lineIndex + 1, text: lineItem }
                }
                const linePayload = asRecord(lineItem)
                const text = readString(linePayload, ["text", "line", "content"])
                if (!text) throw new Error("Result line missing text content.")
                return {
                  lineNumber: Math.max(1, Math.floor(readNumber(linePayload, ["lineNumber", "line_no"]) ?? lineIndex + 1)),
                  text,
                }
              })
            : []
          return {
            pageNumber: Math.max(1, Math.floor(readNumber(pagePayload, ["pageNumber", "page"]) ?? pageIndex + 1)),
            lines,
          }
        })
      : []

    return { inputFile, outputFile, pages }
  })

  return { jobId, outputs }
}

function readNodes(payload: Record<string, unknown> | null, inputFiles: string[], progress: number, stage: ProcessingStage) {
  const nodesPayload = payload?.nodes
  if (Array.isArray(nodesPayload) && nodesPayload.length > 0) {
    return nodesPayload.map((nodeItem, index) => {
      const node = asRecord(nodeItem)
      return {
        id: readString(node, ["id", "name"]) ?? `Data Node ${index + 1}`,
        progress: clamp(readNumber(node, ["progress", "percent"]) ?? progress),
        currentFile: readString(node, ["currentFile", "file", "assignment"]) ?? inputFiles[index % Math.max(inputFiles.length, 1)] ?? "Idle",
        stage: readString(node, ["stage", "status"]) ?? stage,
      }
    })
  }

  return buildNodeAssignments(inputFiles, progress, stage)
}

function readLogs(payload: Record<string, unknown> | null): ProcessingLogEntry[] {
  const logsPayload = payload?.logs
  if (!Array.isArray(logsPayload)) {
    return []
  }

  return logsPayload.map((entry, index) => {
    if (typeof entry === "string") {
      return {
        id: `log-${index}`,
        timestamp: new Date().toLocaleTimeString(),
        message: entry,
        level: "info" as const,
      }
    }

    const logPayload = asRecord(entry)
    return {
      id: readString(logPayload, ["id"]) ?? `log-${index}`,
      timestamp: readString(logPayload, ["timestamp", "time"]) ?? new Date().toLocaleTimeString(),
      message: readString(logPayload, ["message", "msg"]) ?? "Job update received.",
      level: normalizeLevel(readString(logPayload, ["level", "severity"])),
    }
  })
}

function buildNodeAssignments(inputFiles: string[], progress: number, stage: ProcessingStage): ProcessingNodeStatus[] {
  const firstFile = inputFiles[0] ?? "batch-001.pdf"
  const secondFile = inputFiles[1] ?? inputFiles[0] ?? "batch-002.pdf"
  const nodeOneProgress = clamp(progress + 4)
  // Cap the lag at 94 so node 2 always reaches 100 when the job completes.
  const nodeTwoProgress = progress >= 100 ? 100 : clamp(Math.max(0, progress - 6))

  return [
    {
      id: "Data Node 1",
      progress: nodeOneProgress,
      currentFile: firstFile,
      stage,
    },
    {
      id: "Data Node 2",
      progress: nodeTwoProgress,
      currentFile: secondFile,
      stage,
    },
  ]
}

function deriveStage(progress: number): ProcessingStage {
  if (progress >= 100) return "completed"
  if (progress >= 80) return "reducing"
  if (progress >= 45) return "inferencing"
  if (progress >= 10) return "mapping"
  return "queued"
}

function normalizeStage(raw: string): ProcessingStage {
  const value = raw.toLowerCase()
  if (value.includes("fail")) return "failed"
  if (value === "succeeded" || value.includes("complete") || value.includes("done")) return "completed"
  if (value === "processing" || value.includes("infer")) return "inferencing"
  if (value.includes("reduc") || value.includes("shuffl")) return "reducing"
  if (value.includes("map")) return "mapping"
  // UPLOADING → queued
  return "queued"
}

function normalizeLevel(raw: string | undefined): ProcessingLogEntry["level"] {
  if (!raw) return "info"
  const value = raw.toLowerCase()
  if (value.includes("err")) return "error"
  if (value.includes("success")) return "success"
  return "info"
}

function mapOutputName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, ".txt")
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>
  }
  return null
}

function readString(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

function readNumber(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text.trim()) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Server returned invalid JSON.")
  }
}

function isUnavailableStatus(status: number) {
  return status === 404 || status === 502 || status === 503 || status === 504
}

function isNetworkError(error: unknown) {
  if (!(error instanceof Error)) return false
  return error.name === "TypeError" || error.message.toLowerCase().includes("network")
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}
