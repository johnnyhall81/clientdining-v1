'use client'

import { useState } from 'react'

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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneExt: '',
    company: '',
    eventType: 'business_dinner',
    eventNature: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    numberOfPeople: '',
    additionalInfo: '',
    hearAboutUs: 'clientdining_member',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/corporate-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          venueId,
          venueName,
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
          phoneExt: '',
          company: '',
          eventType: 'business_dinner',
          eventNature: '',
          eventDate: '',
          startTime: '',
          endTime: '',
          numberOfPeople: '',
          additionalInfo: '',
          hearAboutUs: 'clientdining_member',
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light text-zinc-900">Corporate Event Inquiry</h2>
            <p className="text-sm text-zinc-600 font-light mt-1">{venueName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  Ext.
                </label>
                <input
                  type="text"
                  value={formData.phoneExt}
                  onChange={(e) => setFormData({ ...formData, phoneExt: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Company <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900">Event Details</h3>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Event Style <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="input-field"
              >
                <option value="business_dinner">Business Dinner</option>
                <option value="board_dinner">Board Dinner</option>
                <option value="firm_reception">Firm Reception</option>
                <option value="offsite">Off-site</option>
                <option value="private_breakfast">Private Breakfast</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Nature of Event <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Client dinner, Partner celebration"
                value={formData.eventNature}
                onChange={(e) => setFormData({ ...formData, eventNature: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Preferred Event Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-700 mb-1">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Number of People <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.numberOfPeople}
                onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-zinc-700 mb-1">
                Additional Information
              </label>
              <textarea
                rows={4}
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder="Budget, dietary requirements, special requests..."
                className="input-field resize-none"
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
              Request submitted successfully! The venue will be in touch soon.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-zinc-900 text-zinc-50 py-3 rounded-lg hover:bg-zinc-800 disabled:opacity-50 font-light"
          >
            {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}