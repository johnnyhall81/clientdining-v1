'use client'

import { useEffect } from 'react'

export default function PopupCallbackPage() {
  useEffect(() => {
    // Tell the parent window auth is complete, then close the popup
    if (window.opener) {
      window.opener.postMessage({ type: 'LINKEDIN_AUTH_COMPLETE' }, window.location.origin)
      window.close()
    } else {
      // Fallback: not in a popup, just go to home
      window.location.href = '/home'
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <p className="text-white text-sm font-light tracking-wide">Signing you in…</p>
    </div>
  )
}
