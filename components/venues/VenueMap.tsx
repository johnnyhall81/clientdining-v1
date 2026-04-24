'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Venue } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-client'
import VenueFilterModal, { VenueFilters } from './VenueFilterModal'
import {
  applyVenueFilters,
  countActiveVenueFilters,
  parseVenueFilters,
  serialiseVenueFilters,
} from '@/lib/venueBrowseFilters'

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
  logo_url?: string | null
  hire_only?: boolean | null
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
  const visibleVenuesRef = useRef<VenueWithCoords[]>([])

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [workCoords, setWorkCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [visibleVenues, setVisibleVenues] = useState<VenueWithCoords[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const filters = useMemo(() => parseVenueFilters(searchParams), [searchParams])
  const activeCount = countActiveVenueFilters(filters)

  const updateFilters = (next: VenueFilters) => {
    const params = serialiseVenueFilters(next, searchParams)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('work_postcode')
      .eq('user_id', user.id)
      .single()
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

  const geocoded = useMemo(
    () =>
      venues.filter(
        (v): v is VenueWithCoords =>
          typeof (v as any).lat === 'number' && typeof (v as any).lng === 'number'
      ) as VenueWithCoords[],
    [venues]
  )

  const PRIORITY_AREAS = ['Mayfair', 'The City', 'Soho', 'Marylebone', 'Covent Garden', 'Canary Wharf']

  const allAreas = useMemo(() => {
    const areas = Array.from(new Set(geocoded.map((v) => v.area).filter(Boolean))).sort()
    return [
      ...PRIORITY_AREAS.filter((a) => areas.includes(a)),
      ...areas.filter((a) => !PRIORITY_AREAS.includes(a)),
    ]
  }, [geocoded])

  const filteredGeocoded = useMemo(
    () => applyVenueFilters(geocoded, filters),
    [geocoded, filters]
  )

  const updateVisible = useCallback((map: any, all: VenueWithCoords[]) => {
    const bounds = map.getBounds()
    const visible = all.filter(
      (v) =>
        v.lng >= bounds.getWest() &&
        v.lng <= bounds.getEast() &&
        v.lat >= bounds.getSouth() &&
        v.lat <= bounds.getNorth()
    )
    setVisibleVenues(visible)
  }, [])

  const highlightDot = useCallback(
    (map: any, id: string | null) => {
      if (!map.getSource('active-venue')) return

      if (!id) {
        ;(map.getSource('active-venue') as any).setData({
          type: 'FeatureCollection',
          features: [],
        })
        return
      }

      const venue = geocoded.find((v) => v.id === id)
      if (!venue) return

      ;(map.getSource('active-venue') as any).setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: venue.id },
            geometry: { type: 'Point', coordinates: [venue.lng, venue.lat] },
          },
        ],
      })
    },
    [geocoded]
  )

  const stepTo = useCallback(
    (index: number, currentVenues: VenueWithCoords[]) => {
      if (!currentVenues.length || !mapRef.current) return

      const clamped = Math.max(0, Math.min(index, currentVenues.length - 1))
      const venue = currentVenues[clamped]
      setActiveIndex(clamped)
      setActiveId(venue.id)
      highlightDot(mapRef.current, venue.id)

      setTimeout(() => {
        const card = cardRefs.current.get(venue.id)
        const strip = stripRef.current
        if (!card || !strip) return

        const isMobile = window.innerWidth < 640
        if (isMobile) {
          strip.scrollTo({
            left: card.offsetLeft + card.offsetWidth / 2 - strip.clientWidth / 2,
            behavior: 'smooth',
          })
        } else {
          suppressScrollRef.current = true
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
          setTimeout(() => {
            suppressScrollRef.current = false
          }, 600)
        }
      }, 50)
    },
    [highlightDot]
  )

  useEffect(() => {
    if (!visibleVenues.length || !mapRef.current) return
    stepTo(Math.floor(visibleVenues.length / 2), visibleVenues)
  }, [visibleVenues, stepTo])

  useEffect(() => {
    if (!mapContainer.current || geocoded.length === 0) return
    if (mapRef.current) return

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-0.105, 51.511],
        zoom: 11.2,
        attributionControl: false,
        fadeDuration: 0,
      })

      mapRef.current = map

      map.on('load', () => {
        if (map.getLayer('land')) map.setPaintProperty('land', 'background-color', '#F5F0EA')
        if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', '#F5F0EA')

        if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', '#C8D8E8')
        if (map.getLayer('water-shadow')) map.setPaintProperty('water-shadow', 'fill-color', '#C8D8E8')

        const parkLayers = ['landuse', 'landuse_overlay', 'national_park', 'park', 'green_area']
        parkLayers.forEach((layer) => {
          if (map.getLayer(layer)) map.setPaintProperty(layer, 'fill-color', '#C8D8BC')
        })

        map.addSource('venues', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: filteredGeocoded.map((v) => ({
              type: 'Feature',
              properties: { id: v.id, name: v.name, area: v.area },
              geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
            })),
          },
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 40,
        })

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'venues',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#DA7756',
            'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 10, 24],
            'circle-opacity': 0.85,
          },
        })

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
          paint: { 'text-color': '#ffffff' },
        })

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
          },
        })

        map.addSource('active-venue', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
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
          },
        })

        map.on('click', 'clusters', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
          const clusterId = features[0]?.properties?.cluster_id
          if (!clusterId) return

          ;(map.getSource('venues') as any).getClusterExpansionZoom(
            clusterId,
            (err: any, zoom: number) => {
              if (err) return
              map.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
            }
          )
        })

        map.on('click', 'venues-dots', (e: any) => {
          const id = e.features[0]?.properties?.id
          if (!id) return

          const visIndex = visibleVenuesRef.current.findIndex((v) => v.id === id)
          if (visIndex >= 0) stepTo(visIndex, visibleVenuesRef.current)
          else {
            setActiveId(id)
            highlightDot(map, id)
          }
        })

        map.on('click', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['venues-dots', 'clusters'],
          })
          if (!features.length) {
            setActiveId(null)
            highlightDot(map, null)
          }
        })

        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = ''
        })
        map.on('mouseenter', 'venues-dots', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'venues-dots', () => {
          map.getCanvas().style.cursor = ''
        })

        map.on('moveend', () => updateVisible(map, filteredGeocodedRef.current))

        const initialSet = filteredGeocoded.length > 0 ? filteredGeocoded : geocoded
        updateVisible(map, initialSet)

        if (filteredGeocoded.length > 0) {
          const bounds = new mapboxgl.default.LngLatBounds()
          filteredGeocoded.forEach((v: VenueWithCoords) => bounds.extend([v.lng, v.lat]))
          map.fitBounds(bounds, {
            padding: {
              top: 84,
              bottom: typeof window !== 'undefined' && window.innerWidth >= 640 ? 280 : 80,
              left: 60,
              right: 60,
            },
            maxZoom:
              filters.areas.length === 1
                ? 16
                : filters.areas.length === 2
                  ? 15
                  : filters.mode !== 'all'
                    ? 14
                    : 13,
            duration: 0,
          })
        }
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [geocoded, highlightDot, stepTo, updateVisible])

  useEffect(() => {
    if (!mapRef.current || !workCoords) return

    import('mapbox-gl').then((mapboxgl) => {
      workMarkerRef.current?.remove()

      const el = document.createElement('div')
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #2563EB;
        border: 3px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        cursor: default;
      `
      el.title = 'Your office'

      workMarkerRef.current = new mapboxgl.default.Marker({ element: el })
        .setLngLat([workCoords.lng, workCoords.lat])
        .addTo(mapRef.current)
    })
  }, [workCoords])

  useEffect(() => {
    filteredGeocodedRef.current = filteredGeocoded
  }, [filteredGeocoded])

  useEffect(() => {
    visibleVenuesRef.current = visibleVenues
  }, [visibleVenues])

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
        geometry: { type: 'Point', coordinates: [v.lng, v.lat] },
      })),
    })

    if (filteredGeocoded.length === 0) {
      setVisibleVenues([])
      setActiveId(null)
      setActiveIndex(0)
      highlightDot(map, null)
      return
    }

    updateVisible(map, filteredGeocoded)

    import('mapbox-gl').then((mapboxgl) => {
      const bounds = new mapboxgl.default.LngLatBounds()
      filteredGeocoded.forEach((v: VenueWithCoords) => bounds.extend([v.lng, v.lat]))
      map.fitBounds(bounds, {
        padding: {
          top: 84,
          bottom:
            typeof window !== 'undefined' && window.innerWidth >= 640 ? 280 : 80,
          left: 60,
          right: 60,
        },
        maxZoom:
          filters.areas.length === 1
            ? 16
            : filters.areas.length === 2
              ? 15
              : filters.mode !== 'all'
                ? 14
                : 13,
        duration: 600,
      })
    })
  }, [filteredGeocoded, filters.areas.length, filters.mode, highlightDot, updateVisible])

  const handleCardClick = (venue: VenueWithCoords) => {
    const index = visibleVenues.findIndex((v) => v.id === venue.id)
    setActiveIndex(index)
    setActiveId(venue.id)

    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [venue.lng, venue.lat],
        zoom: Math.max(mapRef.current.getZoom(), 14),
      })
      highlightDot(mapRef.current, venue.id)
    }
  }

  const handleStripScroll = useCallback(() => {
    if (suppressScrollRef.current) return
    if (window.innerWidth >= 640) return
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
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    })

    if (visibleVenues[closestIndex]?.id !== activeId) {
      const venue = visibleVenues[closestIndex]
      setActiveIndex(closestIndex)
      setActiveId(venue.id)
      highlightDot(mapRef.current, venue.id)
    }
  }, [visibleVenues, activeId, highlightDot])

  const mappedVenueLabel =
    filteredGeocoded.length === geocoded.length
      ? `${geocoded.length} venues`
      : `${filteredGeocoded.length} of ${geocoded.length} venues`

  return (
    <div className="relative w-full flex flex-col" style={{ height: '100%' }}>
      {geocoded.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10 rounded-xl">
          <p className="text-sm font-light text-zinc-400">No venues to display</p>
        </div>
      )}

      <div ref={mapContainer} className="cd-map flex-1 overflow-hidden" />

      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-3">
        <div
          className="text-xs font-light text-zinc-600"
          style={{
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            padding: '7px 12px',
          }}
        >
          {mappedVenueLabel}
        </div>

        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 text-xs font-light text-zinc-600 hover:text-zinc-900 transition-colors py-1.5 px-3"
          style={{
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <span>Filter &amp; Sort</span>
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center bg-zinc-900 text-white rounded-full"
              style={{ minWidth: '18px', height: '18px', fontSize: '10px', padding: '0 5px' }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {filteredGeocoded.length === 0 && geocoded.length > 0 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white/95 px-5 py-4 rounded-xl text-center"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
        >
          <p className="text-sm font-light text-zinc-700 mb-2">No venues match your filters.</p>
          {activeCount > 0 && (
            <button
              onClick={() => updateFilters({ mode: 'all', areas: [], sort: 'featured' })}
              className="text-xs font-light text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {visibleVenues.length > 0 && (
        <div className="flex items-center gap-2 pt-3 pb-1" style={{ flexShrink: 0 }}>
          <button
            onClick={() => stepTo(activeIndex - 1, visibleVenues)}
            disabled={activeIndex === 0}
            className="hidden sm:flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

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
            {visibleVenues.map((venue) => (
              <div
                key={venue.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(venue.id, el)
                }}
                onClick={() => {
                  handleCardClick(venue)
                  user
                    ? router.push(`/venues/${venue.id}`)
                    : router.push(`/login?next=${encodeURIComponent('/venues/' + venue.id)}`)
                }}
                className="cd-strip-card flex-shrink-0 bg-white overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  width: '160px',
                  borderRadius: '10px',
                  border:
                    activeId === venue.id
                      ? '2px solid #DA7756'
                      : '2px solid transparent',
                  boxShadow:
                    activeId === venue.id
                      ? '0 2px 12px rgba(232,124,46,0.2)'
                      : '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <div
                  style={{
                    width: '160px',
                    height: '140px',
                    overflow: 'hidden',
                    background: '#F4F2EF',
                    flexShrink: 0,
                  }}
                >
                  {venue.image_hero && (
                    <img
                      src={thumbUrl(venue.image_hero, 320)}
                      alt={venue.name}
                      loading="eager"
                      fetchPriority={
                        activeIndex !== null &&
                        Math.abs(visibleVenues.indexOf(venue) - activeIndex) <= 2
                          ? 'high'
                          : 'low'
                      }
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div
                  style={{
                    width: '160px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 20px',
                    borderTop: '1px solid #F0EDE9',
                    flexShrink: 0,
                  }}
                >
                  {(venue as any).logo_url ? (
                    <img
                      src={(venue as any).logo_url}
                      alt={venue.name}
                      style={{
                        maxHeight: '28px',
                        maxWidth: '112px',
                        width: '100%',
                        objectFit: 'contain',
                        filter: 'brightness(0)',
                        opacity: 0.75,
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#3a3a3a',
                        textAlign: 'center',
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontStyle: 'italic',
                        margin: 0,
                        lineHeight: 1.4,
                        opacity: 0.75,
                      }}
                    >
                      {venue.name}
                    </p>
                  )}
                </div>
                <div style={{ padding: '12px 14px 14px', borderTop: '1px solid #F0EDE9' }}>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#18181B',
                      margin: 0,
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {venue.name}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#a1a1aa',
                      margin: '3px 0 0',
                      fontWeight: 400,
                    }}
                  >
                    {venue.area}
                  </p>
                </div>
              </div>
            ))}
          </div>

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

      <VenueFilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={updateFilters}
        availableAreas={allAreas}
      />

      <style>{`
        .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }
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