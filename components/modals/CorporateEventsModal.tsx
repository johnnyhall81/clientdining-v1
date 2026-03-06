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
}

export default function CorporateEventsModal({
  isOpen,
  onClose,
  venueName,
  venueId,
}: CorporateEventsModalProps) {
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
    
    // Validate required fields
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setFormData({
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
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-light text-zinc-900">{venueName}</h2>
            <p className="text-sm font-light text-zinc-400 mt-1">Private Rooms & Events</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Contact */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-500 mb-2">
                Phone <span className="text-zinc-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-500 mb-2">
                Company <span className="text-zinc-400">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div>
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Event type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              >
                <option value="">Select type</option>
                <option value="business_dinner">Business dinner</option>
                <option value="private_dining_room">Private dining room</option>
                <option value="drinks_reception">Drinks reception</option>
                <option value="full_venue_hire">Full venue hire</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Preferred date
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-left text-sm font-light transition-colors ${
                  formData.eventDate ? 'text-zinc-900' : 'text-zinc-400'
                } hover:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400`}
              >
                {formData.eventDate ? format(new Date(formData.eventDate), 'd MMMM yyyy') : 'Select date'}
              </button>
              
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4">
                  <style>{`
                    .rdp { --rdp-accent-color: #3f3f46; --rdp-background-color: #f4f4f5; }
                    .rdp-day_selected .rdp-day_button {
                      background-color: #3f3f46 !important;
                      color: white !important;
                      border-radius: 50% !important;
                    }
                    .rdp-button_reset.rdp-button:hover:not([disabled]) .rdp-day_button {
                      background-color: #e4e4e7 !important;
                      border-radius: 50% !important;
                    }
                  `}</style>
                  <DayPicker
                    mode="single"
                    selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, eventDate: format(date, 'yyyy-MM-dd') })
                        setShowCalendar(false)
                      }
                    }}
                    fromDate={new Date()}
                    styles={{
                      caption: { fontWeight: 300 },
                      day: { fontWeight: 300 },
                    }}
                    classNames={{
                      caption_label: 'text-sm font-light text-zinc-900',
                      nav_button: 'text-zinc-400 hover:text-zinc-900',
                      day_today: 'font-medium',
                      day_outside: 'text-zinc-300',
                      day_disabled: 'text-zinc-200',
                    }}
                  />
                </div>
              )}
              
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={formData.flexibleOnDate}
                  onChange={(e) => setFormData({ ...formData, flexibleOnDate: e.target.checked })}
                  className="rounded h-4 w-4"
                />
                <span className="text-sm font-light text-zinc-600">Flexible on date</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Preferred timing
              </label>
              <select
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              >
                <option value="">Select timing</option>
                <option value="lunch">Lunch</option>
                <option value="early_evening">Early evening</option>
                <option value="evening">Evening</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Estimated guests
              </label>
              <select
                value={formData.guestRange}
                onChange={(e) => setFormData({ ...formData, guestRange: e.target.value })}
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
              >
                <option value="">Select range</option>
                <option value="8-12">8–12</option>
                <option value="12-20">12–20</option>
                <option value="20-40">20–40</option>
                <option value="40+">40+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-2">
                Additional details
              </label>
              <textarea
                rows={4}
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Any budget guidance, dietary needs, or context we should know?"
                className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg font-light">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg font-light">
              Enquiry sent successfully. The venue will be in touch soon.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 text-sm font-light text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : success ? 'Sent' : 'Send enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
