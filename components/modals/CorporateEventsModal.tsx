'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'

interface CorporateEventsModalProps {
  isOpen: boolean
  onClose: () => void
  venueName: string
  venueId: string
  roomName?: string
}

export default function CorporateEventsModal({ isOpen, onClose, venueName, venueId, roomName }: CorporateEventsModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    eventType: '',
    eventDate: '',
    flexibleOnDate: false,
    timing: '',
    guestRange: '',
    additionalInfo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/corporate-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          venueName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          phoneExt: null,
          company: formData.company || null,
          eventType: formData.eventType || 'other',
          eventNature: formData.eventType || 'Private event',
          eventDate: formData.eventDate || new Date().toISOString().split('T')[0],
          startTime: formData.timing === 'lunch' ? '12:00' : formData.timing === 'early_evening' ? '18:00' : '19:00',
          endTime: formData.timing === 'lunch' ? '15:00' : formData.timing === 'early_evening' ? '21:00' : '23:00',
          numberOfPeople: formData.guestRange || '12',
          additionalInfo: `${formData.flexibleOnDate ? '[Flexible on date] ' : ''}${formData.additionalInfo}`,
          hearAboutUs: 'clientdining_member',
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit request')
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', eventType: '', eventDate: '', flexibleOnDate: false, timing: '', guestRange: '', additionalInfo: '' })
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const inputClass = "w-full pb-2 bg-transparent border-b border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 font-light focus:outline-none focus:border-zinc-500 transition-colors"
  const selectClass = "w-full pb-2 bg-transparent border-b border-zinc-200 text-sm text-zinc-900 font-light focus:outline-none focus:border-zinc-500 transition-colors appearance-none cursor-pointer"
  const labelClass = "text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light mb-2 block"
  const labelOptClass = "text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light mb-2 block"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" style={{ borderRadius: '6px' }}>

        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-6 flex items-start justify-between" style={{ borderBottom: '1px solid #F0EDE9' }}>
          <div>
            <h2 className="text-2xl font-light text-zinc-900 tracking-tight leading-tight">{venueName}</h2>
            <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase mt-2 font-light">
              {roomName ? roomName : 'Private rooms & events'}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-300 hover:text-zinc-600 transition-colors mt-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">

          {/* Contact */}
          <div className="space-y-5">
            <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light">Contact</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First name</label>
                <input type="text" required value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input type="text" required value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelOptClass}>Phone <span className="text-zinc-300 normal-case tracking-normal text-[10px]">· optional</span></label>
                <input type="tel" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelOptClass}>Company <span className="text-zinc-300 normal-case tracking-normal text-[10px]">· optional</span></label>
                <input type="text" value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
          </div>

          {/* Event */}
          <div className="space-y-5">
            <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light">Event</p>
            <div>
              <label className={labelClass}>Type</label>
              <select value={formData.eventType}
                onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                className={selectClass}>
                <option value="">Select</option>
                <option value="business_dinner">Business dinner</option>
                <option value="private_dining_room">Private dining room</option>
                <option value="drinks_reception">Drinks reception</option>
                <option value="full_venue_hire">Full venue hire</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Timing</label>
                <select value={formData.timing}
                  onChange={e => setFormData({ ...formData, timing: e.target.value })}
                  className={selectClass}>
                  <option value="">Select</option>
                  <option value="lunch">Lunch</option>
                  <option value="early_evening">Early evening</option>
                  <option value="evening">Evening</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Estimated guests</label>
                <select value={formData.guestRange}
                  onChange={e => setFormData({ ...formData, guestRange: e.target.value })}
                  className={selectClass}>
                  <option value="">Select</option>
                  <option value="8-12">8–12</option>
                  <option value="12-20">12–20</option>
                  <option value="20-40">20–40</option>
                  <option value="40+">40+</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <label className={labelClass}>Preferred date</label>
              <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                className={`${inputClass} text-left ${formData.eventDate ? 'text-zinc-900' : 'text-zinc-300'}`}>
                {formData.eventDate ? format(new Date(formData.eventDate), 'd MMMM yyyy') : 'Select a date'}
              </button>
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg p-4" style={{ borderRadius: '6px', border: '1px solid #F0EDE9' }}>
                  <style>{`
                    .rdp { --rdp-accent-color: #3f3f46; --rdp-background-color: #f4f4f5; }
                    .rdp-day_selected .rdp-day_button { background-color: #3f3f46 !important; color: white !important; border-radius: 50% !important; }
                    .rdp-button_reset.rdp-button:hover:not([disabled]) .rdp-day_button { background-color: #e4e4e7 !important; border-radius: 50% !important; }
                  `}</style>
                  <DayPicker mode="single"
                    selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                    onSelect={date => { if (date) { setFormData({ ...formData, eventDate: format(date, 'yyyy-MM-dd') }); setShowCalendar(false) } }}
                    fromDate={new Date()}
                    styles={{ caption: { fontWeight: 300 }, day: { fontWeight: 300 } }}
                    classNames={{ caption_label: 'text-sm font-light text-zinc-900', nav_button: 'text-zinc-500 hover:text-zinc-900', day_today: 'font-medium', day_outside: 'text-zinc-400', day_disabled: 'text-zinc-400' }}
                  />
                </div>
              )}
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.flexibleOnDate}
                  onChange={e => setFormData({ ...formData, flexibleOnDate: e.target.checked })}
                  className="h-3 w-3 border-zinc-200 rounded" />
                <span className="text-[11px] font-light text-zinc-400">Flexible on date</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light">Additional details</p>
            <textarea rows={3} value={formData.additionalInfo}
              onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Budget guidance, dietary requirements, or anything else we should know."
              className="w-full pb-2 bg-transparent border-b border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-300 font-light resize-none focus:outline-none focus:border-zinc-500 transition-colors" />
          </div>

          {error && <p className="text-xs font-light text-red-400">{error}</p>}
          {success && <p className="text-xs font-light text-zinc-500 tracking-wide">Enquiry sent. The venue will be in touch shortly.</p>}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading || success}
              className="h-10 px-8 text-xs font-light tracking-widest uppercase text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#18181B', borderRadius: '3px' }}>
              {loading ? 'Sending…' : success ? 'Sent' : 'Send enquiry'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
