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

  // Load teams from localStorage (set by host) - using session ID
  useEffect(() => {
    const loadTeams = () => {
      try {
        // Get session ID from URL first
        const urlParams = new URLSearchParams(window.location.search)
        let sessionId = urlParams.get('session')
        
        // If no session in URL, try to get from localStorage
        if (!sessionId) {
          sessionId = localStorage.getItem('host-session-id')
        }
        
        // Try multiple storage keys to find teams
        let savedTeams = null
        
        if (sessionId) {
          // Try session-specific key first
          savedTeams = localStorage.getItem(`teams-${sessionId}`)
        }
        
        // Fallback to old keys
        if (!savedTeams) {
          savedTeams = localStorage.getItem('host-teams')
        }
        
        // Also try any teams-* keys (for compatibility)
        if (!savedTeams && typeof Storage !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('teams-')) {
              savedTeams = localStorage.getItem(key)
              if (savedTeams) {
                try {
                  const parsed = JSON.parse(savedTeams)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    break
                  }
                } catch {
                  savedTeams = null
                }
              }
            }
          }
        }
        
        if (savedTeams) {
          try {
            const parsed = JSON.parse(savedTeams)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTeams(parsed)
            }
          } catch (error) {
            console.warn('Failed to parse teams:', error)
          }
        }
      } catch (error) {
        console.error('Error loading teams:', error)
      }
    }
    
    // Load immediately
    loadTeams()
    
    // Poll for team updates more frequently
    const interval = setInterval(loadTeams, 500) // Check every 500ms
    
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (teamId: string) => {
    // Check if student already has a team assigned
    const studentTeamData = localStorage.getItem('student-team-assignment')
    if (studentTeamData) {
      try {
        const data = JSON.parse(studentTeamData)
        // Get session ID
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id')
        
        // Check host's student list (try session-specific first)
        let hostStudents = []
        if (sessionId) {
          const sessionStudents = localStorage.getItem(`students-${sessionId}`)
          if (sessionStudents) {
            hostStudents = JSON.parse(sessionStudents)
          }
        }
        if (hostStudents.length === 0) {
          hostStudents = JSON.parse(localStorage.getItem('host-students') || '[]')
        }
        
        const existingStudent = hostStudents.find((s: any) => s.id === data.studentId)
        
        if (existingStudent && existingStudent.team) {
          // Student already has a team - they cannot change it themselves
          alert('You are already assigned to a team. Only the host can change your team assignment.')
          return
        }
      } catch (error) {
        console.error('Error checking team assignment:', error)
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
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground text-sm font-serif italic">
                No teams available. Please wait for the host to create teams.
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {typeof window !== 'undefined' && (
                  <>
                    Session: {new URLSearchParams(window.location.search).get('session') || 'none'}
                    <br />
                    Checking for teams...
                  </>
                )}
              </div>
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
