'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SummaryLayoutProps {
  token: string
  isHost: boolean
  onEditToggle: (editing: boolean) => void
  children: React.ReactNode
}

export default function SummaryLayout({
  token,
  isHost,
  onEditToggle,
  children,
}: SummaryLayoutProps) {
  const [showQR, setShowQR] = useState(false)
  const summaryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/summary/${token}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-card to-muted">
      {/* Header */}
      <div className="bg-card border-b-2 border-sepia p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-burgundy">Session Summary</h1>
            <p className="text-sm text-sepia italic mt-1">Philosophical Discourse Documentation</p>
          </div>

          <div className="flex gap-3 items-center">
            {isHost && (
              <Button
                onClick={() => onEditToggle(true)}
                className="bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
              >
                Edit Content
              </Button>
            )}

            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-gold text-ink rounded-md font-serif text-sm hover:bg-gold/90 transition-colors"
            >
              {showQR ? 'Hide' : 'Share'} QR
            </button>
          </div>
        </div>

        {/* QR Code and Link section */}
        {showQR && (
          <div className="mt-6 pt-6 border-t border-muted max-w-6xl mx-auto">
            <div className="flex gap-8">
              {/* QR Code placeholder */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white border-4 border-sepia rounded-lg flex items-center justify-center mb-2">
                  <div className="text-center text-xs text-sepia font-serif">
                    <p>QR Code</p>
                    <p className="text-[10px] mt-1">{token}</p>
                  </div>
                </div>
                <p className="text-xs text-sepia font-serif">Scan to access</p>
              </div>

              {/* URL */}
              <div className="flex-1">
                <p className="text-xs text-sepia font-serif uppercase tracking-wide mb-2">Share URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={summaryUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-background border border-muted rounded-md text-sm font-serif"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summaryUrl)
                    }}
                    className="px-4 py-2 bg-sepia text-parchment rounded-md text-sm font-serif hover:bg-sepia/90"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isHost ? 'Shareable link for students' : 'Copied to clipboard'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
