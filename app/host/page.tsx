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
import { sessionManager } from '@/lib/session-manager'

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

  // Get session ID from URL or create one (using new session manager)
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Initialize session using the new session manager
    const urlParams = new URLSearchParams(window.location.search)
    const urlSessionId = urlParams.get('session')
    
    const session = sessionManager.initSession(urlSessionId || undefined)
    setSessionId(session.id)
    
    // Load initial data from session
    setTeams(session.teams || [])
    setStudents((session.students || []).map((s: any) => ({
      ...s,
      status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
        ? s.status 
        : 'pending' as 'pending' | 'answered' | 'submitted',
      lastSeen: s.lastSeen || Date.now(),
      isOnline: s.lastSeen ? (Date.now() - s.lastSeen) < 30000 : false
    })))
    setQuestions(session.questions || [])
    setCurrentLevel(session.settings?.currentLevel || 'medium')
    setIsRunning(session.settings?.isRunning || false)
    
    // Update URL if needed
    if (!urlSessionId) {
      const newUrl = `${window.location.pathname}?session=${session.id}`
      window.history.replaceState({}, '', newUrl)
    }
    
    // Load from API in background (non-blocking)
    if (urlSessionId) {
      sessionManager.loadFromAPI(urlSessionId).then(apiSession => {
        if (apiSession) {
          setTeams(apiSession.teams || [])
          setStudents((apiSession.students || []).map((s: any) => ({
            ...s,
            status: (s.status === 'pending' || s.status === 'answered' || s.status === 'submitted') 
              ? s.status 
              : 'pending' as 'pending' | 'answered' | 'submitted',
            lastSeen: s.lastSeen || Date.now(),
            isOnline: s.lastSeen ? (Date.now() - s.lastSeen) < 30000 : false
          })))
          setQuestions(apiSession.questions || [])
        }
      })
    }
  }, [])

  // Session data is now managed by sessionManager - loads instantly from memory/localStorage

  // Save settings using session manager (fast, unified)
  useEffect(() => {
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
      
      // Load settings from API (but don't override if user just changed it)
      const settingsResponse = await fetch(`/api/settings/${sessionId}`)
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData.currentLevel) {
          // Only update if it's different and we haven't manually set it
          const savedLevel = localStorage.getItem(`host-current-level-${sessionId}`) || localStorage.getItem('host-current-level')
          if (!savedLevel || savedLevel !== settingsData.currentLevel) {
            setCurrentLevel(settingsData.currentLevel)
            localStorage.setItem(`host-current-level-${sessionId}`, settingsData.currentLevel)
            localStorage.setItem('host-current-level', settingsData.currentLevel)
          }
        }
        if (settingsData.isRunning !== undefined) {
          // Only update if it's different and we haven't manually set it
          const savedRunning = localStorage.getItem(`host-is-running-${sessionId}`)
          if (savedRunning === null || savedRunning !== String(settingsData.isRunning)) {
            setIsRunning(settingsData.isRunning)
            localStorage.setItem(`host-is-running-${sessionId}`, String(settingsData.isRunning))
          }
        }
      }
      } catch (error) {
        console.warn('Failed to sync with API:', error)
      }
    }
    
  // Save settings using session manager (fast, unified)
  useEffect(() => {
    if (!sessionId) return
    sessionManager.updateSettings({ currentLevel, isRunning })
  }, [currentLevel, isRunning, sessionId])

  // Save teams using session manager (fast, unified)
  useEffect(() => {
    if (!sessionId) return
    sessionManager.updateTeams(teams)
  }, [teams, sessionId])

  // Save students using session manager (fast, unified)
  useEffect(() => {
    if (!sessionId) return
    const updatedStudents = students.map(s => ({
      ...s,
      lastSeen: s.lastSeen || Date.now()
    }))
    sessionManager.updateStudents(updatedStudents)
  }, [students, sessionId])

  // Real-time subscriptions for instant updates (teams, students, answers)
  useEffect(() => {
    if (!sessionId) return

    // Only set up real-time if Supabase is configured
    let teamsChannel: any = null
    let studentsChannel: any = null
    let answersChannel: any = null

    if (supabase) {
      try {
        // Subscribe to teams changes
        teamsChannel = supabase
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
        studentsChannel = supabase
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
        answersChannel = supabase
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
      } catch (error) {
        console.warn('Failed to set up real-time subscriptions:', error)
      }
    }

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
      if (supabase && teamsChannel) {
        try {
          supabase.removeChannel(teamsChannel)
        } catch (e) {
          console.warn('Failed to remove teams channel:', e)
        }
      }
      if (supabase && studentsChannel) {
        try {
          supabase.removeChannel(studentsChannel)
        } catch (e) {
          console.warn('Failed to remove students channel:', e)
        }
      }
      if (supabase && answersChannel) {
        try {
          supabase.removeChannel(answersChannel)
        } catch (e) {
          console.warn('Failed to remove answers channel:', e)
        }
      }
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
      // Don't handle hotkeys if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.closest('input') || target.closest('textarea') || target.closest('[contenteditable="true"]'))
      ) {
        return
      }

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

    </HostLayout>
  )
}
