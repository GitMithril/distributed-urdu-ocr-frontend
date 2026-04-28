export const projectKpis = [
  { label: "Total records", value: "111,143" },
  { label: "Final CER", value: "8.14%" },
  { label: "Final WER", value: "18.33%" },
  { label: "Restoration quality", value: "PSNR 34.52 dB / SSIM 0.9932" },
] as const

export const datasetComposition = [
  { name: "MMU-OCR-21 (Printed Nastaleeq)", value: 100_541 },
  { name: "NUST-UHWR (Handwritten Urdu)", value: 10_602 },
] as const

export const splitComposition = [
  { split: "Train", count: 77_800, ratio: "70%" },
  { split: "Validation", count: 16_671, ratio: "15%" },
  { split: "Test", count: 16_672, ratio: "15%" },
] as const

export const preprocessingSteps = [
  "Grayscale conversion",
  "Resize to fixed height: 128",
  "Aspect-ratio-preserving right padding to width: 2048",
] as const

export const syntheticDegradationScenarios = [
  {
    id: "noise",
    title: "Additive Noise",
    before: "Salt-and-pepper artifacts + scanner grain",
    after: "Denoised texture while preserving Urdu glyph edges",
  },
  {
    id: "blur",
    title: "Motion + Defocus Blur",
    before: "Stroked Nastaleeq characters become smeared",
    after: "Edge restoration stabilizes disconnected ligatures",
  },
  {
    id: "contrast",
    title: "Low Contrast Fading",
    before: "Foreground text blends into background paper",
    after: "Contrast recovery improves OCR token visibility",
  },
] as const

export const benchmarkPairs = [
  { metric: "CER", tesseract: 62.04, deepLearning: 3.75 },
  { metric: "WER", tesseract: 93.15, deepLearning: 10.32 },
] as const

export const finalTestMetrics = {
  loss: 0.2075,
  cer: 8.14,
  wer: 18.33,
} as const

export const restorationMetrics = {
  architecture: "SMP U-Net + ResNet34 encoder",
  trainableParams: "24,430,097",
  mse: 0.000574,
  psnr: 34.52,
  ssim: 0.9932,
} as const

export const ocrMetrics = {
  architecture: "Conv-Transformer (7 CNN blocks, 3 encoder + 3 decoder layers)",
  transformer: "d_model=256, nhead=8, feedforward=1024",
  trainableParams: "7,337,197",
  vocabSize: 173,
  objective: "Cross-Entropy (not CTC)",
} as const

export const distributedTechStack = [
  "React/Next.js",
  "FastAPI",
  "PyTorch",
  "Hadoop/HDFS/MapReduce",
  "Docker",
] as const
