'use client'

import { useEffect, useRef } from 'react'

export function MoodBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Dot grid settings
    const dotSpacing = 18 // px (was 36)
    const baseRadius = 1.25 // px (was 2.5)
    const maxRadius = baseRadius * 2
    const color = 'rgba(255,255,255,0.13)'
    const highlightColor = 'rgba(255,255,255,0.22)'

    // Mouse state
    let mouseX = -1000
    let mouseY = -1000
    let isMobile = false
    let mobileAnimSeed = Math.random() * 1000

    // Mobile detection
    if (typeof window !== 'undefined') {
      isMobile = /Mobi|Android/i.test(navigator.userAgent)
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    // Animation loop
    let frameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cols = Math.ceil(canvas.width / dotSpacing)
      const rows = Math.ceil(canvas.height / dotSpacing)
      const t = Date.now() * 0.001
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = x * dotSpacing + dotSpacing / 2
          const cy = y * dotSpacing + dotSpacing / 2
          let r = baseRadius
          // Meandering wave for all devices, no user input
          const wave = Math.sin(t * 0.5 + x * 0.7 + y * 0.9 + mobileAnimSeed) * 0.5 + 0.5
          r = baseRadius + (maxRadius - baseRadius) * wave * 0.15 // subtle
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fillStyle = r > baseRadius * 1.5 ? highlightColor : color
          ctx.fill()
        }
      }
      frameId = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (!isMobile) window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
} 