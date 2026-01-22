'use client'

import { useState } from 'react'
import { formatFullDateTime } from '@/lib/date-utils'

interface Alert {
  id: string
  venueName: string
  slotStartAt: string
  partySize: string
  status: 'active' | 'notified'
}

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    venueName: 'Core by Clare Smyth',
    slotStartAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    partySize: '2-4 guests',
    status: 'active'
  },
  {
    id: 'a2',
    venueName: 'Gymkhana',
    slotStartAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    partySize: '4 guests',
    status: 'active'
  }
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  
  const handleToggle = (alertId: string) => {
    console.log('Toggling alert:', alertId)
    // Would call /api/alerts/toggle
  }
  
  const activeAlerts = alerts.filter(a => a.status === 'active')
  const notifiedAlerts = alerts.filter(a => a.status === 'notified')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Alerts
        </h1>
        <p className="text-gray-600">
          Get notified when tables become available
        </p>
      </div>
      
      {/* Active alerts */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Active Alerts ({activeAlerts.length})
        </h2>
        
        {activeAlerts.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No active alerts. Set an alert on any unavailable slot to be notified when it becomes available.
          </p>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{alert.venueName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatFullDateTime(alert.slotStartAt)} • {alert.partySize}
                  </p>
                </div>
                
                <button
                  onClick={() => handleToggle(alert.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          How alerts work
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• You'll be notified by email when a slot becomes available</li>
          <li>• For slots more than 24 hours away, alerts are processed in order (FIFO)</li>
          <li>• For last-minute slots (within 24 hours), all alert holders are notified at once</li>
          <li>• You have 15 minutes to book after being notified for future slots</li>
        </ul>
      </div>
    </div>
  )
}
