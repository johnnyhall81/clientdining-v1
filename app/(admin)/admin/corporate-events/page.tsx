'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

interface CorporateEventRequest {
  id: string
  user_id: string
  venue_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  phone_ext: string | null
  company: string
  event_type: string
  event_nature: string
  event_date: string
  start_time: string
  end_time: string
  number_of_people: number
  additional_info: string | null
  status: string
  admin_notes: string | null
  created_at: string
  venues: {
    name: string
  }
  profiles: {
    full_name: string
  }
}

export default function CorporateEventsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<CorporateEventRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'forwarded' | 'confirmed' | 'declined'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadRequests()
    }
  }, [user, authLoading, router])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('corporate_event_requests')
        .select(`
          *,
          venues (name),
          profiles (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('corporate_event_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error

      loadRequests()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'forwarded': return 'bg-blue-100 text-blue-700'
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'declined': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-zinc-900 mb-2">Corporate Event Requests</h1>
        <p className="text-zinc-600 font-light">Manage corporate event inquiries from members</p>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'forwarded', 'confirmed', 'declined'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`py-4 px-1 border-b-2 font-light text-sm capitalize ${
                filter === status
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {status} ({requests.filter(r => status === 'all' || r.status === status).length})
            </button>
          ))}
        </nav>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <p className="text-zinc-500 font-light">No {filter !== 'all' ? filter : ''} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-light text-zinc-900">{request.venues.name}</h3>
                  <p className="text-sm text-zinc-600 font-light">
                    {request.event_nature} • {request.number_of_people} guests
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-light mb-1">Contact</p>
                  <p className="text-sm text-zinc-900 font-light">{request.first_name} {request.last_name}</p>
                  <p className="text-sm text-zinc-600 font-light">{request.email}</p>
                  {request.phone && (
                    <p className="text-sm text-zinc-600 font-light">
                      {request.phone}{request.phone_ext ? ` ext. ${request.phone_ext}` : ''}
                    </p>
                  )}
                  <p className="text-sm text-zinc-600 font-light">{request.company}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 font-light mb-1">Event Details</p>
                  <p className="text-sm text-zinc-900 font-light capitalize">{request.event_type.replace('_', ' ')}</p>
                  <p className="text-sm text-zinc-600 font-light">
                    {new Date(request.event_date).toLocaleDateString('en-GB', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-zinc-600 font-light">{request.start_time} - {request.end_time}</p>
                </div>
              </div>

              {request.additional_info && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 font-light mb-1">Additional Information</p>
                  <p className="text-sm text-zinc-700 font-light">{request.additional_info}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(request.id, 'forwarded')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-light"
                    >
                      Mark as Forwarded
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, 'declined')}
                      className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-light"
                    >
                      Decline
                    </button>
                  </>
                )}
                {request.status === 'forwarded' && (
                  <>
                    <button
                      onClick={() => updateStatus(request.id, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-light"
                    >
                      Mark as Confirmed
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, 'pending')}
                      className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-light"
                    >
                      Back to Pending
                    </button>
                  </>
                )}
                {(request.status === 'confirmed' || request.status === 'declined') && (
                  <button
                    onClick={() => updateStatus(request.id, 'pending')}
                    className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-light"
                  >
                    Reopen
                  </button>
                )}
                
                <p className="text-xs text-zinc-400 font-light ml-auto">
                  Submitted {new Date(request.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}