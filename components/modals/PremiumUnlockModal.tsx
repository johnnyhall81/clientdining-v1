'use client'

import { useRouter } from 'next/navigation'

interface PremiumUnlockModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PremiumUnlockModal({ isOpen, onClose }: PremiumUnlockModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUpgrade = () => {
    router.push('/account')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-zinc-900 mb-2">
              Premium Access Required
            </h2>
            <p className="text-zinc-600 font-light">
              This slot is available exclusively to Premium members.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-zinc-50 rounded-lg p-6 mb-6">
            <h3 className="font-light text-zinc-900 mb-4">Premium Benefits:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-zinc-700 font-light">Book premium slots up to 30 days in advance</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-zinc-700 font-light">Hold up to 10 future bookings (vs 3)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-zinc-700 font-light">Priority alert notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-zinc-700 font-light">Access high-demand times</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-3xl font-light text-zinc-900">£49<span className="text-lg font-light text-zinc-600">/month</span></div>
            <div className="text-sm text-zinc-500 font-light mt-1">Cancel anytime</div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-zinc-900 text-zinc-50 py-3 px-6 rounded-lg font-light hover:bg-zinc-800 transition-colors"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white text-zinc-700 py-3 px-6 rounded-lg font-light border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
