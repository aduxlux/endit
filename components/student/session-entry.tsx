'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SessionEntryProps {
  onSessionEntered: (sessionId: string) => void
}

export default function SessionEntry({ onSessionEntered }: SessionEntryProps) {
  const [sessionId, setSessionId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sessionId.trim()) {
      // Update URL with session ID
      const newUrl = `${window.location.pathname}?session=${sessionId.trim()}`
      window.history.pushState({}, '', newUrl)
      localStorage.setItem('host-session-id', sessionId.trim())
      onSessionEntered(sessionId.trim())
    }
  }

  return (
    <div className="w-full max-w-md animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-serif text-burgundy text-center mb-2">Enter Session</h1>
        <p className="text-center text-sepia text-sm mb-8 italic">Enter the session ID from your host</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif text-sepia uppercase tracking-wide mb-2">
              Session ID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID..."
              className="w-full px-4 py-3 border border-muted rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-gold font-mono"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!sessionId.trim()}
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment font-serif"
          >
            Join Session
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Ask your host for the session link or session ID
        </p>
      </div>
    </div>
  )
}

