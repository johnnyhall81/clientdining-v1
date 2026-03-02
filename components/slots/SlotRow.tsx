import { Slot } from '@/lib/supabase'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import { isWithin24Hours } from '@/lib/date-utils'
import AlertToggle from './AlertToggle'

interface SlotRowProps {
  slot: Slot
  onBook: (slotId: string) => void
  isAlertActive: boolean
  onToggleAlert: (slotId: string) => void
  isBookedByMe?: boolean
  userName?: string | null
  avatarUrl?: string | null
}

export default function SlotRow({
  slot,
  onBook,
  isAlertActive,
  onToggleAlert,
  isBookedByMe = false,
  userName,
  avatarUrl,
}: SlotRowProps) {
  const isAvailable = slot.status === 'available'
  const within24h = isWithin24Hours(slot.start_at)
  const canBook = isAvailable && !within24h

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const firstName = userName?.split(' ')[0] || 'You'

  return (
    <div
      className="flex items-center justify-between py-6 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50 transition-colors"
      onClick={() => !isBookedByMe && canBook && onBook(slot.id)}
    >
      <div className="flex-1 grid grid-cols-4 gap-4">
        {/* Date / time */}
        <div>
          <p className="text-sm font-light text-zinc-900 whitespace-nowrap">{formatSlotDate(slot.start_at)}</p>
          <p className="text-sm text-zinc-500 font-light">{formatSlotTime(slot.start_at)}</p>
        </div>

        {/* Party size */}
        <div className="flex items-center">
          <p className="text-sm text-zinc-500 font-light">
            {slot.party_min === slot.party_max
              ? `${slot.party_min} guests`
              : `${slot.party_min}–${slot.party_max} guests`}
          </p>
        </div>

        {/* Spacer */}
        <div />

        {/* Action */}
        <div className="flex items-center gap-2 justify-end">
          {isBookedByMe ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-light tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                Confirmed
              </span>
              <div className="flex items-center gap-1.5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName || ''}
                    className="w-4 h-4 rounded-full object-cover opacity-70"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-300 flex items-center justify-center">
                    <span className="text-[8px] font-medium text-zinc-600">{initials}</span>
                  </div>
                )}
                <span className="text-xs font-light text-zinc-400">
                  Reserved for {firstName}
                </span>
              </div>
            </div>
          ) : canBook ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onBook(slot.id) }}
              className="h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Book
            </button>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <AlertToggle isActive={isAlertActive} onToggle={() => onToggleAlert(slot.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
