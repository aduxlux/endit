'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface QuestionViewProps {
  username: string
  team: string
  onAnswer: () => void
}

const MOCK_QUESTION = {
  id: '1',
  text: 'Quelle est la nature de la bonne vie, et comment se rapporte-t-elle à la vertu?',
  level: 'Medium',
  difficulty: 'Pensée profonde'
}

export default function QuestionView({ username, team, onAnswer }: QuestionViewProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (!isRevealed) return
    
    let index = 0
    const interval = setInterval(() => {
      if (index <= MOCK_QUESTION.text.length) {
        setDisplayedText(MOCK_QUESTION.text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isRevealed])

  return (
    <div className="w-full max-w-2xl animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <div className="mb-6 pb-4 border-b border-muted">
          <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-1">Scholar: {username}</p>
          <p className="text-xs font-serif text-sepia uppercase tracking-wide">Difficulty: {MOCK_QUESTION.difficulty}</p>
        </div>

        <div
          className="min-h-32 mb-6"
          onClick={() => !isRevealed && setIsRevealed(true)}
        >
          {!isRevealed ? (
            <div className="flex items-center justify-center h-32 cursor-pointer group">
              <div className="text-center">
                <p className="text-3xl mb-2 group-hover:animate-candle-flicker">✦</p>
                <p className="text-sepia font-serif italic">Reveal the question...</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-serif text-burgundy leading-relaxed">
                {displayedText}
                {displayedText.length < MOCK_QUESTION.text.length && (
                  <span className="animate-pulse">▌</span>
                )}
              </p>
            </div>
          )}
        </div>

        {isRevealed && displayedText.length === MOCK_QUESTION.text.length && (
          <Button
            onClick={onAnswer}
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif animate-fade-in"
          >
            Compose Your Answer
          </Button>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
