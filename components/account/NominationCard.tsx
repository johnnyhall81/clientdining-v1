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
      if (data.nomination) setNominations((prev) => [data.nomination, ...prev])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Invite card */}
      <div className="bg-white rounded-2xl border border-zinc-100 px-7 py-6">
        <p className="text-xs tracking-[0.12em] text-zinc-400 uppercase font-light mb-1">Invite a colleague</p>
        <p className="text-sm font-light text-zinc-500 mb-5 leading-relaxed">
          Know someone who should have access? Send them an invitation.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex items-stretch bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex-1 px-5 py-3.5">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm font-light text-zinc-900 placeholder-zinc-300 bg-transparent outline-none"
                placeholder="colleague@company.com"
              />
            </div>
            <div className="w-px bg-zinc-200 my-2.5" />
            <button
              type="submit"
              disabled={loading}
              className="px-5 text-xs text-zinc-500 hover:text-zinc-900 font-light transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {loading ? 'Sending…' : 'Send invite'}
            </button>
          </div>

          {error && <p className="text-xs text-red-500 font-light mt-3">{error}</p>}
          {success && <p className="text-xs text-zinc-400 font-light mt-3">{success}</p>}
        </form>
      </div>

      {/* Sent invites card */}
      {nominations.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 px-7 py-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs tracking-[0.12em] text-zinc-400 uppercase font-light">Sent invitations</p>
            <span className="text-xs font-light text-zinc-300">{nominations.length}</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {nominations.map((nom) => {
              const name = nom.nominee_name
                .split(' ')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')
              return (
                <div key={nom.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-light text-zinc-900 leading-snug">{name}</p>
                    <p className="text-xs font-light text-zinc-400 mt-0.5 truncate">
                      {nom.nominee_email}{nom.nominee_company ? ` · ${nom.nominee_company}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-[9px] tracking-[0.12em] uppercase font-light text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                    <span className="text-xs font-light text-zinc-300 tabular-nums">
                      {new Date(nom.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
