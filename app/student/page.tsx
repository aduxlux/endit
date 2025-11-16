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

  // Check for session ID and ensure proper flow (team -> username -> question)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sid = urlParams.get('session') || localStorage.getItem('host-session-id')
    
    if (sid) {
      setSessionId(sid)
      setHasSession(true)
      
      // Check if student already has a complete assignment (team + name)
      const assignment = localStorage.getItem('student-team-assignment')
      if (assignment) {
        try {
          const data = JSON.parse(assignment)
          if (data.sessionId === sid || !data.sessionId) {
            // Only restore if BOTH team and name are present
            if (data.teamId && data.name) {
              setSelectedTeam(data.teamId)
              setUsername(data.name)
              setFlow('question')
              return
            } else if (data.teamId) {
              // Has team but no name - go to username entry
              setSelectedTeam(data.teamId)
              setFlow('username')
              return
            }
            // No team - must select team first
          }
        } catch (e) {
          console.error('Error parsing assignment:', e)
        }
      }
      
      // Default: start with team selection
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
        
        // Check for existing assignment
        const assignment = localStorage.getItem('student-team-assignment')
        if (assignment) {
          try {
            const data = JSON.parse(assignment)
            // Only proceed if BOTH team and name exist
            if (data.teamId && data.name) {
              setSelectedTeam(data.teamId)
              setUsername(data.name)
              setFlow('question')
              return
            } else if (data.teamId) {
              setSelectedTeam(data.teamId)
              setFlow('username')
              return
            }
          } catch (e) {
            // Continue to team selection
          }
        }
        
        setFlow('team')
      } else {
        setFlow('session')
      }
    }
  }, [])

  // Continuously check if student has team and name - redirect if missing
  useEffect(() => {
    if (!hasSession) return
    
    const checkTeamAndName = () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id')
        
        const studentTeamData = localStorage.getItem('student-team-assignment')
        let hasTeam = false
        let hasName = false
        
        if (studentTeamData) {
          const data = JSON.parse(studentTeamData)
          hasTeam = !!data.teamId
          hasName = !!data.name
          
          if (hasTeam) {
            setSelectedTeam(data.teamId)
          }
          if (hasName) {
            setUsername(data.name)
          }
        }
        
        // Also check host's student list
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
        
        if (studentTeamData) {
          const assignmentData = JSON.parse(studentTeamData)
          const existingStudent = hostStudents.find((s: any) => s.id === assignmentData.studentId)
          
          if (existingStudent) {
            if (existingStudent.team) {
              hasTeam = true
              setSelectedTeam(existingStudent.team)
            }
            if (existingStudent.name) {
              hasName = true
              setUsername(existingStudent.name)
            }
          }
        }
        
        // If we're on question/answer/confirmation flow but missing team or name, redirect
        if ((flow === 'question' || flow === 'answer' || flow === 'confirmation')) {
          if (!hasTeam || !hasName) {
            if (!hasTeam) {
              setFlow('team')
            } else if (!hasName) {
              setFlow('username')
            }
            return
          }
        }
        
        // If we have both, allow proceeding to questions
        if (hasTeam && hasName && (flow === 'team' || flow === 'username')) {
          setFlow('question')
        } else if (hasTeam && !hasName && flow !== 'username' && flow !== 'question') {
          setFlow('username')
        } else if (!hasTeam && flow !== 'team') {
          setFlow('team')
        }
      } catch (error) {
        console.error('Error checking team and name:', error)
      }
    }
    
    checkTeamAndName()
    // Check continuously every 2 seconds
    const interval = setInterval(checkTeamAndName, 2000)
    return () => clearInterval(interval)
  }, [hasSession, flow, selectedTeam, username])

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setFlow('username')
  }

  const handleUsernameSubmit = (name: string) => {
    setUsername(name)
    
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session') || localStorage.getItem('host-session-id') || 'default-session'
    
    // Check if student already exists
    let studentId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const existingAssignment = localStorage.getItem('student-team-assignment')
    if (existingAssignment) {
      try {
        const data = JSON.parse(existingAssignment)
        if (data.studentId) {
          studentId = data.studentId
        }
      } catch (e) {
        // Use new ID
      }
    }
    
    // Save student's team assignment to localStorage (they can only join once)
    localStorage.setItem('student-team-assignment', JSON.stringify({
      studentId,
      name,
      teamId: selectedTeam,
      sessionId,
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
      // Check if student with same ID already exists
      const existingIndex = hostStudents.findIndex((s: any) => s.id === studentId)
      if (existingIndex >= 0) {
        // Update existing student
        hostStudents[existingIndex] = {
          ...hostStudents[existingIndex],
          name,
          team: selectedTeam,
          lastSeen: Date.now(),
          isOnline: true
        }
      } else {
        // Add new student
        hostStudents.push({
          id: studentId,
          name,
          team: selectedTeam,
          status: 'pending',
          response: '',
          lastSeen: Date.now(),
          isOnline: true
        })
      }
        
        // Save to both session-specific and old key
        if (sessionId) {
          localStorage.setItem(`students-${sessionId}`, JSON.stringify(hostStudents))
        }
        localStorage.setItem('host-students', JSON.stringify(hostStudents))
      
      // Save to API
      fetch(`/api/students/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: hostStudents }),
      }).catch(err => console.warn('Failed to save student to API:', err))
    }
    
    setFlow('question')
  }
  
  // Update lastSeen periodically to show as online
  useEffect(() => {
    if (!sessionId || !username) return
    
    const updateLastSeen = () => {
      const assignment = localStorage.getItem('student-team-assignment')
      if (!assignment) return
      
      try {
        const data = JSON.parse(assignment)
        if (data.studentId) {
          // Update student's lastSeen in host's list
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
          
          const studentIndex = hostStudents.findIndex((s: any) => s.id === data.studentId)
          if (studentIndex >= 0) {
            hostStudents[studentIndex] = {
              ...hostStudents[studentIndex],
              lastSeen: Date.now(),
              isOnline: true
            }
            
            if (sessionId) {
              localStorage.setItem(`students-${sessionId}`, JSON.stringify(hostStudents))
            }
            localStorage.setItem('host-students', JSON.stringify(hostStudents))
          }
        }
      } catch (e) {
        console.error('Error updating lastSeen:', e)
      }
    }
    
    updateLastSeen()
    const interval = setInterval(updateLastSeen, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [sessionId, username])

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
        (username && selectedTeam) ? (
        <QuestionView 
          username={username} 
          team={selectedTeam} 
            sessionId={sessionId}
            onAnswer={(question) => {
              setCurrentQuestion(question)
            setFlow('answer')
          }} 
        />
        ) : (
          <div className="w-full max-w-md animate-page-turn">
            <div className="bg-card border-2 border-sepia rounded-lg p-8 shadow-lg text-center">
              <p className="text-2xl font-serif text-burgundy mb-4">⚠️ Étape manquante</p>
              <p className="text-sepia font-serif italic mb-4">
                Vous devez d'abord sélectionner une équipe et entrer votre nom.
              </p>
              <button
                onClick={() => {
                  if (!selectedTeam) {
                    setFlow('team')
                  } else if (!username) {
                    setFlow('username')
                  }
                }}
                className="px-4 py-2 bg-burgundy text-parchment rounded font-serif hover:bg-burgundy/90"
              >
                Continuer
              </button>
            </div>
          </div>
        )
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
