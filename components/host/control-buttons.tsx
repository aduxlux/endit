'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import QRCodeModal from './qr-code-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ControlButtonsProps {
  showAnswers: boolean
  onToggleAnswers: (show: boolean) => void
  isRunning: boolean
  currentLevel: string
  summaryToken: string
  onReset: () => void
}

export default function ControlButtons({
  showAnswers,
  onToggleAnswers,
  isRunning,
  currentLevel,
  summaryToken,
  onReset,
}: ControlButtonsProps) {
  const router = useRouter()
  const [showQRModal, setShowQRModal] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

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

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-red-600 text-parchment hover:bg-red-700 font-serif"
            >
              Reset Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-burgundy">Reset All Data?</AlertDialogTitle>
              <AlertDialogDescription className="font-serif">
                This will reset all teams, students, questions, and session data to their initial state. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onReset()
                  setShowResetDialog(false)
                }}
                className="bg-red-600 hover:bg-red-700 font-serif"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
