'use client'

import { useState, useEffect } from 'react'

interface Nomination {
  id: string
  nominee_name: string
  nominee_email: string
  nominee_company: string | null
  created_at: string
}

export default function NominationCard() {
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [canNominate, setCanNominate] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  })

  useEffect(() => {
    loadNominations()
  }, [])

  const loadNominations = async () => {
    try {
      const response = await fetch('/api/nominations')
      const data = await response.json()
      if (response.ok) {
        setNominations(data.nominations || [])
        setCanNominate(data.can_nominate || false)
      }
    } catch (err) {
      console.error('Failed to load nominations:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setSuccess(`Invitation sent to ${formData.name}`)
      setFormData({ name: '', email: '', company: '' })
      loadNominations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!canNominate) {
    return null
  }

  const remainingNominations = 3 - nominations.length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-light text-zinc-900 mb-2">
        Invite a few trusted contacts from your professional network to ClientDining.
        </h2>
        <p className="text-sm text-zinc-600 font-light">
          {remainingNominations} {remainingNominations === 1 ? 'invitation' : 'invitations'} remaining
        </p>
      </div>

      {remainingNominations > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-zinc-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input-field"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-zinc-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="input-field"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg font-light">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg font-light">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white border border-zinc-800 text-zinc-800 py-3 rounded-lg hover:bg-zinc-50 disabled:opacity-50 font-light"
          >
            {loading ? 'Sending...' : 'Invite'}
          </button>
          <p className="text-xs text-zinc-400 font-light text-center">
            We'll keep it simple.
          </p>
        </form>
      ) : (
        <div className="text-sm text-zinc-600 bg-zinc-50 p-4 rounded-lg mb-6 font-light">
          All 3 invitations sent.
        </div>
      )}

      {nominations.length > 0 && (
        <div>
          <h3 className="text-sm font-light text-zinc-500 mb-3">
            Sent
          </h3>
          <div className="space-y-2">
            {nominations.map((nom) => (
              <div
                key={nom.id}
                className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg text-sm"
              >
                <div>
                  <p className="font-light text-zinc-900">{nom.nominee_name}</p>
                  <p className="text-zinc-600 font-light">{nom.nominee_email}</p>
                  {nom.nominee_company && (
                    <p className="text-zinc-500 text-xs font-light">{nom.nominee_company}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-500 font-light">
                  {new Date(nom.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}