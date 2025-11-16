'use client'

import { useState, useEffect } from 'react'
import HostLayout from '@/components/host/host-layout'
import LevelControlPanel from '@/components/host/level-control-panel'
import TeamsPanel from '@/components/host/teams-panel'
import StudentListPanel from '@/components/host/student-list-panel'
import QuestionsAnswersPanel from '@/components/host/questions-answers-panel'
import ControlButtons from '@/components/host/control-buttons'
import PinEntry from '@/components/host/pin-entry'
import QRCodeModal from '@/components/host/qr-code-modal'

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
}

interface Question {
  id: string
  text: string
  level: string
  answers: Array<{ studentId: string; text: string; rating?: number }>
}

export default function HostPage() {
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [currentLevel, setCurrentLevel] = useState('medium')
  const [isRunning, setIsRunning] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: 'Quelle est la nature de la bonne vie?', level: 'easy', answers: [] },
    { id: '2', text: 'Comment la vertu se rapporte-t-elle au bonheur?', level: 'medium', answers: [] },
    { id: '3', text: 'Le bonheur peut-il être atteint par des moyens externes?', level: 'hard', answers: [] },
  ])
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

  // Load data from API first, then localStorage fallback (using session ID)
  useEffect(() => {
    if (!sessionId) return
    
    // Try to load from API first (for cross-device sync)
    const loadFromAPI = async () => {
      let loadedFromAPI = false
      
      try {
        // Load teams from API
        const teamsResponse = await fetch(`/api/teams/${sessionId}`)
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json()
          if (Array.isArray(teamsData.teams) && teamsData.teams.length > 0) {
            setTeams(teamsData.teams)
            // Also save to localStorage for offline access
            localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teamsData.teams))
            localStorage.setItem('host-teams', JSON.stringify(teamsData.teams))
            loadedFromAPI = true
          }
        }
        
        // Load students from API
        const studentsResponse = await fetch(`/api/students/${sessionId}`)
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          if (Array.isArray(studentsData.students) && studentsData.students.length > 0) {
            // Ensure status is one of the valid values
            const validStudents: Student[] = studentsData.students.map((s: any) => ({
              ...s,
              status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
                ? s.status 
                : 'pending' as 'pending' | 'answered' | 'submitted'
            }))
            setStudents(validStudents)
            // Also save to localStorage for offline access
            localStorage.setItem(`students-${sessionId}`, JSON.stringify(validStudents))
            localStorage.setItem('host-students', JSON.stringify(validStudents))
          }
        }
      } catch (error) {
        console.warn('Failed to load from API, using localStorage:', error)
      }
      
      // Fallback to localStorage if API didn't have data or failed
      if (!loadedFromAPI) {
        const savedTeams = localStorage.getItem(`teams-${sessionId}`) || localStorage.getItem('host-teams')
        if (savedTeams) {
          try {
            setTeams(JSON.parse(savedTeams))
          } catch (e) {
            console.error('Failed to parse saved teams:', e)
          }
        }
      }
      
      const savedStudents = localStorage.getItem(`students-${sessionId}`) || localStorage.getItem('host-students')
      if (savedStudents) {
        try {
          setStudents(JSON.parse(savedStudents))
        } catch (e) {
          console.error('Failed to parse saved students:', e)
        }
      }
      
      const savedLevel = localStorage.getItem('host-current-level')
      if (savedLevel) {
        setCurrentLevel(savedLevel)
      }
      
      // Load settings from API
      try {
        const settingsResponse = await fetch(`/api/settings/${sessionId}`)
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.currentLevel) {
            setCurrentLevel(settingsData.currentLevel)
            localStorage.setItem('host-current-level', settingsData.currentLevel)
          }
          if (settingsData.isRunning !== undefined) {
            setIsRunning(settingsData.isRunning)
          }
        }
      } catch (settingsError) {
        console.warn('Failed to load settings from API:', settingsError)
      }
    }
    
    loadFromAPI()
  }, [sessionId])

  // Save current level to API and localStorage
  useEffect(() => {
    if (!sessionId) return
    
    localStorage.setItem('host-current-level', currentLevel)
    
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
      // Save to localStorage for immediate local access
      localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teams))
      localStorage.setItem('host-teams', JSON.stringify(teams)) // Also save to old key for compatibility
      
      // Save to API for cross-device sync
      fetch(`/api/teams/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teams }),
      }).catch(error => {
        console.warn('Failed to save teams to API:', error)
        // Continue anyway - localStorage is saved
      })
      
      // Trigger storage event for cross-device sync (same browser)
      window.dispatchEvent(new StorageEvent('storage', {
        key: `teams-${sessionId}`,
        newValue: JSON.stringify(teams)
      }))
    } catch (error) {
      console.error('Error saving teams:', error)
    }
  }, [teams, sessionId])

  useEffect(() => {
    if (!sessionId) return
    try {
      // Save to localStorage for immediate local access
      localStorage.setItem(`students-${sessionId}`, JSON.stringify(students))
      localStorage.setItem('host-students', JSON.stringify(students)) // Also save to old key for compatibility
      
      // Save to API for cross-device sync
      fetch(`/api/students/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students }),
      }).catch(error => {
        console.warn('Failed to save students to API:', error)
        // Continue anyway - localStorage is saved
      })
      
      // Trigger storage event for cross-device sync (same browser)
      window.dispatchEvent(new StorageEvent('storage', {
        key: `students-${sessionId}`,
        newValue: JSON.stringify(students)
      }))
    } catch (error) {
      console.error('Error saving students:', error)
    }
  }, [students, sessionId])

  // Listen for new student answers from API and localStorage (using session ID)
  useEffect(() => {
    if (!sessionId) return
    
    const loadAnswers = async () => {
      // Try to load from API first
      try {
        const response = await fetch(`/api/answers/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.answers) && data.answers.length > 0) {
            // Update students with new answers from API
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
                      response: answer.text
                    })
                  }
                }
              })
              return updated
            })
            return // Successfully loaded from API
          }
        }
      } catch (apiError) {
        console.warn('Failed to load answers from API:', apiError)
      }
      
      // Fallback to localStorage
      const studentAnswers = localStorage.getItem(`answers-${sessionId}`) || localStorage.getItem('student-answers')
      if (studentAnswers) {
        const answers = JSON.parse(studentAnswers)
        // Update students with new answers
        setStudents(prev => {
          const updated = [...prev]
          answers.forEach((answer: { studentId: string; studentName: string; teamId: string; text: string }) => {
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
                  response: answer.text
                })
              }
            }
          })
          return updated
        })
      }
    }

    // Check on mount
    loadAnswers()

    // Poll for changes every 2 seconds
    const interval = setInterval(loadAnswers, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [teams, sessionId])

  // Reset all data to empty state
  const handleReset = () => {
    setCurrentLevel('medium')
    setIsRunning(false)
    setTeams([])
    setStudents([])
    setQuestions([
      { id: '1', text: 'Quelle est la nature de la bonne vie?', level: 'easy', answers: [] },
      { id: '2', text: 'Comment la vertu se rapporte-t-elle au bonheur?', level: 'medium', answers: [] },
      { id: '3', text: 'Le bonheur peut-il être atteint par des moyens externes?', level: 'hard', answers: [] },
    ])
    setShowAnswers(true)
    setSelectedTeam(null)
    setSummaryToken('lqisr-summary-' + Math.random().toString(36).substr(2, 9))
    localStorage.removeItem('host-teams')
    localStorage.removeItem('host-students')
    localStorage.removeItem('student-answers')
    localStorage.removeItem('host-current-level')
    localStorage.removeItem('student-team-assignment')
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
          />
          <QuestionsAnswersPanel
            questions={questions}
            students={students}
            showAnswers={showAnswers}
            selectedTeam={selectedTeam}
          />
        </div>
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
