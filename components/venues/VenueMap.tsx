'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Venue } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-client'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const SUPABASE_STORAGE = 'supabase.co/storage/v1/object/public'

function thumbUrl(src: string, width: number): string {
  if (src.includes(SUPABASE_STORAGE)) {
    return `${src}?width=${width}&quality=75&resize=cover`
  }
  return src
}

interface VenueWithCoords extends Venue {
  lng: number
  lat: number
}

interface VenueMapProps {
  venues: Venue[]
}

export default function VenueMap({ venues }: VenueMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const workMarkerRef = useRef<any>(null)
  const suppressScrollRef = useRef(false)
  const filteredGeocodedRef = useRef<VenueWithCoords[]>([])
  const router = useRouter()
  const { user } = useAuth()

  const [activeIndex, setActiveIndex] = useState(0)
  const [filterAreas, setFilterAreas] = useState<string[]>([])
  const [venueMode, setVenueMode] = useState<'all' | 'tables' | 'spaces'>('all')
  const [showAllAreas, setShowAllAreas] = useState(false)

  const [workCoords, setWorkCoords] = useState<{ lat: number; lng: number } | null>(null)

  const toggleArea = (area: string) =>
    setFilterAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])

  // Fetch and geocode the user's work postcode once
  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('work_postcode').eq('user_id', user.id).single()
      .then(async ({ data }) => {
        const pc = data?.work_postcode
        if (!pc) return
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pc)}.json?access_token=${MAPBOX_TOKEN}&country=GB&limit=1`
        const res = await fetch(url)
        const json = await res.json()
        const coords = json.features?.[0]?.center
        if (coords) setWorkCoords({ lng: coords[0], lat: coords[1] })
      })
  }, [user])

  // Filter to only venues that have stored coords — memoised for stable map init
  const geocoded = useMemo(
    () =>
      venues.filter(
        (v): v is VenueWithCoords =>
          typeof (v as any).lat === 'number' &&
          typeof (v as any).lng === 'number'
      ) as VenueWithCoords[],
    [venues]
  )

  const PRIORITY_AREAS = ['Mayfair', 'The City', 'Soho', 'Marylebone', 'Covent Garden', 'Canary Wharf']

  const allAreas = useMemo(() => {
    const areas = Array.from(new Set(geocoded.map(v => v.area))).sort()
    return [
      ...PRIORITY_AREAS.filter(a => areas.includes(a)),
      ...areas.filter(a => !PRIORITY_AREAS.includes(a)),
    ]
  }, [geocoded])

  const filteredGeocoded = useMemo(() => {
    let result = geocoded
    if (venueMode === 'tables') result = result.filter(v => !(v as any).hire_only)
    if (venueMode === 'spaces') result = result.filter(v => (v as any).private_hire_available || (v as any).hire_only)
    if (filterAreas.length > 0) result = result.filter(v => filterAreas.includes(v.area))
    return result
  }, [geocoded, filterAreas, venueMode])

  const [visibleVenues, setVisibleVenues] = useState<VenueWithCoords[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Update visible venues based on map bounds + area filter
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

  // Highlight a dot on the map
  const highlightDot = useCallback((map: any, id: string | null) => {
    if (!map.getSource('active-venue')) return
    if (!id) {
      ;(map.getSource('active-venue') as any).setData({ type: 'FeatureCollection', features: [] })
      return
    }
    const venue = geocoded.find(v => v.id === id)
    if (!venue) return
    ;(map.getSource('active-venue') as any).setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { id: venue.id },
        geometry: { type: 'Point', coordinates: [venue.lng, venue.lat] }
      }]
    })
  }, [geocoded])

  // Step to a specific index — highlight dot + scroll card into view
  const stepTo = useCallback((index: number, venues: VenueWithCoords[]) => {
    if (!venues.length || !mapRef.current) return
    const clamped = Math.max(0, Math.min(index, venues.length - 1))
    const venue = venues[clamped]
    setActiveIndex(clamped)
    setActiveId(venue.id)
    highlightDot(mapRef.current, venue.id)
    setTimeout(() => {
      const card = cardRefs.current.get(venue.id)
      const strip = stripRef.current
      if (card && strip) {
        const isMobile = window.innerWidth < 640
        if (isMobile) {
          strip.scrollTo({
            left: card.offsetLeft + card.offsetWidth / 2 - strip.clientWidth / 2,
            behavior: 'smooth',
          })
        } else {
          // Suppress scroll handler while we programmatically scroll
          suppressScrollRef.current = true
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
          setTimeout(() => { suppressScrollRef.current = false }, 600)
        }
      }
    }, 50)
  }, [highlightDot])

  // When visible venues change, reset to middle
  useEffect(() => {
    if (!visibleVenues.length || !mapRef.current) return
    stepTo(Math.floor(visibleVenues.length / 2), visibleVenues)
  }, [visibleVenues, stepTo])

  // Init map
  useEffect(() => {
    if (!mapContainer.current || geocoded.length === 0) return
    if (mapRef.current) return

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        // Pre-set to the same view fitBounds would produce — skips second render
        center: [-0.1050, 51.5110],
        zoom: 11.2,
        // Slight perf wins
        attributionControl: false,
        fadeDuration: 0,
      })

      mapRef.current = map

      map.on('load', () => {
        // Warm the land slightly
        if (map.getLayer('land')) map.setPaintProperty('land', 'background-color', '#F5F0EA')
        if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', '#F5F0EA')

        // Water — soft blue
        if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', '#C8D8E8')
        if (map.getLayer('water-shadow')) map.setPaintProperty('water-shadow', 'fill-color', '#C8D8E8')

        // Parks — muted sage
        const parkLayers = ['landuse', 'landuse_overlay', 'national_park', 'park', 'green_area']
        parkLayers.forEach(layer => {
          if (map.getLayer(layer)) map.setPaintProperty(layer, 'fill-color', '#C8D8BC')
        })
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

        // Cluster circles — warm terracotta
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'venues',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#DA7756',
            'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 10, 24],
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

        // Individual dots — warm, visible but light
        map.addLayer({
          id: 'venues-dots',
          type: 'circle',
          source: 'venues',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#DA7756',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8,
          }
        })

        // Active venue overlay — always on top, even inside clusters
        map.addSource('active-venue', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'active-dot',
          type: 'circle',
          source: 'active-venue',
          paint: {
            'circle-color': '#FFFFFF',
            'circle-radius': 10,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#DA7756',
            'circle-opacity': 1,
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

        // Click dot → highlight + scroll strip
        map.on('click', 'venues-dots', (e: any) => {
          const id = e.features[0]?.properties?.id
          if (!id) return
          const visIndex = visibleVenues.findIndex(v => v.id === id)
          if (visIndex >= 0) stepTo(visIndex, visibleVenues)
          else { setActiveId(id); highlightDot(map, id) }
        })

        // Click empty map → clear active
        map.on('click', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['venues-dots', 'clusters'] })
          if (!features.length) { setActiveId(null); highlightDot(map, null) }
        })

        // Cursor
        map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
        map.on('mouseenter', 'venues-dots', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'venues-dots', () => { map.getCanvas().style.cursor = '' })

        // Update strip on move
        map.on('moveend', () => updateVisible(map, filteredGeocodedRef.current))

        // Initial visible set
        updateVisible(map, filteredGeocodedRef.current)
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [geocoded])

  // Place or update the office marker when workCoords arrive
  useEffect(() => {
    if (!mapRef.current || !workCoords) return

    import('mapbox-gl').then((mapboxgl) => {
      // Remove previous marker if any
      workMarkerRef.current?.remove()

      // Custom blue office dot
      const el = document.createElement('div')
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: #2563EB; border: 3px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        cursor: default;
      `
      el.title = 'Your office'

      workMarkerRef.current = new mapboxgl.default.Marker({ element: el })
        .setLngLat([workCoords.lng, workCoords.lat])
        .addTo(mapRef.current)
    })
  }, [workCoords])

  // Keep ref in sync so moveend always uses latest filtered set
  useEffect(() => { filteredGeocodedRef.current = filteredGeocoded }, [filteredGeocoded])

  // When area filter changes, update map source data + strip + fit bounds
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const source = map.getSource('venues') as any
    if (!source) return

    source.setData({
      type: 'FeatureCollection',
      features: filteredGeocoded.map((v: VenueWithCoords) => ({
        type: 'Feature',
        properties: { id: v.id, name: v.name, area: v.area },
        geometry: { type: 'Point', coordinates: [v.lng, v.lat] }
      }))
    })
    updateVisible(map, filteredGeocoded)

    // Fit map to the filtered venues
    if (filteredGeocoded.length > 0) {
      import('mapbox-gl').then((mapboxgl) => {
        const bounds = new mapboxgl.default.LngLatBounds()
        filteredGeocoded.forEach((v: VenueWithCoords) => bounds.extend([v.lng, v.lat]))
        map.fitBounds(bounds, {
          padding: {
            top: 100,    // chip rows height
            bottom: typeof window !== 'undefined' && window.innerWidth >= 640 ? 280 : 80,  // card strip on desktop
            left: 60,
            right: 60,
          },
          maxZoom: filterAreas.length === 1 ? 17 : filterAreas.length === 2 ? 16 : (venueMode !== 'all') ? 15 : 13,
          duration: 600,
        })
      })
    }
  }, [filteredGeocoded, updateVisible, filterAreas.length, venueMode])

  // Card tapped — highlight its dot, pan map
  const handleCardClick = (venue: VenueWithCoords) => {
    const index = visibleVenues.findIndex(v => v.id === venue.id)
    setActiveIndex(index)
    setActiveId(venue.id)
    if (mapRef.current) {
      mapRef.current.easeTo({ center: [venue.lng, venue.lat], zoom: Math.max(mapRef.current.getZoom(), 14) })
      highlightDot(mapRef.current, venue.id)
    }
  }

  // Mobile swipe scroll — detect snapped card by centre proximity
  // On desktop, arrows are sole source of truth — ignore scroll events
  const handleStripScroll = useCallback(() => {
    if (suppressScrollRef.current) return
    if (window.innerWidth >= 640) return // desktop: arrows only
    if (!stripRef.current || !mapRef.current) return
    const strip = stripRef.current
    const stripCentre = strip.scrollLeft + strip.clientWidth / 2
    let closestIndex = 0
    let closestDist = Infinity
    visibleVenues.forEach((venue, i) => {
      const card = cardRefs.current.get(venue.id)
      if (!card) return
      const cardCentre = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(cardCentre - stripCentre)
      if (dist < closestDist) { closestDist = dist; closestIndex = i }
    })
    if (visibleVenues[closestIndex]?.id !== activeId) {
      const venue = visibleVenues[closestIndex]
      setActiveIndex(closestIndex)
      setActiveId(venue.id)
      highlightDot(mapRef.current, venue.id)
    }
  }, [visibleVenues, activeId, highlightDot])

  return (
    <div className="relative w-full flex flex-col" style={{ height: '100%' }}>

      {geocoded.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10 rounded-xl">
          <p className="text-sm font-light text-zinc-400">No venues to display</p>
        </div>
      )}

      {/* Map — full height */}
      <div ref={mapContainer} className="cd-map flex-1 overflow-hidden" />

      {/* Map controls — overlaid on map top edge */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2">

        {/* Row 1: All · Tables · Spaces mode toggle */}
        <div className="flex items-center gap-1.5">
          {(['all', 'tables', 'spaces'] as const).map(mode => {
            const active = venueMode === mode
            const label = mode === 'all' ? 'All' : mode === 'tables' ? 'Tables' : 'Spaces'
            return (
              <button
                key={mode}
                onClick={() => setVenueMode(mode)}
                className="flex-shrink-0 transition-all duration-150"
                style={{
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: active ? '#18181B' : 'rgba(255,255,255,0.7)',
                  backgroundColor: active ? '#18181B' : 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: active ? 'white' : '#3F3F46',
                  fontSize: '11px',
                  fontWeight: 300,
                  padding: '5px 14px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Row 2: Area chips — 6 surface + more */}
        {allAreas.length > 0 && (() => {
          const SURFACE = 6
          const selected = filterAreas
          const unselected = allAreas.filter(a => !selected.includes(a))
          const visibleUnselected = showAllAreas ? unselected : unselected.slice(0, Math.max(0, SURFACE - selected.length))
          const hiddenCount = showAllAreas ? 0 : unselected.length - visibleUnselected.length
          const chipStyle = (active: boolean): React.CSSProperties => ({
            borderRadius: '20px',
            border: '1px solid',
            borderColor: active ? '#18181B' : 'rgba(255,255,255,0.7)',
            backgroundColor: active ? '#18181B' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: active ? 'white' : '#3F3F46',
            fontSize: '11px',
            fontWeight: 300,
            padding: '5px 13px',
            whiteSpace: 'nowrap' as const,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          })
          const mutedStyle: React.CSSProperties = {
            ...chipStyle(false),
            color: '#A1A1AA',
          }
          return (
            <div
              className="flex items-center gap-1.5 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {selected.map(a => (
                <button key={a} onClick={() => toggleArea(a)} className="flex-shrink-0 transition-all duration-150" style={chipStyle(true)}>{a}</button>
              ))}
              {visibleUnselected.map(a => (
                <button key={a} onClick={() => toggleArea(a)} className="flex-shrink-0 transition-all duration-150" style={chipStyle(false)}>{a}</button>
              ))}
              {hiddenCount > 0 && (
                <button onClick={() => setShowAllAreas(true)} className="flex-shrink-0 transition-colors" style={mutedStyle}>
                  + {hiddenCount} more
                </button>
              )}
              {showAllAreas && (
                <button onClick={() => setShowAllAreas(false)} className="flex-shrink-0 transition-colors" style={mutedStyle}>
                  Less
                </button>
              )}
              {selected.length > 0 && (
                <button onClick={() => setFilterAreas([])} className="flex-shrink-0 transition-colors" style={mutedStyle}>
                  Clear
                </button>
              )}
            </div>
          )
        })()}

      </div>

      {/* Bottom card strip */}
      {visibleVenues.length > 0 && (
        <div className="flex items-center gap-2 pt-3 pb-1" style={{ flexShrink: 0 }}>

          {/* Prev arrow — desktop only */}
          <button
            onClick={() => stepTo(activeIndex - 1, visibleVenues)}
            disabled={activeIndex === 0}
            className="hidden sm:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Scrollable cards */}
          <div
            ref={stripRef}
            onScroll={handleStripScroll}
            className="cd-strip flex gap-3 overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flexShrink: 1,
              scrollSnapType: 'x mandatory',
            }}
          >
            {visibleVenues.map(venue => (
              <div
                key={venue.id}
                ref={el => { if (el) cardRefs.current.set(venue.id, el) }}
                onClick={() => {
                  handleCardClick(venue)
                  user ? router.push(`/venues/${venue.id}`) : router.push(`/login?next=${encodeURIComponent('/venues/' + venue.id)}`)
                }}
                className="cd-strip-card flex-shrink-0 bg-white overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  width: '160px',
                  borderRadius: '10px',
                  border: activeId === venue.id ? '2px solid #DA7756' : '2px solid transparent',
                  boxShadow: activeId === venue.id ? '0 2px 12px rgba(232,124,46,0.2)' : '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <div style={{ width: '160px', height: '140px', overflow: 'hidden', background: '#F4F2EF', flexShrink: 0 }}>
                  {venue.image_hero && (
                    <img
                      src={thumbUrl(venue.image_hero, 320)}
                      alt={venue.name}
                      loading="eager"
                      fetchPriority={activeIndex !== null && Math.abs(visibleVenues.indexOf(venue) - activeIndex) <= 2 ? 'high' : 'low'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ width: '160px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', borderTop: '1px solid #F0EDE9', flexShrink: 0 }}>
                  {(venue as any).logo_url ? (
                    <img src={(venue as any).logo_url} alt={venue.name} style={{ maxHeight: '28px', maxWidth: '112px', width: '100%', objectFit: 'contain', filter: 'brightness(0)', opacity: 0.75 }} />
                  ) : (
                    <p style={{ fontSize: '12px', color: '#3a3a3a', textAlign: 'center', fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', margin: 0, lineHeight: 1.4, opacity: 0.75 }}>{venue.name}</p>
                  )}
                </div>
                <div style={{ padding: '12px 14px 14px', borderTop: '1px solid #F0EDE9' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#18181B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue.name}</p>
                  <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '3px 0 0', fontWeight: 400 }}>{venue.area}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next arrow — desktop only */}
          <button
            onClick={() => stepTo(activeIndex + 1, visibleVenues)}
            disabled={activeIndex === visibleVenues.length - 1}
            className="hidden sm:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

        </div>
      )}

      <style>{`
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
        /* Mobile: fixed map height so cards are always visible below */
        .cd-map { height: 46vh; flex: none; }
        .cd-strip {
          padding-left: calc(50% - 80px);
          padding-right: calc(50% - 80px);
        }
        .cd-strip-card { scroll-snap-align: center; }
        @media (min-width: 640px) {
          .cd-map { flex: 1; height: auto; }
          .cd-strip { padding-left: 0; padding-right: 0; }
          .cd-strip-card { scroll-snap-align: start; }
        }
      `}</style>
    </div>
  )
}
