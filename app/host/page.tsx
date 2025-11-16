'use client'

import { useState, useEffect } from 'react'
import HostLayout from '@/components/host/host-layout'
import LevelControlPanel from '@/components/host/level-control-panel'
import TeamsPanel from '@/components/host/teams-panel'
import StudentListPanel from '@/components/host/student-list-panel'
import QuestionsAnswersPanel from '@/components/host/questions-answers-panel'
import ControlButtons from '@/components/host/control-buttons'
import PinEntry from '@/components/host/pin-entry'

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('host-teams')
    const savedStudents = localStorage.getItem('host-students')
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams))
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents))
    }
  }, [])

  // Save teams and students to localStorage
  useEffect(() => {
    localStorage.setItem('host-teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('host-students', JSON.stringify(students))
  }, [students])

  // Listen for new student answers from student page
  useEffect(() => {
    const handleStorageChange = () => {
      const studentAnswers = localStorage.getItem('student-answers')
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
  }, [teams])

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
    </HostLayout>
  )
}
