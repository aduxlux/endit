'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import QRCodeModal from './qr-code-modal'

interface ControlButtonsProps {
  showAnswers: boolean
  onToggleAnswers: (show: boolean) => void
  isRunning: boolean
  currentLevel: string
  summaryToken: string
}

export default function ControlButtons({
  showAnswers,
  onToggleAnswers,
  isRunning,
  currentLevel,
  summaryToken,
}: ControlButtonsProps) {
  const router = useRouter()
  const [showQRModal, setShowQRModal] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 left-6 right-6 max-w-7xl mx-auto flex gap-3 flex-wrap justify-center">
        <Button
          onClick={() => onToggleAnswers(!showAnswers)}
          className={`${showAnswers ? 'bg-burgundy' : 'bg-sepia'} text-parchment font-serif`}
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </Button>

        <Button
          onClick={() => router.push('/answers')}
          className="bg-gold text-ink hover:bg-gold/90 font-serif"
        >
          Open Projector Display
        </Button>

        <Button
          onClick={() => setShowQRModal(true)}
          className="bg-sepia text-parchment hover:bg-sepia/90 font-serif"
        >
          Summary & QR Code
        </Button>

        <Button
          className="bg-muted text-sepia hover:bg-muted/80 font-serif"
        >
          Replay Mode
        </Button>
      </div>

      {showQRModal && (
        <QRCodeModal
          token={summaryToken}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </>
  )
}
