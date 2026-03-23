'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Venue } from '@/lib/supabase'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface VenueWithCoords extends Venue {
  lng?: number
  lat?: number
}

interface VenueMapProps {
  venues: Venue[]
}

async function geocodeVenue(venue: Venue): Promise<{ lat: number; lng: number } | null> {
  // Use address+postcode if available, fall back to name+area
  const query = venue.address
    ? [venue.address, venue.postcode, 'London', 'UK'].filter(Boolean).join(', ')
    : [venue.name, venue.area, 'London', 'UK'].filter(Boolean).join(', ')
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=GB&limit=1&proximity=-0.1276,51.5074`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) {
      console.warn(`[VenueMap] No result for: ${venue.name}`)
      return null
    }
    const [lng, lat] = feature.center
    console.log(`[VenueMap] ✓ ${venue.name} → ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    return { lat, lng }
  } catch {
    return null
  }
}

export default function VenueMap({ venues }: VenueMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const router = useRouter()
  const [activeVenue, setActiveVenue] = useState<VenueWithCoords | null>(null)
  const [geocoded, setGeocoded] = useState<VenueWithCoords[]>([])
  const [loading, setLoading] = useState(true)

  // Geocode all venues on mount
  useEffect(() => {
    async function geocodeAll() {
      console.log('[VenueMap] Token present:', !!MAPBOX_TOKEN)
      console.log('[VenueMap] Geocoding', venues.length, 'venues')
      const results = await Promise.all(
        venues.map(async (v) => {
          const coords = await geocodeVenue(v)
          return { ...v, ...(coords || {}) }
        })
      )
      setGeocoded(results.filter(v => v.lat && v.lng))
      setLoading(false)
    }
    geocodeAll()
  }, [venues])

  // Init map once geocoding done
  useEffect(() => {
    if (loading || !mapContainer.current || geocoded.length === 0) return
    if (mapRef.current) return

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-0.1276, 51.5074],
        zoom: 11.5,
      })

      mapRef.current = map

      map.on('load', () => {
        geocoded.forEach((venue) => {
          if (!venue.lng || !venue.lat) return

          // Outer wrapper
          const wrapper = document.createElement('div')
          wrapper.style.cssText = `
            cursor: pointer;
            transition: transform 0.15s ease;
          `

          const el = document.createElement('div')
          el.style.cssText = `
            background: #E87C2E;
            color: white;
            font-size: 12px;
            font-weight: 500;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 5px 10px;
            border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            transition: box-shadow 0.15s ease, background 0.15s ease;
            letter-spacing: 0.01em;
          `
          el.textContent = venue.name

          wrapper.appendChild(el)

          wrapper.addEventListener('mouseenter', () => {
            wrapper.style.transform = 'scale(1.06)'
            el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)'
            el.style.background = '#CF6A1E'
          })
          wrapper.addEventListener('mouseleave', () => {
            wrapper.style.transform = 'scale(1)'
            el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)'
            el.style.background = '#E87C2E'
          })
          wrapper.addEventListener('click', (e) => {
            e.stopPropagation()
            setActiveVenue(venue)
          })

          new mapboxgl.default.Marker({ element: wrapper, anchor: 'center' })
            .setLngLat([venue.lng!, venue.lat!])
            .addTo(map)
        })

        // Fit bounds to all markers
        if (geocoded.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds()
          geocoded.forEach(v => { if (v.lng && v.lat) bounds.extend([v.lng, v.lat]) })
          map.fitBounds(bounds, { padding: 80, maxZoom: 13 })
        }
      })

      // Close card on map click
      map.on('click', () => setActiveVenue(null))
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [loading, geocoded])

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 130px)', minHeight: '520px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10 rounded-xl">
          <p className="text-sm font-light text-zinc-400">Locating venues…</p>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Venue card */}
      {activeVenue && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-72 bg-white overflow-hidden cursor-pointer"
          style={{ borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.13)', border: '1px solid #F0EDE9' }}
          onClick={() => router.push(`/venues/${activeVenue.id}`)}
        >
          {activeVenue.image_hero && (
            <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
              <img
                src={activeVenue.image_hero}
                alt={activeVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>
          )}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-light text-zinc-900 truncate">{activeVenue.name}</p>
              <p className="text-xs font-light text-zinc-400 mt-0.5">{activeVenue.area}</p>
            </div>
            <svg className="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      )}

      <style>{`
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
    </div>
  )
}
