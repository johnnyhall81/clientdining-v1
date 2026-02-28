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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-zinc-900">Introduce</h1>
      </div>

      {/* Invite bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-stretch bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex-1 px-5 py-4">
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-sm font-light text-zinc-900 placeholder-zinc-400 bg-transparent outline-none"
              placeholder="colleague@company.com"
            />
          </div>
          <div className="w-px bg-zinc-200 my-3" />
          <button
            type="submit"
            disabled={loading}
            className="px-4 text-xs text-zinc-400 hover:text-zinc-600 font-light transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? 'Sending...' : 'Invite'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 font-light mt-2">{error}</p>}
        {success && <p className="text-sm text-zinc-500 font-light mt-2">{success}</p>}
      </form>

      {/* Sent list — plain, no card wrapper */}
      {nominations.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-light text-zinc-400 mb-3">Sent</p>
          <div>
            {nominations.map((nom) => (
              <div key={nom.id} className="flex items-center justify-between py-3 border-b border-zinc-200 last:border-b-0">
                <div>
                  <p className="text-sm font-light text-zinc-900">
                    {nom.nominee_name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                  </p>
                  <p className="text-xs font-light text-zinc-400">
                    {nom.nominee_email}{nom.nominee_company ? ` · ${nom.nominee_company}` : ''}
                  </p>
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
