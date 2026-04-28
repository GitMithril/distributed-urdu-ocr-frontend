"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ProcessingPanel } from "@/components/demo/processing-panel"
import { ResultsPanel } from "@/components/demo/results-panel"
import { UploadPanel } from "@/components/demo/upload-panel"
import {
  type DemoPhase,
  type JobResult,
  type ProcessingStatus,
  type ServiceMode,
  type ZipValidationError,
  BackendUnavailableError,
  extractInputFilesFromZip,
  getJobResult,
  getJobStatus,
  startMockJob,
  uploadDocumentBatch,
  validateZipSelection,
} from "@/lib/demo-simulator"

export function DemoSimulator() {
  const [phase, setPhase] = useState<DemoPhase>("idle")
  const [mode, setMode] = useState<ServiceMode>("backend")
  const [selectedZip, setSelectedZip] = useState<File | null>(null)
  const [extractedFiles, setExtractedFiles] = useState<Awaited<ReturnType<typeof extractInputFilesFromZip>>>([])
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [result, setResult] = useState<JobResult | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null)

  const supportedInputFiles = useMemo(
    () => extractedFiles.filter((file) => file.supported).map((file) => file.name),
    [extractedFiles],
  )

  const selectedOutputData =
    result?.outputs.find((output) => output.outputFile === selectedOutput) ?? result?.outputs[0] ?? null

  const handleZipSelection = async (file: File) => {
    setResult(null)
    setSelectedOutput(null)
    setStatus(null)
    setJobId(null)
    setErrorMessage(null)
    setPhase("idle")

    try {
      validateZipSelection(file)
      const files = await extractInputFilesFromZip(file)
      setSelectedZip(file)
      setExtractedFiles(files)
      setValidationMessage(null)
    } catch (error) {
      const message = getErrorMessage(error)
      setSelectedZip(file)
      setExtractedFiles([])
      setValidationMessage(message)
      toast.error(message)
    }
  }

  const handleStart = async () => {
    if (!selectedZip) {
      const message = "Please select a zip archive before starting."
      setValidationMessage(message)
      toast.error(message)
      return
    }

    if (supportedInputFiles.length === 0) {
      const message = "No valid .jpg, .png, or .pdf files were found in the zip."
      setValidationMessage(message)
      toast.error(message)
      return
    }

    setErrorMessage(null)
    setValidationMessage(null)
    setPhase("uploading")

    try {
      const upload = await uploadDocumentBatch(selectedZip, supportedInputFiles)
      setMode(upload.mode)
      setJobId(upload.jobId)
      setPhase("processing")
      setStatus({
        jobId: upload.jobId,
        stage: "queued",
        progress: 0,
        elapsedSeconds: 0,
        nodes: [],
        logs: [],
      })
      if (upload.mode === "mock") {
        toast.message("Backend unavailable. Running full mock service flow.")
      }
    } catch (error) {
      const message = getErrorMessage(error)
      setPhase("failed")
      setErrorMessage(message)
      toast.error(message)
    }
  }

  useEffect(() => {
    if (phase !== "processing" || !jobId) return

    let isCancelled = false
    let intervalHandle: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      try {
        const latestStatus = await getJobStatus(mode, jobId, supportedInputFiles)
        if (isCancelled) return

        setStatus(latestStatus)

        if (latestStatus.stage === "failed") {
          const message = "Distributed OCR processing failed."
          setPhase("failed")
          setErrorMessage(message)
          toast.error(message)
          return
        }

        if (latestStatus.stage === "completed") {
          const latestResult = await getJobResult(mode, jobId, supportedInputFiles)
          if (isCancelled) return
          setResult(latestResult)
          setSelectedOutput(latestResult.outputs[0]?.outputFile ?? null)
          setPhase("completed")
          toast.success("OCR outputs are ready.")
        }
      } catch (error) {
        if (isCancelled) return

        if (mode === "backend" && error instanceof BackendUnavailableError) {
          const mockJobId = startMockJob(supportedInputFiles)
          setMode("mock")
          setJobId(mockJobId)
          setStatus({
            jobId: mockJobId,
            stage: "queued",
            progress: 0,
            elapsedSeconds: 0,
            nodes: [],
            logs: [],
          })
          toast.message("Status endpoint unavailable. Switching to mock processing.")
          return
        }

        const message = getErrorMessage(error)
        setPhase("failed")
        setErrorMessage(message)
        toast.error(message)
      }
    }

    void poll()
    intervalHandle = setInterval(() => {
      void poll()
    }, 1500)

    return () => {
      isCancelled = true
      if (intervalHandle) {
        clearInterval(intervalHandle)
      }
    }
  }, [jobId, mode, phase, supportedInputFiles])

  const handleCopy = async () => {
    if (!selectedOutputData) return

    const plainText = selectedOutputData.pages
      .flatMap((page) => page.lines.map((line) => line.text))
      .join("\n")
      .trim()

    if (!plainText) {
      toast.error("No OCR text available to copy.")
      return
    }

    try {
      await navigator.clipboard.writeText(plainText)
      toast.success("OCR text copied.")
    } catch {
      toast.error("Clipboard access failed.")
    }
  }

  const handleDownload = () => {
    if (!selectedOutputData) return

    const plainText = selectedOutputData.pages
      .flatMap((page) => page.lines.map((line) => line.text))
      .join("\n")
      .trim()

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = selectedOutputData.outputFile
    anchor.click()
    URL.revokeObjectURL(objectUrl)
    toast.success("Text file downloaded.")
  }

  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">Interactive demo simulator</p>
        <h2 className="mt-3 text-4xl font-light tracking-tight text-foreground md:text-5xl">
          Upload → Process → Review Urdu OCR Output
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-foreground/80">
          Backend contract: <span className="font-mono">POST /upload</span>,{" "}
          <span className="font-mono">GET /status</span>, <span className="font-mono">GET /result</span>
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <UploadPanel
          phase={phase}
          selectedZipName={selectedZip?.name ?? null}
          extractedFiles={extractedFiles}
          validationMessage={validationMessage}
          onZipSelected={handleZipSelection}
          onStart={handleStart}
        />
        <ProcessingPanel phase={phase} mode={mode} status={status} />
        <ResultsPanel
          phase={phase}
          result={result}
          selectedOutput={selectedOutput}
          onSelectOutput={setSelectedOutput}
          onCopy={handleCopy}
          onDownload={handleDownload}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (!error) return "Unexpected error occurred."
  if (error instanceof Error) {
    return error.message
  }
  const typedError = error as ZipValidationError
  if (typedError?.message) {
    return typedError.message
  }
  return "Unexpected error occurred."
}
