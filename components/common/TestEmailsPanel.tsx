'use client'

import { useState } from 'react'

const EMAILS = [
  { type: 'booking', label: 'Booking confirmation' },
  { type: 'cancellation', label: 'Cancellation' },
  { type: 'alert', label: 'Alert notification' },
  { type: 'verification', label: 'Membership verified' },
  { type: 'admin', label: 'Admin booking alert' },
]

export default function TestEmailsPanel() {
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const sendTest = async (type: string) => {
    setSending(type)
    setError(null)
    try {
      const res = await fetch('/api/admin/test-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(prev => [...prev, type])
      setTimeout(() => setSent(prev => prev.filter(t => t !== type)), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-900 mb-1">Test emails</p>
      <p className="text-xs text-gray-400 mb-5">All sent to john@clientdining.com</p>

      <div className="space-y-2">
        {EMAILS.map(({ type, label }) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-light">{label}</span>
            <button
              onClick={() => sendTest(type)}
              disabled={sending === type}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {sending === type ? 'Sending…' : sent.includes(type) ? '✓ Sent' : 'Send test'}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
    </div>
  )
}
