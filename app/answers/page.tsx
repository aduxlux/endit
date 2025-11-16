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
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [highlightedAnswerId, setHighlightedAnswerId] = useState<string | null>(null)

  // Load answers from localStorage (using session ID)
  useEffect(() => {
    const loadAnswers = () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id')
        
        // Get answers (try session-specific first)
        let studentAnswers = []
        if (sessionId) {
          const sessionAnswers = localStorage.getItem(`answers-${sessionId}`)
          if (sessionAnswers) {
            studentAnswers = JSON.parse(sessionAnswers)
          }
        }
        if (studentAnswers.length === 0) {
          studentAnswers = JSON.parse(localStorage.getItem('student-answers') || '[]')
        }
        
        // Get teams (try session-specific first)
        let teams = []
        if (sessionId) {
          const sessionTeams = localStorage.getItem(`teams-${sessionId}`)
          if (sessionTeams) {
            teams = JSON.parse(sessionTeams)
          }
        }
        if (teams.length === 0) {
          teams = JSON.parse(localStorage.getItem('host-teams') || '[]')
        }
        
        const formattedAnswers: Answer[] = studentAnswers.map((answer: any) => {
          const team = teams.find((t: any) => t.id === answer.teamId)
          return {
            id: answer.id,
            studentId: answer.studentId,
            studentName: answer.studentName,
            teamId: answer.teamId,
            teamName: team?.name || 'Unknown Team',
            text: answer.text,
            rating: answer.rating,
            highlighted: answer.highlighted || false,
            timestamp: new Date(answer.timestamp || Date.now())
          }
        })
        
        setAnswers(formattedAnswers)
        if (formattedAnswers.length > 0 && currentIndex >= formattedAnswers.length) {
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error('Error loading answers:', error)
      }
    }
    
    loadAnswers()
    // Poll for new answers
    const interval = setInterval(loadAnswers, 1000)
    return () => clearInterval(interval)
  }, [currentIndex])

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
          {answers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground font-serif">
                <p className="text-2xl mb-2">No answers yet</p>
                <p className="text-sm">Waiting for students to submit their responses...</p>
              </div>
            </div>
          ) : showAllAnswers ? (
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
            {(() => {
              const teams = JSON.parse(localStorage.getItem('host-teams') || '[]')
              const team = teams.find((t: any) => t.id === answer.teamId)
              return team?.emblem || '○'
            })()}
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
