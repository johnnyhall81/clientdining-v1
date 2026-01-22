'use client'

import { useState } from 'react'

export default function AccountPage() {
  const [tier, setTier] = useState<'free' | 'premium'>('free')
  
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">
          Manage your subscription and preferences
        </p>
      </div>
      
      {/* Subscription card */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Subscription
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
            <div>
              <h3 className="font-semibold text-gray-900">
                {tier === 'free' ? 'Free Tier' : 'Premium Tier'}
              </h3>
              <p className="text-sm text-gray-600">
                {tier === 'free' 
                  ? 'Limited to 3 future bookings and standard tables'
                  : '£49/month • Up to 10 future bookings, premium slots, and club access'
                }
              </p>
            </div>
            
            {tier === 'free' && (
              <button className="btn-primary">
                Upgrade to Premium
              </button>
            )}
          </div>
          
          {tier === 'free' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">
                Unlock with Premium
              </h4>
              <ul className="space-y-1 text-sm text-amber-800">
                <li>✓ Book premium restaurant slots more than 24 hours in advance</li>
                <li>✓ Hold up to 10 future bookings (vs 3 on free tier)</li>
                <li>✓ Priority alert notifications</li>
                <li>✓ Request a slot</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile information */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value="user@example.com"
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Verification
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                ✓ Verified
              </span>
              <span className="text-sm text-gray-600">
                City professional status confirmed
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password change */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Change Password
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="input-field"
            />
          </div>
          
          <button className="btn-primary">
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}
