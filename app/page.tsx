"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { useEffect, useRef, useState } from "react"

import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { BenchmarkSection } from "@/components/sections/benchmark-section"
import { DataStorySection } from "@/components/sections/data-story-section"
import { DemoSimulator } from "@/components/sections/demo-simulator"
import { DistributedArchitectureSection } from "@/components/sections/distributed-architecture-section"
import { HeroSection } from "@/components/sections/hero-section"
import { KpiStrip } from "@/components/sections/kpi-strip"
import { PipelineSection } from "@/components/sections/pipeline-section"

export default function Home() {
  const horizontalSectionsRef = useRef<HTMLDivElement>(null)
  const demoSectionRef = useRef<HTMLElement>(null)
  const [activePanel, setActivePanel] = useState(0)

  const scrollToSection = (element: HTMLElement | null) => {
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollToPanel = (index: number) => {
    if (!horizontalSectionsRef.current) return
    const width = horizontalSectionsRef.current.clientWidth
    horizontalSectionsRef.current.scrollTo({
      left: width * index,
      behavior: "smooth",
    })
    setActivePanel(index)
  }

  useEffect(() => {
    const container = horizontalSectionsRef.current
    if (!container) return

    const handleScroll = () => {
      const width = container.clientWidth
      if (!width) return
      setActivePanel(Math.round(container.scrollLeft / width))
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="relative min-h-screen w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div className="fixed inset-0 z-0" style={{ contain: "strict" }}>
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-40 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-foreground/15 bg-background/35 px-4 py-3 backdrop-blur-xl">
          <button
            className="flex items-center gap-2 text-left transition-transform hover:scale-[1.02]"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" })
              scrollToPanel(0)
            }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/15">
              <span className="text-sm font-semibold text-foreground">NR</span>
            </div>
            <span className="font-sans text-sm font-semibold text-foreground md:text-base">NastaRead</span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <MagneticButton variant="secondary" onClick={() => scrollToPanel(4)}>
              View Architecture
            </MagneticButton>
            <MagneticButton variant="primary" onClick={() => scrollToSection(demoSectionRef.current)}>
              Run Demo
            </MagneticButton>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <section className="relative">
          <div
            ref={horizontalSectionsRef}
            data-scroll-container
            className="flex min-h-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="min-w-full shrink-0 snap-start">
              <HeroSection onRunDemo={() => scrollToSection(demoSectionRef.current)} onViewArchitecture={() => scrollToPanel(4)} />
              <KpiStrip />
            </div>
            <div className="min-w-full shrink-0 snap-start">
              <DataStorySection />
            </div>
            <div className="min-w-full shrink-0 snap-start">
              <PipelineSection />
            </div>
            <div className="min-w-full shrink-0 snap-start">
              <BenchmarkSection />
            </div>
            <div id="architecture" className="min-w-full shrink-0 snap-start">
              <DistributedArchitectureSection />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-foreground/20 bg-background/40 px-3 py-2 backdrop-blur-xl">
              <span className="hidden px-1 text-[10px] uppercase tracking-[0.14em] text-foreground/70 md:inline">
                Scroll to explore
              </span>
              {[0, 1, 2, 3, 4].map((panel) => (
                <button
                  key={panel}
                  onClick={() => scrollToPanel(panel)}
                  className={`h-2.5 w-2.5 rounded-full transition ${activePanel === panel ? "bg-foreground" : "bg-foreground/35 hover:bg-foreground/60"}`}
                  aria-label={`Go to section ${panel + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section ref={demoSectionRef} id="demo" className="min-h-screen px-6 py-24 md:px-12">
          <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[1320px] items-center">
            <DemoSimulator />
          </div>
        </section>
      </div>
    </main>
  )
}
