'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

interface LevelControlPanelProps {
  currentLevel: string
  onLevelChange: (level: string) => void
  isRunning: boolean
  onRunToggle: (running: boolean) => void
  sessionId: string
}

const LEVELS = [
  { id: 'easy', name: 'Facile', label: 'Facile', icon: '◇', color: 'green' },
  { id: 'medium', name: 'Moyen', label: 'Moyen', icon: '◆', color: 'yellow' },
  { id: 'hard', name: 'Difficile', label: 'Difficile', icon: '⬢', color: 'red' },
]

const LEVEL_COLORS = {
  easy: 'bg-green-100 border-green-500 text-green-800',
  medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  hard: 'bg-red-100 border-red-500 text-red-800',
}

export default function LevelControlPanel({
  currentLevel,
  onLevelChange,
  isRunning,
  onRunToggle,
  sessionId,
}: LevelControlPanelProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleLevelChange = (newLevel: string) => {
    if (newLevel === currentLevel) return
    
    setIsChanging(true)
    onLevelChange(newLevel)
    
    // Save to API immediately
    if (sessionId) {
      fetch(`/api/settings/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLevel: newLevel,
          isRunning
        }),
      }).catch(error => {
        console.warn('Failed to save level change:', error)
      })
    }
    
    setTimeout(() => setIsChanging(false), 600)
  }

  const handleNextLevel = () => {
    const currentIndex = LEVELS.findIndex(l => l.id === currentLevel)
    const nextIndex = (currentIndex + 1) % LEVELS.length
    handleLevelChange(LEVELS[nextIndex].id)
  }

  const handlePrevLevel = () => {
    const currentIndex = LEVELS.findIndex(l => l.id === currentLevel)
    const prevIndex = (currentIndex - 1 + LEVELS.length) % LEVELS.length
    handleLevelChange(LEVELS[prevIndex].id)
  }

  const handleToggle = () => {
    const newRunning = !isRunning
    onRunToggle(newRunning)
    
    // Save to API immediately
    if (sessionId) {
      fetch(`/api/settings/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLevel,
          isRunning: newRunning
        }),
      }).catch(error => {
        console.warn('Failed to save running state:', error)
      })
    }
  }

  const currentLevelData = LEVELS.find(l => l.id === currentLevel) || LEVELS[1]

  return (
    <div className={`bg-card border-2 border-sepia rounded-lg p-6 shadow-lg transition-all duration-300 ${isChanging ? 'animate-page-turn' : ''}`}>
      <h2 className="text-2xl font-serif text-burgundy mb-4">Contrôle des Niveaux</h2>

      <div className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center gap-4 p-4 bg-background rounded-md border-2 border-muted">
          <div className={`w-4 h-10 rounded-full transition-all ${isRunning ? 'animate-candle-flicker bg-gold' : 'opacity-30 bg-sepia'}`} 
            style={{ 
              boxShadow: isRunning ? '0 0 10px rgba(201, 163, 74, 0.8)' : 'none'
            }}
          />
          <div className="flex-1">
            <p className="text-xs font-serif text-sepia uppercase tracking-wide">Statut de la Session</p>
            <p className={`text-lg font-serif font-semibold ${isRunning ? 'text-green-700' : 'text-muted-foreground'}`}>
              {isRunning ? '▶ En Cours' : '⏸ En Pause'}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            className={`${isRunning ? 'bg-burgundy hover:bg-burgundy/90' : 'bg-sepia hover:bg-sepia/90'} text-parchment font-serif flex items-center gap-2`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Démarrer
              </>
            )}
          </Button>
        </div>

        {/* Current level display */}
        <div className={`p-4 rounded-md border-2 ${LEVEL_COLORS[currentLevelData.color as keyof typeof LEVEL_COLORS]} transition-all`}>
          <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-1">Niveau Actuel</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentLevelData.icon}</span>
            <div>
              <p className="text-xl font-serif font-bold">{currentLevelData.label}</p>
              <p className="text-xs opacity-75">Les étudiants voient les questions de ce niveau</p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePrevLevel}
            variant="outline"
            className="flex-1 font-serif border-sepia hover:bg-sepia hover:text-parchment"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          <Button
            onClick={handleNextLevel}
            variant="outline"
            className="flex-1 font-serif border-sepia hover:bg-sepia hover:text-parchment"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Level buttons grid */}
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((level) => {
            const isActive = currentLevel === level.id
            return (
              <button
                key={level.id}
                onClick={() => handleLevelChange(level.id)}
                className={`p-3 rounded-md border-2 transition-all transform hover:scale-105 ${
                  isActive
                    ? `${LEVEL_COLORS[level.color as keyof typeof LEVEL_COLORS]} shadow-lg scale-105`
                    : 'border-muted hover:border-sepia bg-background'
                }`}
              >
                <span className="block text-2xl mb-1">{level.icon}</span>
                <span className="text-xs font-serif font-semibold">{level.label}</span>
              </button>
            )
          })}
        </div>

        {/* Info text */}
        <div className="text-center text-xs text-muted-foreground italic pt-2 border-t border-muted">
          Le changement de niveau déclenche une animation de tour de page pour tous les étudiants
        </div>
      </div>
    </div>
  )
}
