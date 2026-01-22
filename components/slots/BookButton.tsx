'use client'

import { useState } from 'react'

interface BookButtonProps {
  onBook: () => void
  disabled?: boolean
}

export default function BookButton({ onBook, disabled = false }: BookButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onBook()
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="btn-primary text-sm px-4 py-2"
    >
      {isLoading ? 'Booking...' : 'Book'}
    </button>
  )
}
