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

      setSuccess(`Invitation sent to ${formData.name}.`)
      setFormData({ name: '', email: '', company: '' })
      loadNominations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!canNominate) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-light text-zinc-900 mb-1">Invite a colleague</h2>
        <p className="text-sm text-zinc-400 font-light">
          All invitations are reviewed before approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-light text-zinc-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-light text-zinc-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder="jane@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-light text-zinc-700 mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="input-field"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-light">{error}</p>
        )}

        {success && (
          <p className="text-sm text-zinc-500 font-light">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-8 bg-zinc-900 text-zinc-50 py-3 rounded-lg hover:bg-zinc-800 disabled:opacity-50 font-light transition-colors duration-200"
        >
          {loading ? 'Sending...' : 'Send invitation'}
        </button>
      </form>

      {nominations.length > 0 && (
        <div>
          <h3 className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-3">Sent</h3>
          <div className="space-y-2">
            {nominations.map((nom) => (
              <div key={nom.id} className="flex items-center justify-between py-2 border-b border-zinc-100 text-sm">
                <div>
                  <p className="font-light text-zinc-900">{nom.nominee_name}</p>
                  <p className="text-zinc-400 font-light text-xs">{nom.nominee_email}{nom.nominee_company ? ` · ${nom.nominee_company}` : ''}</p>
                </div>
                <span className="text-xs text-zinc-400 font-light">
                  {new Date(nom.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
