'use client'

import { useState, useEffect } from 'react'
import HostLayout from '@/components/host/host-layout'
import LevelControlPanel from '@/components/host/level-control-panel'
import TeamsPanel from '@/components/host/teams-panel'
import StudentListPanel from '@/components/host/student-list-panel'
import QuestionsAnswersPanel from '@/components/host/questions-answers-panel'
import ControlButtons from '@/components/host/control-buttons'
import PinEntry from '@/components/host/pin-entry'

export default function HostPage() {
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [currentLevel, setCurrentLevel] = useState('medium')
  const [isRunning, setIsRunning] = useState(false)
  const [teams, setTeams] = useState([
    { id: 'plato', name: 'The Platonists', emblem: '⬢', color: '#9d1f35' },
    { id: 'aristotle', name: 'The Aristotelians', emblem: '◆', color: '#7b5a40' },
    { id: 'stoic', name: 'The Stoics', emblem: '◇', color: '#c9a34a' },
    { id: 'epicurean', name: 'The Epicureans', emblem: '●', color: '#a67c52' },
  ])
  const [students, setStudents] = useState([
    { id: '1', name: 'Marcus', team: 'plato', status: 'pending', response: '' },
    { id: '2', name: 'Sophia', team: 'aristotle', status: 'answered', response: 'La bonne vie est...' },
    { id: '3', name: 'Helena', team: 'stoic', status: 'pending', response: '' },
  ])
  const [questions, setQuestions] = useState([
    { id: '1', text: 'Quelle est la nature de la bonne vie?', level: 'easy', answers: [] },
    { id: '2', text: 'Comment la vertu se rapporte-t-elle au bonheur?', level: 'medium', answers: [] },
    { id: '3', text: 'Le bonheur peut-il être atteint par des moyens externes?', level: 'hard', answers: [] },
  ])
  const [showAnswers, setShowAnswers] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [summaryToken] = useState('lqisr-summary-' + Math.random().toString(36).substr(2, 9))

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
          <TeamsPanel teams={teams} selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
        </div>

        {/* Bottom panels */}
        <div className="flex flex-col gap-6">
          <StudentListPanel
            students={students}
            teams={teams}
            onStudentUpdate={setStudents}
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
      />
    </HostLayout>
  )
}
