'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Team {
  id: string
  name: string
  emblem: string
  color: string
}

interface TeamsPanelProps {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamId: string | null) => void
}

export default function TeamsPanel({ teams, selectedTeam, onSelectTeam }: TeamsPanelProps) {
  const [isAddingTeam, setIsAddingTeam] = useState(false)

  return (
    <div className="bg-card border-2 border-sepia rounded-lg p-6 shadow-lg animate-page-turn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-burgundy">Teams & Groups</h2>
        <Button
          onClick={() => setIsAddingTeam(!isAddingTeam)}
          className="text-xs bg-gold text-ink hover:bg-gold/90 font-serif"
        >
          {isAddingTeam ? 'Done' : '+ Add Team'}
        </Button>
      </div>

      <div className="space-y-2">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelectTeam(selectedTeam === team.id ? null : team.id)}
            className={`w-full p-3 rounded-md border-2 transition-all flex items-center gap-3 ${
              selectedTeam === team.id
                ? 'border-burgundy bg-burgundy bg-opacity-10'
                : 'border-muted hover:border-sepia'
            }`}
          >
            <span className="text-2xl">{team.emblem}</span>
            <div className="flex-1 text-left">
              <p className="font-serif text-sm text-burgundy font-semibold">{team.name}</p>
              <p className="text-xs text-muted-foreground">3 members active</p>
            </div>
            {selectedTeam === team.id && (
              <span className="animate-wax-seal-drop">✓</span>
            )}
          </button>
        ))}
      </div>

      {isAddingTeam && (
        <div className="mt-4 p-3 bg-background rounded-md border border-muted">
          <input
            type="text"
            placeholder="New team name..."
            className="w-full px-2 py-1 text-sm border border-muted rounded bg-card focus:outline-none focus:border-burgundy"
          />
        </div>
      )}
    </div>
  )
}
