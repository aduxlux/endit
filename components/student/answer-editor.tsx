'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface AnswerEditorProps {
  question: string
  onSubmit: (answer: string) => void
}

export default function AnswerEditor({ question, onSubmit }: AnswerEditorProps) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inkDrops, setInkDrops] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [dropCounter, setDropCounter] = useState(0)

  useEffect(() => {
    // Autosave to localStorage
    const timer = setTimeout(() => {
      localStorage.setItem('draft-answer', answer)
    }, 1000)

    return () => clearTimeout(timer)
  }, [answer])

  useEffect(() => {
    // Load autosaved draft
    const draft = localStorage.getItem('draft-answer')
    if (draft) {
      setAnswer(draft)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim()) {
      setIsSubmitting(true)
      
      // Add ink drop animation
      const newDrop = {
        id: dropCounter,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }
      setInkDrops((prev) => [...prev, newDrop])
      setDropCounter((prev) => prev + 1)

      setTimeout(() => {
        onSubmit(answer)
      }, 600)
    }
  }

  return (
    <div className="w-full max-w-2xl animate-page-turn relative">
      {/* Ink drop effects */}
      {inkDrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute pointer-events-none animate-ink-drop"
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
          }}
        >
          <div className="w-4 h-4 bg-burgundy rounded-full opacity-30" />
        </div>
      ))}

      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-serif text-burgundy mb-6">Your Philosophical Response</h2>

        {question && (
          <div className="mb-6 p-4 bg-background rounded-md border border-muted">
            <p className="text-sm font-serif text-sepia mb-2">Question:</p>
            <p className="text-lg font-serif text-foreground italic">{question}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif text-sepia uppercase tracking-wide mb-3">
              Compose your answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Share your thoughts, insights, and philosophical reasoning..."
              className="w-full px-4 py-3 border border-muted rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold min-h-48 font-serif"
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              {answer.length} characters • Autosave enabled
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!answer.trim() || isSubmitting}
              className="flex-1 bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </div>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Your response will be sent to the host for evaluation
        </p>
      </div>
    </div>
  )
}
