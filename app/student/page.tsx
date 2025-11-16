'use client'

import { useState } from 'react'
import TeamSelection from '@/components/student/team-selection'
import UsernameEntry from '@/components/student/username-entry'
import QuestionView from '@/components/student/question-view'
import AnswerEditor from '@/components/student/answer-editor'
import SubmissionConfirmation from '@/components/student/submission-confirmation'

type StudentFlow = 'team' | 'username' | 'question' | 'answer' | 'confirmation'

export default function StudentPage() {
  const [flow, setFlow] = useState<StudentFlow>('team')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [currentAnswer, setCurrentAnswer] = useState<string>('')

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setFlow('username')
  }

  const handleUsernameSubmit = (name: string) => {
    setUsername(name)
    setFlow('question')
  }

  const handleAnswerSubmit = (answer: string) => {
    setCurrentAnswer(answer)
    
    // Save answer to localStorage for host to see
    const studentId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const answerData = {
      id: `answer-${Date.now()}`,
      studentId,
      studentName: username,
      teamId: selectedTeam,
      text: answer,
      timestamp: new Date().toISOString()
    }
    
    // Get existing answers
    const existingAnswers = JSON.parse(localStorage.getItem('student-answers') || '[]')
    existingAnswers.push(answerData)
    localStorage.setItem('student-answers', JSON.stringify(existingAnswers))
    
    // Also update the host's student list
    const hostStudents = JSON.parse(localStorage.getItem('host-students') || '[]')
    const team = JSON.parse(localStorage.getItem('host-teams') || '[]').find((t: any) => t.id === selectedTeam)
    
    if (team) {
      const existingStudentIndex = hostStudents.findIndex((s: any) => s.name === username && s.team === selectedTeam)
      if (existingStudentIndex >= 0) {
        hostStudents[existingStudentIndex] = {
          ...hostStudents[existingStudentIndex],
          response: answer,
          status: 'answered'
        }
      } else {
        hostStudents.push({
          id: studentId,
          name: username,
          team: selectedTeam,
          status: 'answered',
          response: answer
        })
      }
      localStorage.setItem('host-students', JSON.stringify(hostStudents))
    }
    
    setFlow('confirmation')
  }

  const handleReset = () => {
    setFlow('team')
    setSelectedTeam('')
    setUsername('')
    setCurrentQuestion('')
    setCurrentAnswer('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {flow === 'team' && <TeamSelection onSelect={handleTeamSelect} />}
      {flow === 'username' && <UsernameEntry onSubmit={handleUsernameSubmit} team={selectedTeam} />}
      {flow === 'question' && (
        <QuestionView username={username} team={selectedTeam} onAnswer={() => setFlow('answer')} />
      )}
      {flow === 'answer' && (
        <AnswerEditor onSubmit={handleAnswerSubmit} question={currentQuestion} />
      )}
      {flow === 'confirmation' && (
        <SubmissionConfirmation answer={currentAnswer} onReset={handleReset} />
      )}
    </div>
  )
}
