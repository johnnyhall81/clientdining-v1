'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { VenueImage } from '@/lib/supabase'

interface VenueGalleryProps {
  heroImage?: string
  galleryImages: VenueImage[]
  venueName: string
  logoUrl?: string
}

export default function VenueGallery({ heroImage, galleryImages, venueName, logoUrl }: VenueGalleryProps) {
  // Build the full ordered list: gallery images first, hero last
  const allImages: string[] = [
    ...galleryImages.map((img) => img.url),
    ...(heroImage ? [heroImage] : []),
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  if (allImages.length === 0) {
    return (
      <div className="relative bg-zinc-100 aspect-square flex items-center justify-center text-zinc-300">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </div>
    )
  }

  const goTo = (index: number) => {
    setActiveIndex((index + allImages.length) % allImages.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current

    // Only treat as horizontal swipe if more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(activeIndex + 1)
      else goTo(activeIndex - 1)
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div className="relative bg-zinc-100 aspect-square overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
          {/* Images */}
      {allImages.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: i === activeIndex ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={`${venueName}${i === 0 ? '' : ` — image ${i + 1}`}`}
            fill
            priority={i === 0}
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover"
          />
        </div>
      ))}

      {/* Prev / Next arrows — only shown if multiple images */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-zinc-700 hover:bg-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-zinc-700 hover:bg-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className="transition-all duration-300 rounded-full bg-white"
                style={{
                  width: i === activeIndex ? '20px' : '6px',
                  height: '6px',
                  opacity: i === activeIndex ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
