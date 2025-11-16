'use client'

import { Button } from '@/components/ui/button'

interface PresenterControlsProps {
  currentIndex: number
  total: number
  showAllAnswers: boolean
  onShowAllToggle: (show: boolean) => void
  onNext: () => void
  onPrev: () => void
}

export default function PresenterControls({
  currentIndex,
  total,
  showAllAnswers,
  onShowAllToggle,
  onNext,
  onPrev,
}: PresenterControlsProps) {
  return (
    <div className="bg-card border-t-2 border-sepia p-4 flex items-center justify-center gap-4 flex-wrap">
      <Button
        onClick={onPrev}
        className="bg-sepia hover:bg-sepia/90 text-parchment font-serif"
      >
        ← Previous
      </Button>

      <div className="text-sm font-serif text-sepia">
        {showAllAnswers ? 'All Answers View' : `Answer ${currentIndex + 1} of ${total}`}
      </div>

      <Button
        onClick={onNext}
        disabled={showAllAnswers}
        className="bg-sepia hover:bg-sepia/90 text-parchment font-serif disabled:opacity-50"
      >
        Next →
      </Button>

      <div className="w-px h-6 bg-muted" />

      <Button
        onClick={() => onShowAllToggle(!showAllAnswers)}
        className={`${showAllAnswers ? 'bg-burgundy' : 'bg-gold'} text-${showAllAnswers ? 'parchment' : 'ink'} hover:opacity-90 font-serif`}
      >
        {showAllAnswers ? 'Single View' : 'Show All'}
      </Button>

      <Button
        className="bg-muted text-sepia hover:bg-muted/80 font-serif text-xs"
      >
        Export PDF
      </Button>
    </div>
  )
}
