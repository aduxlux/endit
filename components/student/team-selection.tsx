'use client'

import { useState, useEffect } from 'react'

interface Team {
  id: string
  name: string
  emblem: string
  color: string
}

interface TeamSelectionProps {
  onSelect: (teamId: string) => void
}

export default function TeamSelection({ onSelect }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])

  // Load teams from localStorage (set by host)
  useEffect(() => {
    const loadTeams = () => {
      const savedTeams = localStorage.getItem('host-teams')
      if (savedTeams) {
        setTeams(JSON.parse(savedTeams))
      }
    }
    loadTeams()
    // Poll for team updates
    const interval = setInterval(loadTeams, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (teamId: string) => {
    // Check if student already has a team assigned
    const studentTeamData = localStorage.getItem('student-team-assignment')
    if (studentTeamData) {
      const data = JSON.parse(studentTeamData)
      const hostStudents = JSON.parse(localStorage.getItem('host-students') || '[]')
      const existingStudent = hostStudents.find((s: any) => s.id === data.studentId)
      
      if (existingStudent && existingStudent.team) {
        // Student already has a team - they cannot change it themselves
        alert('You are already assigned to a team. Only the host can change your team assignment.')
        return
      }
    }
    
    setSelectedTeam(teamId)
    setTimeout(() => onSelect(teamId), 300)
  }

  return (
    <div className="w-full max-w-md animate-page-turn">
      <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-serif text-burgundy text-center mb-2">Select Your Academy</h1>
        <p className="text-center text-sepia text-sm mb-8 italic">Choose your philosophical society</p>

        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm font-serif italic">
              No teams available. Please wait for the host to create teams.
            </div>
          ) : (
            teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleSelect(team.id)}
                className={`w-full p-4 border-2 rounded-md transition-all duration-300 flex items-center gap-3 ${
                  selectedTeam === team.id
                    ? 'border-burgundy bg-burgundy bg-opacity-10 text-burgundy'
                    : 'border-muted hover:border-sepia text-sepia hover:text-burgundy'
                }`}
                style={{
                  borderColor: selectedTeam === team.id ? team.color : undefined
                }}
              >
                <span className="text-2xl">{team.emblem}</span>
                <span className="font-serif text-lg">{team.name}</span>
              </button>
            ))
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          You will join as a member of this philosophical society for this session
        </p>
      </div>
    </div>
  )
}
