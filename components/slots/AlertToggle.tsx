'use client'

import { useState } from 'react'

interface AlertToggleProps {
  isActive: boolean
  onToggle: () => void
}

export default function AlertToggle({ isActive, onToggle }: AlertToggleProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle()
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`text-sm px-3 py-1 rounded-lg border transition-colors ${
        isActive
          ? 'bg-blue-50 border-blue-600 text-blue-700'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
      title={isActive ? 'Alert active' : 'Set alert'}
    >
      {isLoading ? '...' : isActive ? '🔔 Alert On' : '🔔 Alert Me'}
    </button>
  )
}
