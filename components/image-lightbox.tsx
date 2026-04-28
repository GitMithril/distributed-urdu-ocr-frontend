"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ImageLightboxProps {
  open: boolean
  title: string
  imageSrc: string
  onClose: () => void
}

export function ImageLightbox({ open, title, imageSrc, onClose }: ImageLightboxProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMissing, setIsMissing] = useState(false)
  const transitionDurationMs = 220

  useEffect(() => {
    if (open) {
      setIsMissing(false)
    }
  }, [imageSrc, open])

  useEffect(() => {
    if (open) {
      setIsMounted(true)
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timer = window.setTimeout(() => setIsMounted(false), transitionDurationMs)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!isMounted) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isMounted, onClose])

  if (!isMounted || typeof document === "undefined") {
    return null
  }

  const content = (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-5xl rounded-2xl border border-foreground/25 bg-background/90 p-4 shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-[0.985] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-3 text-sm font-medium text-foreground/85">{title}</p>
        {!isMissing && imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="max-h-[72vh] w-full rounded-xl object-contain"
            onError={() => setIsMissing(true)}
          />
        ) : (
          <div className="flex h-[60vh] w-full items-center justify-center rounded-xl border border-foreground/20 bg-background/50">
            <div className="h-40 w-56 rounded-lg border border-foreground/20 bg-black/10" />
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
