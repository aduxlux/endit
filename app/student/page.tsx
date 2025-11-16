'use client'

import { useState, useEffect } from 'react'
import TeamSelection from '@/components/student/team-selection'
import UsernameEntry from '@/components/student/username-entry'
import QuestionView from '@/components/student/question-view'
import AnswerEditor from '@/components/student/answer-editor'
import SubmissionConfirmation from '@/components/student/submission-confirmation'
import SessionEntry from '@/components/student/session-entry'

type StudentFlow = 'session' | 'team' | 'username' | 'question' | 'answer' | 'confirmation'

export default function StudentPage() {
  const [flow, setFlow] = useState<StudentFlow>('session')
  const [hasSession, setHasSession] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [currentQuestion, setCurrentQuestion] = useState<{ id: string; text: string; level: string } | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')

  // Check for session ID on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sid = urlParams.get('session') || localStorage.getItem('host-session-id')
    
    if (sid) {
      setSessionId(sid)
      setHasSession(true)
      setFlow('team')
    } else {
      // Check if there are any teams available (for backward compatibility)
      const hasTeams = localStorage.getItem('host-teams') || 
        Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
          .some(key => key && key.startsWith('teams-') && localStorage.getItem(key))
      
      if (hasTeams) {
        const sid = localStorage.getItem('host-session-id') || 'default-session'
        setSessionId(sid)
        setHasSession(true)
        setFlow('team')
      }
    }
  }, [])

  // Check if student already has a team assigned (by host)
  useEffect(() => {
    if (!hasSession) return
    
    const checkTeamAssignment = () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id')
        
        const studentTeamData = localStorage.getItem('student-team-assignment')
        if (studentTeamData) {
          const data = JSON.parse(studentTeamData)
          // Always check host's student list for current team (host can change it)
          // Try session-specific first, then fallback
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
            // Student already has a team assigned, skip team selection
            setSelectedTeam(existingStudent.team)
            setUsername(existingStudent.name)
            setFlow('question')
          }
        }
      } catch (error) {
        console.error('Error checking team assignment:', error)
      }
    }
    
    checkTeamAssignment()
    // Poll for team changes from host
    const interval = setInterval(checkTeamAssignment, 1000)
    return () => clearInterval(interval)
  }, [hasSession])

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setFlow('username')
  }

  const handleUsernameSubmit = (name: string) => {
    setUsername(name)
    
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id') || 'default-session'
    
    // Save student's team assignment to localStorage (they can only join once)
    const studentId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('student-team-assignment', JSON.stringify({
      studentId,
      name,
      teamId: selectedTeam,
      timestamp: Date.now()
    }))
    
    // Also add to host's student list (using session ID)
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
    
    // Get teams (using session ID)
    let teams = []
    if (sessionId) {
      const sessionTeams = localStorage.getItem(`teams-${sessionId}`)
      if (sessionTeams) {
        teams = JSON.parse(sessionTeams)
      }
    }
    if (teams.length === 0) {
      teams = JSON.parse(localStorage.getItem('host-teams') || '[]')
    }
    
    const team = teams.find((t: any) => t.id === selectedTeam)
    
    if (team) {
      // Check if student with same name already exists
      const existingIndex = hostStudents.findIndex((s: any) => s.name === name && s.team === selectedTeam)
      if (existingIndex < 0) {
        hostStudents.push({
          id: studentId,
          name,
          team: selectedTeam,
          status: 'pending',
          response: ''
        })
        
        // Save to both session-specific and old key
        if (sessionId) {
          localStorage.setItem(`students-${sessionId}`, JSON.stringify(hostStudents))
        }
        localStorage.setItem('host-students', JSON.stringify(hostStudents))
      }
    }
    
    setFlow('question')
  }

  const handleAnswerSubmit = async (answer: string) => {
    setCurrentAnswer(answer)
    
    if (!currentQuestion) {
      console.error('No current question to submit answer to')
      return
    }
    
    // Get student ID from team assignment
    const studentTeamData = localStorage.getItem('student-team-assignment')
    let studentId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    if (studentTeamData) {
      const data = JSON.parse(studentTeamData)
      studentId = data.studentId
    }
    
    const answerData = {
      id: `answer-${Date.now()}`,
      studentId,
      studentName: username,
      teamId: selectedTeam,
      text: answer,
      timestamp: new Date().toISOString()
    }
    
    // Save to API (database)
    try {
      await fetch(`/api/answers/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          studentName: username,
          teamId: selectedTeam,
          text: answer,
          questionId: currentQuestion.id
        }),
      }).catch(error => {
        console.warn('Failed to save answer to API:', error)
      })
    } catch (error) {
      console.warn('Error saving answer to API:', error)
    }
    
    // Also save to localStorage as backup
    const existingAnswers = JSON.parse(localStorage.getItem(`answers-${sessionId}`) || localStorage.getItem('student-answers') || '[]')
    existingAnswers.push(answerData)
    localStorage.setItem(`answers-${sessionId}`, JSON.stringify(existingAnswers))
    localStorage.setItem('student-answers', JSON.stringify(existingAnswers)) // Also save to old key
    
    // Also update the host's student list (using session ID) - save to API
    const hostStudents = JSON.parse(localStorage.getItem(`students-${sessionId}`) || localStorage.getItem('host-students') || '[]')
    const team = JSON.parse(localStorage.getItem(`teams-${sessionId}`) || localStorage.getItem('host-teams') || '[]').find((t: any) => t.id === selectedTeam)
    
    if (team) {
      const existingStudentIndex = hostStudents.findIndex((s: any) => s.id === studentId)
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
      
      // Save students to API
      try {
        await fetch(`/api/students/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ students: hostStudents }),
        }).catch(error => {
          console.warn('Failed to save students to API:', error)
        })
      } catch (error) {
        console.warn('Error saving students to API:', error)
      }
      
      // Also save to localStorage
      localStorage.setItem(`students-${sessionId}`, JSON.stringify(hostStudents))
      localStorage.setItem('host-students', JSON.stringify(hostStudents)) // Also save to old key
    }
    
    setFlow('confirmation')
  }

  const handleReset = () => {
    setFlow('team')
    setSelectedTeam('')
    setUsername('')
    setCurrentQuestion(null)
    setCurrentAnswer('')
  }

  const handleSessionEntered = (sessionId: string) => {
    setHasSession(true)
    setFlow('team')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {flow === 'session' && <SessionEntry onSessionEntered={handleSessionEntered} />}
      {flow === 'team' && <TeamSelection onSelect={handleTeamSelect} />}
      {flow === 'username' && <UsernameEntry onSubmit={handleUsernameSubmit} team={selectedTeam} />}
      {flow === 'question' && (
        <QuestionView 
          username={username} 
          team={selectedTeam}
          sessionId={sessionId}
          onAnswer={(question) => {
            setCurrentQuestion(question)
            setFlow('answer')
          }} 
        />
      )}
      {flow === 'answer' && (
        <AnswerEditor onSubmit={handleAnswerSubmit} question={currentQuestion?.text || 'Aucune question disponible'} />
      )}
      {flow === 'confirmation' && (
        <SubmissionConfirmation answer={currentAnswer} onReset={handleReset} />
      )}
    </div>
  )
}
