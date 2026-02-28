'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface Nomination {
  id: string
  nominee_name: string
  nominee_email: string
  nominee_company: string | null
  created_at: string
}

interface Props {
  userId: string
  canNominate: boolean
}

export default function NominationCard({ userId, canNominate }: Props) {
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })

  useEffect(() => {
    if (!canNominate) return
    supabase
      .from('nominations')
      .select('id, nominee_name, nominee_email, nominee_company, created_at')
      .eq('nominator_user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setNominations(data) })
  }, [userId, canNominate])

  if (!canNominate) return null

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

      if (!response.ok) throw new Error(data.error || 'Failed to send invitation')

      setSuccess('Invitation sent.')
      setFormData({ name: '', email: '', company: '' })
      if (data.nomination) {
        setNominations((prev) => [data.nomination, ...prev])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-light text-zinc-900 mb-2">Share access</h2>
        <p className="text-sm font-light text-zinc-400 leading-relaxed">
          ClientDining is a private network. Invite colleagues who host regularly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-6">
        <label className="block text-sm font-light text-zinc-500 mb-1">Colleague&apos;s email</label>
        <div className="flex items-center border border-zinc-200 rounded-lg px-4 bg-white focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="flex-1 py-3 text-sm font-light text-zinc-900 placeholder-zinc-400 bg-transparent outline-none"
            placeholder="colleague@company.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-sm font-light text-zinc-500 hover:text-zinc-900 disabled:opacity-40 transition-colors whitespace-nowrap pl-4"
          >
            {loading ? 'Sending...' : 'Invite'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 font-light mt-2">{error}</p>}
        {success && <p className="text-sm text-zinc-500 font-light mt-2">{success}</p>}
      </div>
      </form>

      {nominations.length > 0 && (
        <div>
          <h3 className="text-xs font-light text-zinc-400 mb-3">Sent</h3>
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
