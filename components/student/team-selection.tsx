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

  // Load teams from API - works across devices
  useEffect(() => {
    const loadTeams = async () => {
      try {
        // Get session ID from URL first
        const urlParams = new URLSearchParams(window.location.search)
        let sessionId = urlParams.get('session')
        
        // If no session in URL, try to get from localStorage
        if (!sessionId) {
          sessionId = localStorage.getItem('host-session-id')
        }
        
        // Try to load teams from multiple sources
        let loadedTeams: Team[] = []
        
        // 1. Try API first (if we have session ID)
        if (sessionId) {
          try {
            const response = await fetch(`/api/teams/${sessionId}`)
            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data.teams) && data.teams.length > 0) {
                loadedTeams = data.teams
                setTeams(loadedTeams)
                return // Success, exit early
              }
            }
          } catch (fetchError) {
            console.warn('API fetch failed, trying localStorage:', fetchError)
          }
        }
        
        // 2. Try localStorage with session ID
        if (sessionId) {
          const stored = localStorage.getItem(`teams-${sessionId}`)
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed) && parsed.length > 0) {
                loadedTeams = parsed
                setTeams(loadedTeams)
                return // Success, exit early
              }
            } catch (e) {
              console.warn('Error parsing session teams:', e)
            }
          }
        }
        
        // 3. Try generic host-teams key (fallback for backward compatibility)
        const genericStored = localStorage.getItem('host-teams')
        if (genericStored) {
          try {
            const parsed = JSON.parse(genericStored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedTeams = parsed
              setTeams(loadedTeams)
              return // Success, exit early
            }
          } catch (e) {
            console.warn('Error parsing generic teams:', e)
          }
        }
        
        // 4. Try to find any teams-* key in localStorage
        if (loadedTeams.length === 0) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('teams-')) {
              try {
                const stored = localStorage.getItem(key)
                if (stored) {
                  const parsed = JSON.parse(stored)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    loadedTeams = parsed
                    setTeams(loadedTeams)
                    return // Success, exit early
                  }
                }
              } catch (e) {
                // Continue to next key
              }
            }
          }
        }
        
        // If we still have no teams, set empty array
        if (loadedTeams.length === 0) {
          setTeams([])
        }
      } catch (error) {
        console.error('Error loading teams:', error)
        setTeams([])
      }
    }
    
    // Load immediately
    loadTeams()
    
    // Poll for team updates every 1 second
    const interval = setInterval(loadTeams, 1000)
    
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
              <div className="text-muted-foreground text-sm font-serif italic mb-4">
                No teams available. Please wait for the host to create teams.
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                {typeof window !== 'undefined' && (
                  <>
                    <div className="font-mono p-2 bg-muted rounded">
                      Session: {new URLSearchParams(window.location.search).get('session') || 'none'}
                    </div>
                    <div className="text-xs italic">
                      Make sure you're using the session link shared by the host
                    </div>
                    <div className="animate-pulse text-gold">
                      Checking for teams...
                    </div>
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
