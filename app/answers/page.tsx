'use client'

import { useState, useEffect } from 'react'
import AnswersLayout from '@/components/answers/answers-layout'
import AnswersGrid from '@/components/answers/answers-grid'
import PresenterControls from '@/components/answers/presenter-controls'

interface Answer {
  id: string
  studentId: string
  studentName: string
  teamId: string
  teamName: string
  text: string
  rating?: number
  highlighted?: boolean
  timestamp: Date
}

export default function AnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Marcus',
      teamId: 'plato',
      teamName: 'The Platonists',
      text: 'The good life is the pursuit of eternal forms and philosophical truth, achieving harmony between reason and soul.',
      rating: 5,
      highlighted: true,
      timestamp: new Date(),
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Sophia',
      teamId: 'aristotle',
      teamName: 'The Aristotelians',
      text: 'Virtue is a habit, developed through practice and wisdom. The good life involves the fulfillment of potential through excellence.',
      rating: 4,
      highlighted: false,
      timestamp: new Date(),
    },
    {
      id: '3',
      studentId: '3',
      studentName: 'Helena',
      teamId: 'stoic',
      teamName: 'The Stoics',
      text: 'The good life comes from virtue and acceptance of what we cannot control. Through reason and discipline, we achieve tranquility.',
      rating: 3,
      highlighted: false,
      timestamp: new Date(),
    },
    {
      id: '4',
      studentId: '4',
      studentName: 'Alexander',
      teamId: 'epicurean',
      teamName: 'The Epicureans',
      text: 'The good life is living modestly and seeking simple pleasures with friends. Freedom from fear and pain brings happiness.',
      rating: 4,
      highlighted: false,
      timestamp: new Date(),
    },
  ])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [highlightedAnswerId, setHighlightedAnswerId] = useState<string | null>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (showAllAnswers) {
          setShowAllAnswers(false)
        } else {
          setCurrentIndex((prev) => (prev + 1) % answers.length)
        }
      }
      if (e.key === 'Enter') {
        setShowAllAnswers(!showAllAnswers)
      }
      if (e.key === 'h' || e.key === 'H') {
        if (currentIndex < answers.length) {
          const answer = answers[currentIndex]
          setHighlightedAnswerId(highlightedAnswerId === answer.id ? null : answer.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, showAllAnswers, answers, highlightedAnswerId])

  return (
    <AnswersLayout>
      <div className="w-full h-screen flex flex-col">
        {/* Main answers display */}
        <div className="flex-1 overflow-auto">
          {showAllAnswers ? (
            <AnswersGrid answers={answers} highlightedAnswerId={highlightedAnswerId} />
          ) : (
            <SingleAnswerView
              answer={answers[currentIndex]}
              isHighlighted={highlightedAnswerId === answers[currentIndex]?.id}
              index={currentIndex}
              total={answers.length}
            />
          )}
        </div>

        {/* Presenter controls */}
        <PresenterControls
          currentIndex={currentIndex}
          total={answers.length}
          showAllAnswers={showAllAnswers}
          onShowAllToggle={setShowAllAnswers}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % answers.length)}
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + answers.length) % answers.length)}
        />
      </div>
    </AnswersLayout>
  )
}

function SingleAnswerView({
  answer,
  isHighlighted,
  index,
  total,
}: {
  answer: Answer
  isHighlighted: boolean
  index: number
  total: number
}) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8 bg-gradient-to-br from-parchment via-card to-muted">
      <div className="max-w-3xl w-full animate-page-turn">
        {/* Team indicator with emblem */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-sepia flex items-center justify-center text-3xl">
            {answer.teamId === 'plato' && '⬢'}
            {answer.teamId === 'aristotle' && '◆'}
            {answer.teamId === 'stoic' && '◇'}
            {answer.teamId === 'epicurean' && '●'}
          </div>
          <div>
            <p className="text-xs font-serif text-sepia uppercase tracking-wide">Team</p>
            <p className="text-3xl font-serif text-burgundy">{answer.teamName}</p>
          </div>
        </div>

        {/* Student name */}
        <p className="text-sm font-serif text-sepia mb-4 uppercase tracking-wide">Scholar: {answer.studentName}</p>

        {/* Main answer text with gold highlight */}
        <div
          className={`p-8 rounded-lg border-2 transition-all ${
            isHighlighted
              ? 'border-gold bg-yellow-50/30 shadow-lg'
              : 'border-sepia bg-background'
          }`}
        >
          <p className={`text-2xl font-serif leading-relaxed ${
            isHighlighted ? 'text-burgundy' : 'text-foreground'
          }`}>
            {answer.text}
          </p>
        </div>

        {/* Rating with wax seals */}
        {answer.rating && (
          <div className="flex items-center gap-2 mt-8">
            <p className="text-sm font-serif text-sepia mr-2">Host Rating:</p>
            {[...Array(answer.rating)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-gold text-xs font-serif animate-wax-seal-drop"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                ✦
              </div>
            ))}
          </div>
        )}

        {/* Page indicator */}
        <div className="mt-12 text-center text-muted-foreground text-sm font-serif">
          Response {index + 1} of {total}
        </div>
      </div>
    </div>
  )
}
