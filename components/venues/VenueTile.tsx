'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Venue } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ShareButton from '@/components/venues/ShareButton'

interface VenueTileProps {
  venue: Venue & { image?: string }
  availableSlots?: number
  priority?: boolean
}

const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EACMQAAIBBAIDAQAAAAAAAAAAAAECAwQREiExBUFRcf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwCl2q2VrBYxy3MLvdTMXleRiQxPfnzS7VZoY7q4it5BIkcrKrgY3AHBxSlKiiSSST//2Q=='

export default function VenueTile({ venue, availableSlots = 0, priority = false }: VenueTileProps) {
  const router = useRouter()
  const { user } = useAuth()
  const imageSrc = venue.image_hero || venue.image

  const handleClick = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/venues/' + venue.id)}`)
    } else {
      router.push(`/venues/${venue.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="group block cursor-pointer focus:outline-none rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all duration-300 hover:border-zinc-200 hover:shadow-sm"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover object-center transition-[transform,opacity] duration-700 group-hover:scale-[1.02]"
              style={{ opacity: 0 }}
              onLoad={e => { (e.target as HTMLImageElement).style.opacity = '1' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {(venue as any).logo_url ? (
              <img
                src={(venue as any).logo_url}
                alt={venue.name}
                className="absolute inset-0 m-auto object-contain z-10"
                style={{ filter: 'brightness(0) invert(1)', maxHeight: '40%', maxWidth: '75%', width: 'auto', height: 'auto' }}
              />
            ) : (
              <p
                className="absolute inset-0 flex items-center justify-center z-10 text-white text-4xl tracking-tight text-center px-6 italic"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {venue.name}
              </p>
            )}
            <div className="absolute bottom-4 left-5 z-10">
              <p className="text-white text-sm font-light tracking-wide">{venue.name}</p>
              {venue.area && <p className="text-white/60 text-xs font-light mt-0.5">{venue.area}</p>}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
        )}

        {/* Share — top-right overlay */}
        <div className="absolute top-3 right-3 z-10">
          <ShareButton
            url={`/venues/${venue.id}`}
            title={venue.name}
            variant="overlay"
          />
        </div>

        {availableSlots > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs font-light text-green-700 bg-green-50 px-3 py-1 rounded-full">
              Available
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
