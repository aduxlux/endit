'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  text: string
  level: 'easy' | 'medium' | 'hard'
}

interface QuestionViewProps {
  username: string
  team: string
  sessionId: string
  onAnswer: (question: Question) => void
}

const LEVEL_LABELS = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile'
}

const LEVEL_COLORS = {
  easy: 'text-green-700',
  medium: 'text-yellow-700',
  hard: 'text-red-700'
}

export default function QuestionView({ username, team, sessionId, onAnswer }: QuestionViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentLevel, setCurrentLevel] = useState<string>('medium')
  const [isRunning, setIsRunning] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)
  const [pageTurnKey, setPageTurnKey] = useState(0)

  // Validate that student has team and username
  if (!username || !team) {
    return (
      <div className="w-full max-w-2xl animate-page-turn">
        <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg text-center">
          <p className="text-2xl font-serif text-burgundy mb-4">⚠️ Informations manquantes</p>
          <p className="text-sepia font-serif italic">
            Veuillez d'abord sélectionner une équipe et entrer votre nom.
          </p>
        </div>
      </div>
    )
  }

  // Load current level and questions from API
  useEffect(() => {
    if (!sessionId) return

    const loadLevelAndQuestions = async () => {
      try {
        // Load current level from settings
        const settingsResponse = await fetch(`/api/settings/${sessionId}`)
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.currentLevel) {
            const newLevel = settingsData.currentLevel
            if (newLevel !== currentLevel) {
              setCurrentLevel(newLevel)
              setPageTurnKey(prev => prev + 1) // Trigger page turn animation
              setIsRevealed(false)
              setDisplayedText('')
            }
            setIsRunning(settingsData.isRunning || false)
          }
        }

        // Load questions for current level
        const questionsResponse = await fetch(`/api/questions/${sessionId}`)
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json()
          if (Array.isArray(questionsData.questions)) {
            const levelQuestions = questionsData.questions.filter(
              (q: Question) => q.level === currentLevel
            )
            if (levelQuestions.length > 0) {
              // Show first question of current level
              setCurrentQuestion(levelQuestions[0])
            } else {
              setCurrentQuestion(null)
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load questions:', error)
      }
    }

    loadLevelAndQuestions()
    
    // Poll for updates every 2 seconds
    const interval = setInterval(loadLevelAndQuestions, 2000)
    return () => clearInterval(interval)
  }, [sessionId, currentLevel])

  useEffect(() => {
    if (!isRevealed || !currentQuestion) return
    
    let index = 0
    const interval = setInterval(() => {
      if (index <= currentQuestion.text.length) {
        setDisplayedText(currentQuestion.text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isRevealed, currentQuestion])

  if (!isRunning) {
    return (
      <div className="w-full max-w-2xl animate-page-turn">
        <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg text-center">
          <p className="text-2xl font-serif text-burgundy mb-4">⏸️ Session en pause</p>
          <p className="text-sepia font-serif italic">
            En attente que l'hôte démarre le niveau {LEVEL_LABELS[currentLevel as keyof typeof LEVEL_LABELS]}
          </p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl animate-page-turn">
        <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg text-center">
          <p className="text-2xl font-serif text-burgundy mb-4">📚 Aucune question disponible</p>
          <p className="text-sepia font-serif italic">
            L'hôte n'a pas encore créé de questions pour le niveau {LEVEL_LABELS[currentLevel as keyof typeof LEVEL_LABELS]}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl animate-page-turn" key={pageTurnKey}>
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <div className="mb-6 pb-4 border-b border-muted">
          <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-1">Étudiant: {username}</p>
          <p className={`text-xs font-serif uppercase tracking-wide ${LEVEL_COLORS[currentQuestion.level]}`}>
            Niveau: {LEVEL_LABELS[currentQuestion.level]}
          </p>
        </div>

        <div
          className="min-h-32 mb-6"
          onClick={() => !isRevealed && setIsRevealed(true)}
        >
          {!isRevealed ? (
            <div className="flex items-center justify-center h-32 cursor-pointer group">
              <div className="text-center">
                <p className="text-3xl mb-2 group-hover:animate-candle-flicker">✦</p>
                <p className="text-sepia font-serif italic">Révéler la question...</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-serif text-burgundy leading-relaxed">
                {displayedText}
                {displayedText.length < currentQuestion.text.length && (
                  <span className="animate-pulse">▌</span>
                )}
              </p>
            </div>
          )}
        </div>

        {isRevealed && displayedText.length === currentQuestion.text.length && (
          <Button
            onClick={() => onAnswer(currentQuestion)}
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif animate-fade-in"
          >
            Rédiger votre réponse
          </Button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  )
}
