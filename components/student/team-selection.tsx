'use client'

import { useState } from 'react'

const TEAMS = [
  { id: 'plato', name: 'The Platonists', emblem: '⬢' },
  { id: 'aristotle', name: 'The Aristotelians', emblem: '◆' },
  { id: 'stoic', name: 'The Stoics', emblem: '◇' },
  { id: 'epicurean', name: 'The Epicureans', emblem: '●' },
]

interface TeamSelectionProps {
  onSelect: (teamId: string) => void
}

export default function TeamSelection({ onSelect }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('')

  const handleSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setTimeout(() => onSelect(teamId), 300)
  }

  return (
    <div className="w-full max-w-md animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-serif text-burgundy text-center mb-2">Select Your Academy</h1>
        <p className="text-center text-sepia text-sm mb-8 italic">Choose your philosophical society</p>

        <div className="space-y-3">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSelect(team.id)}
              className={`w-full p-4 border-2 rounded-md transition-all duration-300 flex items-center gap-3 ${
                selectedTeam === team.id
                  ? 'border-burgundy bg-burgundy bg-opacity-10 text-burgundy'
                  : 'border-muted hover:border-sepia text-sepia hover:text-burgundy'
              }`}
            >
              <span className="text-2xl">{team.emblem}</span>
              <span className="font-serif text-lg">{team.name}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          You will join as a member of this philosophical society for this session
        </p>
      </div>
    </div>
  )
}
