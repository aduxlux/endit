'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const TEAM_NAMES = {
  plato: 'The Platonists',
  aristotle: 'The Aristotelians',
  stoic: 'The Stoics',
  epicurean: 'The Epicureans',
}

interface UsernameEntryProps {
  onSubmit: (username: string) => void
  team: string
}

export default function UsernameEntry({ onSubmit, team }: UsernameEntryProps) {
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setIsSubmitting(true)
      setTimeout(() => onSubmit(username), 200)
    }
  }

  return (
    <div className="w-full max-w-md animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-serif text-burgundy text-center mb-2">Welcome, Scholar</h1>
        <p className="text-center text-sepia text-sm mb-6">
          {TEAM_NAMES[team as keyof typeof TEAM_NAMES]}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-serif text-sepia mb-2">Enter your name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your scholarly name..."
              className="w-full px-4 py-2 border border-muted rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={!username.trim() || isSubmitting}
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
          >
            {isSubmitting ? 'Entering...' : 'Begin Session'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Autosave enabled for your responses
        </p>
      </div>
    </div>
  )
}
