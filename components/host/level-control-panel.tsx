'use client'

import { Button } from '@/components/ui/button'

interface LevelControlPanelProps {
  currentLevel: string
  onLevelChange: (level: string) => void
  isRunning: boolean
  onRunToggle: (running: boolean) => void
}

const LEVELS = [
  { id: 'easy', name: 'Easy', icon: '◇' },
  { id: 'medium', name: 'Medium', icon: '◆' },
  { id: 'hard', name: 'Hard', icon: '⬢' },
]

export default function LevelControlPanel({
  currentLevel,
  onLevelChange,
  isRunning,
  onRunToggle,
}: LevelControlPanelProps) {
  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <h2 className="text-2xl font-serif text-burgundy mb-4">Level Control</h2>

      <div className="space-y-4">
        {/* Candle timer visual */}
        <div className="flex items-center gap-4 p-4 bg-background rounded-md border border-muted">
          <div className={`w-3 h-8 rounded-full ${isRunning ? 'animate-candle-flicker' : 'opacity-50'}`} 
            style={{ backgroundColor: 'rgba(201, 163, 74, 0.6)' }}
          />
          <div className="flex-1">
            <p className="text-sm font-serif text-sepia">Session Status</p>
            <p className="text-lg font-serif text-burgundy">{isRunning ? 'In Progress' : 'Paused'}</p>
          </div>
          <Button
            onClick={() => onRunToggle(!isRunning)}
            className={`${isRunning ? 'bg-burgundy' : 'bg-sepia'} text-parchment font-serif`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
        </div>

        {/* Level buttons */}
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              className={`p-3 rounded-md border-2 transition-all ${
                currentLevel === level.id
                  ? 'border-burgundy bg-burgundy bg-opacity-10 text-burgundy font-semibold'
                  : 'border-muted hover:border-sepia text-sepia'
              }`}
            >
              <span className="block text-2xl mb-1">{level.icon}</span>
              <span className="text-sm font-serif">{level.name}</span>
            </button>
          ))}
        </div>

        {/* Page turn animation indicator */}
        <div className="text-center text-xs text-muted-foreground italic">
          Level change triggers page-turn animation for all students
        </div>
      </div>
    </div>
  )
}
