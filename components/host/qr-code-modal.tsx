'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface QRCodeModalProps {
  token: string
  onClose: () => void
}

export default function QRCodeModal({ token, onClose }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const summaryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/summary/${token}`

  useEffect(() => {
    // Generate QR code using qr-server API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(summaryUrl)}`
    setQrCode(qrUrl)
  }, [summaryUrl])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-muted">
          <h2 className="text-2xl font-serif text-burgundy">Summary Access</h2>
          <button
            onClick={onClose}
            className="text-sepia hover:text-burgundy text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            {qrCode && (
              <img
                src={qrCode || "/placeholder.svg"}
                alt="Summary QR Code"
                className="w-64 h-64 border-2 border-sepia rounded-lg p-2 bg-parchment"
              />
            )}
          </div>

          {/* URL Display */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-2">Direct Link:</p>
            <p className="text-sm font-mono text-foreground break-all">{summaryUrl}</p>
          </div>

          {/* Copy URL Button */}
          <Button
            onClick={() => {
              navigator.clipboard.writeText(summaryUrl)
              alert('Link copied to clipboard!')
            }}
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
          >
            Copy Link
          </Button>

          {/* Open Summary Button */}
          <Button
            onClick={() => {
              window.open(`/summary/${token}?host=true`, '_blank')
            }}
            className="w-full bg-gold text-ink hover:bg-gold/90 font-serif"
          >
            Open Summary (Host Mode)
          </Button>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-sepia text-parchment hover:bg-sepia/90 font-serif"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
