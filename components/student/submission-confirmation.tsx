'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface SubmissionConfirmationProps {
  answer: string
  onReset: () => void
}

export default function SubmissionConfirmation({
  answer,
  onReset,
}: SubmissionConfirmationProps) {
  const [showAchievement, setShowAchievement] = useState(false)
  const [quote, setQuote] = useState('')

  const PHILOSOPHICAL_QUOTES = [
    'Know thyself.',
    'The only true wisdom is in knowing you know nothing.',
    'Excellence is not an act, but a habit.',
    'We are what we repeatedly do.',
    'All we have to decide is what to do with the time that is given to us.',
  ]

  useEffect(() => {
    setShowAchievement(true)
    const randomQuote = PHILOSOPHICAL_QUOTES[Math.floor(Math.random() * PHILOSOPHICAL_QUOTES.length)]
    setQuote(randomQuote)
  }, [])

  return (
    <div className="w-full max-w-2xl animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg text-center">
        {/* Wax seal achievement */}
        {showAchievement && (
          <div className="mb-8 animate-wax-seal-drop">
            <svg
              className="w-20 h-20 mx-auto"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="currentColor" className="text-burgundy" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" className="text-gold" />
              <text x="50" y="55" textAnchor="middle" fontSize="28" fontFamily="serif" fill="currentColor" className="text-gold">
                ✓
              </text>
            </svg>
          </div>
        )}

        <h1 className="text-3xl font-serif text-burgundy mb-2">Response Submitted</h1>
        <p className="text-sepia font-serif italic mb-8">Your philosophical contribution has been recorded</p>

        <div className="bg-background rounded-md p-6 mb-8 border border-muted text-left">
          <p className="text-sm font-serif text-foreground leading-relaxed">{answer}</p>
        </div>

        {quote && (
          <div className="mb-8 py-4 border-t border-b border-muted">
            <p className="text-sepia italic font-serif">"{quote}"</p>
          </div>
        )}

        <Button
          onClick={onReset}
          className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif mb-4"
        >
          Submit Another Response
        </Button>

        <p className="text-muted-foreground text-xs">
          Awaiting additional questions from the host
        </p>
      </div>
    </div>
  )
}
