'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Venue } from '@/lib/supabase'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface VenueWithCoords extends Venue {
  lng: number
  lat: number
}

interface VenueMapProps {
  venues: Venue[]
}

async function geocodeVenue(venue: Venue): Promise<{ lat: number; lng: number } | null> {
  const query = venue.address
    ? [venue.address, venue.postcode, 'London', 'UK'].filter(Boolean).join(', ')
    : [venue.name, venue.area, 'London', 'UK'].filter(Boolean).join(', ')
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=GB&limit=1&proximity=-0.1276,51.5074`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

export default function VenueMap({ venues }: VenueMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const markerRefs = useRef<Map<string, any>>(new Map())
  const router = useRouter()

  const [geocoded, setGeocoded] = useState<VenueWithCoords[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleVenues, setVisibleVenues] = useState<VenueWithCoords[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Geocode on mount
  useEffect(() => {
    async function geocodeAll() {
      const results = await Promise.all(
        venues.map(async (v) => {
          const coords = await geocodeVenue(v)
          return coords ? { ...v, ...coords } : null
        })
      )
      const valid = results.filter(Boolean) as VenueWithCoords[]
      setGeocoded(valid)
      setLoading(false)
    }
    geocodeAll()
  }, [venues])

  // Update visible venues based on map bounds
  const updateVisible = useCallback((map: any, all: VenueWithCoords[]) => {
    const bounds = map.getBounds()
    const visible = all.filter(v =>
      v.lng >= bounds.getWest() &&
      v.lng <= bounds.getEast() &&
      v.lat >= bounds.getSouth() &&
      v.lat <= bounds.getNorth()
    )
    setVisibleVenues(visible)
  }, [])

  // Highlight a pin by toggling its SVG fill
  const highlightPin = useCallback((id: string | null) => {
    markerRefs.current.forEach(({ el }, venueId) => {
      const path = el.querySelector('path')
      const circle = el.querySelector('circle')
      if (!path || !circle) return
      if (venueId === id) {
        path.setAttribute('fill', '#18181B')
        circle.setAttribute('fill', '#ffffff')
        el.style.zIndex = '10'
      } else {
        path.setAttribute('fill', '#ffffff')
        circle.setAttribute('fill', '#18181B')
        el.style.zIndex = '1'
      }
    })
  }, [])

  // Scroll strip to card
  const scrollToCard = useCallback((id: string) => {
    const card = cardRefs.current.get(id)
    if (card && stripRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  // Init map
  useEffect(() => {
    if (loading || !mapContainer.current || geocoded.length === 0) return
    if (mapRef.current) return

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-0.1400, 51.5100],
        zoom: 12,
      })

      mapRef.current = map

      map.on('load', () => {
        // Subtle Thames blue
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#C8D8E8')
        }
        if (map.getLayer('water-shadow')) {
          map.setPaintProperty('water-shadow', 'fill-color', '#C8D8E8')
        }
        // GeoJSON source with clustering
        map.addSource('venues', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geocoded.map(v => ({
              type: 'Feature',
              properties: { id: v.id, name: v.name, area: v.area },
              geometry: { type: 'Point', coordinates: [v.lng, v.lat] }
            }))
          },
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 40,
        })

        // Cluster circles — zinc, subtle
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'venues',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#18181B',
            'circle-radius': ['step', ['get', 'point_count'], 18, 5, 22, 10, 26],
            'circle-opacity': 0.85,
          }
        })

        // Cluster count labels
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'venues',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 11,
          },
          paint: { 'text-color': '#ffffff' }
        })

        // Individual venue pins — SVG teardrop HTML markers
        geocoded.forEach(venue => {
          const el = document.createElement('div')
          el.innerHTML = `
            <svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.25));cursor:pointer">
              <path d="M11 0C4.925 0 0 4.925 0 11C0 19.25 11 30 11 30C11 30 22 19.25 22 11C22 4.925 17.075 0 11 0Z" fill="white" stroke="#18181B" stroke-width="1.5"/>
              <circle cx="11" cy="11" r="4" fill="#18181B"/>
            </svg>
          `
          el.style.width = '22px'
          el.style.height = '30px'
          el.dataset.venueId = venue.id

          el.addEventListener('click', () => {
            setActiveId(venue.id)
            highlightPin(venue.id)
            scrollToCard(venue.id)
          })

          const marker = new mapboxgl.default.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([venue.lng, venue.lat])
            .addTo(map)

          markerRefs.current.set(venue.id, { marker, el })
        })

        // Click empty map → clear active
        map.on('click', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
          if (!features.length) {
            setActiveId(null)
            highlightPin(null)
          }
        })

        // Click cluster → zoom in
        map.on('click', 'clusters', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
          const clusterId = features[0]?.properties?.cluster_id
          if (!clusterId) return
          ;(map.getSource('venues') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return
            map.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
          })
        })

        // Cursor for clusters
        map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })

        // Update strip on move
        map.on('moveend', () => updateVisible(map, geocoded))

        // Initial visible set
        updateVisible(map, geocoded)

        // Fit bounds
        if (geocoded.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds()
          geocoded.forEach(v => bounds.extend([v.lng, v.lat]))
          map.fitBounds(bounds, { padding: 80, maxZoom: 13 })
        }
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [loading, geocoded])

  // When activeId changes from card click, highlight dot
  const handleCardClick = (venue: VenueWithCoords) => {
    setActiveId(venue.id)
    if (mapRef.current) {
      mapRef.current.easeTo({ center: [venue.lng, venue.lat], zoom: Math.max(mapRef.current.getZoom(), 14) })
      highlightDot(mapRef.current, venue.id)
    }
  }

  return (
    <div className="relative w-full flex flex-col" style={{ height: 'calc(100vh - 130px)', minHeight: '520px' }}>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10 rounded-xl">
          <p className="text-sm font-light text-zinc-400">Locating venues…</p>
        </div>
      )}

      {/* Map */}
      <div ref={mapContainer} className="flex-1 rounded-xl overflow-hidden" />

      {/* Bottom card strip */}
      {visibleVenues.length > 0 && (
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', flexShrink: 0 }}
        >
          {visibleVenues.map(venue => (
            <div
              key={venue.id}
              ref={el => { if (el) cardRefs.current.set(venue.id, el) }}
              onClick={() => {
                handleCardClick(venue)
                router.push(`/venues/${venue.id}`)
              }}
              className="flex-shrink-0 bg-white overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                width: '200px',
                borderRadius: '10px',
                border: activeId === venue.id ? '2px solid #18181B' : '1px solid #F0EDE9',
                boxShadow: activeId === venue.id ? '0 2px 12px rgba(232,124,46,0.2)' : '0 1px 4px rgba(0,0,0,0.07)',
              }}
            >
              {venue.image_hero && (
                <div style={{ height: '100px', overflow: 'hidden' }}>
                  <img src={venue.image_hero} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '8px 10px' }}>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#18181B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue.name}</p>
                <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '2px 0 0', fontWeight: 400 }}>{venue.area}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
    </div>
  )
}
