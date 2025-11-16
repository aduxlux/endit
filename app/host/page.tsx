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

  // Load data from localStorage on mount (using session ID)
  useEffect(() => {
    if (!sessionId) return
    
    const savedTeams = localStorage.getItem(`teams-${sessionId}`) || localStorage.getItem('host-teams')
    const savedStudents = localStorage.getItem(`students-${sessionId}`) || localStorage.getItem('host-students')
    const savedLevel = localStorage.getItem('host-current-level')
    
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents))
    }
    if (savedLevel) {
      setCurrentLevel(savedLevel)
    }
  }, [sessionId])

  // Save current level to localStorage
  useEffect(() => {
    localStorage.setItem('host-current-level', currentLevel)
  }, [currentLevel])

  // Save teams and students to localStorage (with session ID)
  useEffect(() => {
    if (!sessionId) return
    localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teams))
    localStorage.setItem('host-teams', JSON.stringify(teams)) // Also save to old key for compatibility
  }, [teams, sessionId])

  useEffect(() => {
    if (!sessionId) return
    localStorage.setItem(`students-${sessionId}`, JSON.stringify(students))
    localStorage.setItem('host-students', JSON.stringify(students)) // Also save to old key for compatibility
  }, [students, sessionId])

  // Listen for new student answers from student page (using session ID)
  useEffect(() => {
    if (!sessionId) return
    
    const handleStorageChange = () => {
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
    handleStorageChange()

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange)
    
    // Poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
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
            students={students}
            onStudentsUpdate={setStudents}
          />
        </div>

        {/* Bottom panels */}
        <div className="flex flex-col gap-6">
          <StudentListPanel
            students={students}
            teams={teams}
            onStudentUpdate={setStudents}
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
        <button
          onClick={() => setShowSessionInfo(true)}
          className="fixed bottom-6 right-6 bg-burgundy hover:bg-burgundy/90 text-parchment px-4 py-2 rounded-lg shadow-lg font-serif text-sm z-50"
          title="Share session link with students"
        >
          📱 Share Session
        </button>
      )}

      {/* Session Info Modal */}
      {showSessionInfo && sessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-sepia rounded-lg p-8 max-w-md w-full shadow-lg">
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
                <p className="text-sm font-mono text-foreground break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/student?session=${sessionId}` : ''}
                </p>
              </div>

              <button
                onClick={() => {
                  const studentUrl = typeof window !== 'undefined' ? `${window.location.origin}/student?session=${sessionId}` : ''
                  navigator.clipboard.writeText(studentUrl)
                  alert('Link copied to clipboard!')
                }}
                className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment px-4 py-2 rounded-lg font-serif"
              >
                Copy Student Link
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
