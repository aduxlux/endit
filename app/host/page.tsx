'use client'

import { useState, useEffect } from 'react'
import HostLayout from '@/components/host/host-layout'
import LevelControlPanel from '@/components/host/level-control-panel'
import TeamsPanel from '@/components/host/teams-panel'
import StudentListPanel from '@/components/host/student-list-panel'
import QuestionsAnswersPanel from '@/components/host/questions-answers-panel'
import QuestionsManagementPanel from '@/components/host/questions-management-panel'
import ControlButtons from '@/components/host/control-buttons'
import PinEntry from '@/components/host/pin-entry'
import QRCodeModal from '@/components/host/qr-code-modal'
import { supabase } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  emblem: string
  color: string
}

interface Student {
  id: string
  name: string
  team: string
  status: 'pending' | 'answered' | 'submitted'
  response: string
  lastSeen?: number
  isOnline?: boolean
}

import type { Question } from '@/components/host/questions-answers-panel'

export default function HostPage() {
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [currentLevel, setCurrentLevel] = useState('medium')
  const [isRunning, setIsRunning] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [showAnswers, setShowAnswers] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [summaryToken, setSummaryToken] = useState('lqisr-summary-' + Math.random().toString(36).substr(2, 9))
  const [showSessionInfo, setShowSessionInfo] = useState(false)

  // Get session ID from URL or create one
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Get or create session ID
    const urlParams = new URLSearchParams(window.location.search)
    let sid = urlParams.get('session')
    
    if (!sid) {
      sid = localStorage.getItem('host-session-id') || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('host-session-id', sid)
      // Update URL without reload
      const newUrl = `${window.location.pathname}?session=${sid}`
      window.history.replaceState({}, '', newUrl)
    }
    
    setSessionId(sid)
  }, [])

  // Load data from localStorage first (immediate), then sync with API
  useEffect(() => {
    if (!sessionId) return
    
    // Load from localStorage immediately for fast display
    const savedTeams = localStorage.getItem(`teams-${sessionId}`) || localStorage.getItem('host-teams')
    if (savedTeams) {
      try {
        const parsed = JSON.parse(savedTeams)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeams(parsed)
        }
      } catch (e) {
        console.error('Failed to parse saved teams:', e)
      }
    }
    
    const savedStudents = localStorage.getItem(`students-${sessionId}`) || localStorage.getItem('host-students')
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validStudents: Student[] = parsed.map((s: any) => ({
            ...s,
            status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
              ? s.status 
              : 'pending' as 'pending' | 'answered' | 'submitted',
            lastSeen: s.lastSeen || Date.now(),
            isOnline: s.lastSeen ? (Date.now() - s.lastSeen) < 30000 : false
          }))
          setStudents(validStudents)
        }
      } catch (e) {
        console.error('Failed to parse saved students:', e)
      }
    }
    
    const savedLevel = localStorage.getItem(`host-current-level-${sessionId}`) || localStorage.getItem('host-current-level')
    if (savedLevel) {
      setCurrentLevel(savedLevel)
    }
    
    const savedRunning = localStorage.getItem(`host-is-running-${sessionId}`)
    if (savedRunning !== null) {
      setIsRunning(savedRunning === 'true')
    }
    
    // Then sync with API in background
    const syncWithAPI = async () => {
      try {
        // Load teams from API
        const teamsResponse = await fetch(`/api/teams/${sessionId}`)
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json()
          if (Array.isArray(teamsData.teams) && teamsData.teams.length > 0) {
            setTeams(teamsData.teams)
            localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teamsData.teams))
            localStorage.setItem('host-teams', JSON.stringify(teamsData.teams))
          }
        }
        
        // Load students from API
        const studentsResponse = await fetch(`/api/students/${sessionId}`)
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          if (Array.isArray(studentsData.students) && studentsData.students.length > 0) {
            const validStudents: Student[] = studentsData.students.map((s: any) => ({
              ...s,
              status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
                ? s.status 
                : 'pending' as 'pending' | 'answered' | 'submitted',
              lastSeen: s.lastSeen || Date.now(),
              isOnline: s.lastSeen ? (Date.now() - s.lastSeen) < 30000 : false
            }))
            setStudents(validStudents)
            localStorage.setItem(`students-${sessionId}`, JSON.stringify(validStudents))
            localStorage.setItem('host-students', JSON.stringify(validStudents))
          }
      }
      
      // Load settings from API
        const settingsResponse = await fetch(`/api/settings/${sessionId}`)
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.currentLevel) {
            setCurrentLevel(settingsData.currentLevel)
            localStorage.setItem(`host-current-level-${sessionId}`, settingsData.currentLevel)
            localStorage.setItem('host-current-level', settingsData.currentLevel)
          }
          if (settingsData.isRunning !== undefined) {
            setIsRunning(settingsData.isRunning)
            localStorage.setItem(`host-is-running-${sessionId}`, String(settingsData.isRunning))
          }
        }
      } catch (error) {
        console.warn('Failed to sync with API:', error)
      }
    }
    
    syncWithAPI()
  }, [sessionId])

  // Save current level to API and localStorage
  useEffect(() => {
    if (!sessionId) return
    
    localStorage.setItem(`host-current-level-${sessionId}`, currentLevel)
    localStorage.setItem('host-current-level', currentLevel)
    localStorage.setItem(`host-is-running-${sessionId}`, String(isRunning))
    
    // Save to API
    fetch(`/api/settings/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentLevel,
        isRunning
      }),
    }).catch(error => {
      console.warn('Failed to save settings to API:', error)
    })
  }, [currentLevel, isRunning, sessionId])

  // Save teams to API and localStorage (with session ID)
  useEffect(() => {
    if (!sessionId) return
    
    try {
      // Save to localStorage immediately
      localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teams))
      localStorage.setItem('host-teams', JSON.stringify(teams))
      
      // Save to API for cross-device sync (debounced)
      const timeoutId = setTimeout(() => {
        fetch(`/api/teams/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ teams }),
        }).catch(error => {
          console.warn('Failed to save teams to API:', error)
        })
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error saving teams:', error)
    }
  }, [teams, sessionId])

  useEffect(() => {
    if (!sessionId) return
    
    try {
      // Update lastSeen for all students
      const updatedStudents = students.map(s => ({
        ...s,
        lastSeen: s.lastSeen || Date.now()
      }))
      
      // Save to localStorage immediately
      localStorage.setItem(`students-${sessionId}`, JSON.stringify(updatedStudents))
      localStorage.setItem('host-students', JSON.stringify(updatedStudents))
      
      // Save to API for cross-device sync (debounced)
      const timeoutId = setTimeout(() => {
        fetch(`/api/students/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ students: updatedStudents }),
        }).catch(error => {
          console.warn('Failed to save students to API:', error)
        })
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error saving students:', error)
    }
  }, [students, sessionId])

  // Real-time subscriptions for instant updates (teams, students, answers)
  useEffect(() => {
    if (!sessionId) return

    // Subscribe to teams changes
    const teamsChannel = supabase
      .channel(`host-teams-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Reload teams from API
          try {
            const response = await fetch(`/api/teams/${sessionId}`)
            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data.teams)) {
                setTeams(data.teams)
                localStorage.setItem(`teams-${sessionId}`, JSON.stringify(data.teams))
                localStorage.setItem('host-teams', JSON.stringify(data.teams))
              }
            }
          } catch (error) {
            console.warn('Failed to reload teams:', error)
          }
        }
      )
      .subscribe()

    // Subscribe to students/users changes
    const studentsChannel = supabase
      .channel(`host-students-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Reload students from API
          try {
            const response = await fetch(`/api/students/${sessionId}`)
            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data.students)) {
                const validStudents: Student[] = data.students.map((s: any) => ({
                  ...s,
                  status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
                    ? s.status 
                    : 'pending' as 'pending' | 'answered' | 'submitted',
                  lastSeen: s.lastSeen ? new Date(s.lastSeen).getTime() : Date.now(),
                  isOnline: s.lastSeen ? (Date.now() - new Date(s.lastSeen).getTime()) < 30000 : false
                }))
                setStudents(validStudents)
                localStorage.setItem(`students-${sessionId}`, JSON.stringify(validStudents))
                localStorage.setItem('host-students', JSON.stringify(validStudents))
              }
            }
          } catch (error) {
            console.warn('Failed to reload students:', error)
          }
        }
      )
      .subscribe()

    // Subscribe to answers changes
    const answersChannel = supabase
      .channel(`host-answers-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Reload answers and update students
          try {
            const response = await fetch(`/api/answers/${sessionId}`)
            if (response.ok) {
              const data = await response.json()
              if (Array.isArray(data.answers) && data.answers.length > 0) {
                // Update students with new answers
                setStudents(prev => {
                  const updated = [...prev]
                  data.answers.forEach((answer: { studentId: string; studentName: string; teamId: string; text: string }) => {
                    const studentIndex = updated.findIndex(s => s.id === answer.studentId)
                    if (studentIndex >= 0) {
                      updated[studentIndex] = {
                        ...updated[studentIndex],
                        response: answer.text,
                        status: 'answered'
                      }
                    } else {
                      // Add new student if they don't exist
                      const team = teams.find(t => t.id === answer.teamId)
                      if (team) {
                        updated.push({
                          id: answer.studentId,
                          name: answer.studentName,
                          team: answer.teamId,
                          status: 'answered',
                          response: answer.text,
                          lastSeen: Date.now(),
                          isOnline: true
                        })
                      }
                    }
                  })
                  return updated
                })
              }
            }
          } catch (error) {
            console.warn('Failed to reload answers:', error)
          }
        }
      )
      .subscribe()

    // Also poll for answers as fallback (in case real-time doesn't work)
    const loadAnswers = async () => {
      try {
        const response = await fetch(`/api/answers/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.answers) && data.answers.length > 0) {
            setStudents(prev => {
              const updated = [...prev]
              data.answers.forEach((answer: { studentId: string; studentName: string; teamId: string; text: string }) => {
                const studentIndex = updated.findIndex(s => s.id === answer.studentId)
                if (studentIndex >= 0) {
                  updated[studentIndex] = {
                    ...updated[studentIndex],
                    response: answer.text,
                    status: 'answered'
                  }
                } else {
                  const team = teams.find(t => t.id === answer.teamId)
                  if (team) {
                    updated.push({
                      id: answer.studentId,
                      name: answer.studentName,
                      team: answer.teamId,
                      status: 'answered',
                      response: answer.text,
                      lastSeen: Date.now(),
                      isOnline: true
                    })
                  }
                }
              })
              return updated
            })
          }
        }
      } catch (apiError) {
        console.warn('Failed to load answers from API:', apiError)
      }
    }

    // Initial load
    loadAnswers()
    // Poll every 3 seconds as fallback
    const pollInterval = setInterval(loadAnswers, 3000)

    return () => {
      supabase.removeChannel(teamsChannel)
      supabase.removeChannel(studentsChannel)
      supabase.removeChannel(answersChannel)
      clearInterval(pollInterval)
    }
  }, [sessionId, teams])

  // Reset all data to empty state
  const handleReset = () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données? Cela supprimera toutes les équipes, étudiants et questions.')) {
      return
    }
    
    setCurrentLevel('medium')
    setIsRunning(false)
    setTeams([])
    setStudents([])
    setQuestions([])
    setShowAnswers(true)
    setSelectedTeam(null)
    setSummaryToken('lqisr-summary-' + Math.random().toString(36).substr(2, 9))
    
    // Clear localStorage for this session
    if (sessionId) {
      localStorage.removeItem(`teams-${sessionId}`)
      localStorage.removeItem(`students-${sessionId}`)
      localStorage.removeItem(`host-current-level-${sessionId}`)
      localStorage.removeItem(`host-is-running-${sessionId}`)
    }
    localStorage.removeItem('host-teams')
    localStorage.removeItem('host-students')
    localStorage.removeItem('student-answers')
    localStorage.removeItem('host-current-level')
    localStorage.removeItem('student-team-assignment')
    
    // Clear API data
    if (sessionId) {
      fetch(`/api/teams/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: [] }),
      }).catch(err => console.warn('Failed to clear teams:', err))
      
      fetch(`/api/students/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: [] }),
      }).catch(err => console.warn('Failed to clear students:', err))
    }
  }

  // Hotkey handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        setCurrentLevel(prev => {
          const levels = ['easy', 'medium', 'hard']
          const currentIdx = levels.indexOf(prev)
          return levels[(currentIdx + 1) % levels.length]
        })
      }
      if (e.key === 'p' || e.key === 'P') {
        setCurrentLevel(prev => {
          const levels = ['easy', 'medium', 'hard']
          const currentIdx = levels.indexOf(prev)
          return levels[(currentIdx - 1 + levels.length) % levels.length]
        })
      }
      if (e.code === 'Space') {
        e.preventDefault()
        setIsRunning(!isRunning)
      }
      if (e.key === 's' || e.key === 'S') {
        setIsRunning(!isRunning)
      }
      if (e.key === 'a' || e.key === 'A') {
        setShowAnswers(!showAnswers)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRunning, showAnswers])

  if (!isPinVerified) {
    return <PinEntry onPinVerified={() => setIsPinVerified(true)} />
  }

  return (
    <HostLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Top panels */}
        <div className="flex flex-col gap-6">
          <LevelControlPanel
            currentLevel={currentLevel}
            onLevelChange={setCurrentLevel}
            isRunning={isRunning}
            onRunToggle={setIsRunning}
            sessionId={sessionId}
          />
          <TeamsPanel 
            teams={teams} 
            selectedTeam={selectedTeam} 
            onSelectTeam={setSelectedTeam}
            onTeamsUpdate={setTeams}
            students={students as any}
            onStudentsUpdate={(updatedStudents) => setStudents(updatedStudents as Student[])}
          />
        </div>

        {/* Bottom panels */}
        <div className="flex flex-col gap-6">
          <StudentListPanel
            students={students}
            teams={teams}
            onStudentUpdate={(updatedStudents) => setStudents(updatedStudents)}
            onTeamsUpdate={setTeams}
            sessionId={sessionId}
          />
          <QuestionsAnswersPanel
            questions={questions}
            students={students}
            showAnswers={showAnswers}
            selectedTeam={selectedTeam}
            sessionId={sessionId}
          />
        </div>
      </div>

      {/* Questions Management Panel - Full Width */}
      <div className="mt-6" data-questions-panel>
        <QuestionsManagementPanel
          sessionId={sessionId}
          questions={questions}
          onQuestionsUpdate={setQuestions}
        />
      </div>

      {/* Control buttons */}
      <ControlButtons
        showAnswers={showAnswers}
        onToggleAnswers={setShowAnswers}
        isRunning={isRunning}
        currentLevel={currentLevel}
        summaryToken={summaryToken}
        onReset={handleReset}
      />

      {/* Session Info Button */}
      {sessionId && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          <button
            onClick={() => setShowSessionInfo(true)}
            className="bg-burgundy hover:bg-burgundy/90 text-parchment px-4 py-2 rounded-lg shadow-lg font-serif text-sm"
            title="Share session link with students"
          >
            📱 Share Session
          </button>
          <div className="bg-card border border-sepia rounded px-2 py-1 text-xs font-mono text-muted-foreground">
            Session: {sessionId.substring(0, 12)}...
          </div>
        </div>
      )}

      {/* Session Info Modal */}
      {showSessionInfo && sessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-sepia rounded-lg p-8 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-muted">
              <h2 className="text-2xl font-serif text-burgundy">Share Session</h2>
              <button
                onClick={() => setShowSessionInfo(false)}
                className="text-sepia hover:text-burgundy text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-serif text-foreground">
                Share this link with students so they can join your session:
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-2">Student Link:</p>
                <p className="text-sm font-mono text-foreground break-all bg-background p-2 rounded">
                  {typeof window !== 'undefined' ? `${window.location.origin}/student?session=${sessionId}` : ''}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs font-serif text-sepia uppercase tracking-wide mb-2">Session ID:</p>
                <p className="text-sm font-mono text-foreground break-all bg-background p-2 rounded">
                  {sessionId}
                </p>
              </div>

              <button
                onClick={() => {
                  const studentUrl = typeof window !== 'undefined' ? `${window.location.origin}/student?session=${sessionId}` : ''
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(studentUrl).then(() => {
                      alert('Link copied to clipboard!')
                    }).catch(() => {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea')
                      textArea.value = studentUrl
                      document.body.appendChild(textArea)
                      textArea.select()
                      document.execCommand('copy')
                      document.body.removeChild(textArea)
                      alert('Link copied to clipboard!')
                    })
                  } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea')
                    textArea.value = studentUrl
                    document.body.appendChild(textArea)
                    textArea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textArea)
                    alert('Link copied to clipboard!')
                  }
                }}
                className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment px-4 py-2 rounded-lg font-serif"
              >
                Copy Student Link
              </button>

              <button
                onClick={() => {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(sessionId).then(() => {
                      alert('Session ID copied!')
                    })
                  } else {
                    const textArea = document.createElement('textarea')
                    textArea.value = sessionId
                    document.body.appendChild(textArea)
                    textArea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textArea)
                    alert('Session ID copied!')
                  }
                }}
                className="w-full bg-gold hover:bg-gold/90 text-ink px-4 py-2 rounded-lg font-serif"
              >
                Copy Session ID
              </button>

              <button
                onClick={() => setShowSessionInfo(false)}
                className="w-full bg-sepia text-parchment hover:bg-sepia/90 px-4 py-2 rounded-lg font-serif"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </HostLayout>
  )
}
