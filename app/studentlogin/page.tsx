'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TeamSelection from '@/components/student/team-selection'
import UsernameEntry from '@/components/student/username-entry'

type LoginFlow = 'team' | 'username'

export default function StudentLoginPage() {
  const router = useRouter()
  const [flow, setFlow] = useState<LoginFlow>('team')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Get session ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const sid = urlParams.get('session') || localStorage.getItem('host-session-id')
    
    if (sid) {
      setSessionId(sid)
    }

    // Check if student already has team and name
    const assignment = localStorage.getItem('student-team-assignment')
    if (assignment) {
      try {
        const data = JSON.parse(assignment)
        // Check if assignment matches current session
        const currentSessionId = urlParams.get('session') || localStorage.getItem('host-session-id')
        if (data.sessionId === currentSessionId || !data.sessionId) {
          if (data.teamId && data.name) {
            // Student already logged in, redirect to student page
            router.push(`/student?session=${currentSessionId || sid || ''}`)
            return
          } else if (data.teamId) {
            // Has team but no name - go to username entry
            setSelectedTeam(data.teamId)
            setFlow('username')
            return
          }
        }
      } catch (e) {
        console.error('Error parsing assignment:', e)
      }
    }
  }, [router])

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
    setFlow('username')
  }

  const handleUsernameSubmit = (name: string) => {
    // Get session ID
    const urlParams = new URLSearchParams(window.location.search)
    const sid = urlParams.get('session') || localStorage.getItem('host-session-id') || 'default-session'
    
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
    
    // Save student's team assignment to localStorage
    localStorage.setItem('student-team-assignment', JSON.stringify({
      studentId,
      name,
      teamId: selectedTeam,
      sessionId: sid,
      timestamp: Date.now()
    }))
    
    // Add to host's student list
    let hostStudents = []
    if (sid) {
      const sessionStudents = localStorage.getItem(`students-${sid}`)
      if (sessionStudents) {
        hostStudents = JSON.parse(sessionStudents)
      }
    }
    if (hostStudents.length === 0) {
      hostStudents = JSON.parse(localStorage.getItem('host-students') || '[]')
    }
    
    // Get teams
    let teams = []
    if (sid) {
      const sessionTeams = localStorage.getItem(`teams-${sid}`)
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
      if (sid) {
        localStorage.setItem(`students-${sid}`, JSON.stringify(hostStudents))
      }
      localStorage.setItem('host-students', JSON.stringify(hostStudents))
      
      // Save to API
      fetch(`/api/students/${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: hostStudents }),
      }).catch(err => console.warn('Failed to save student to API:', err))
    }
    
    // Redirect to student page
    router.push(`/student?session=${sid}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-parchment via-card to-muted">
      {flow === 'team' && <TeamSelection onSelect={handleTeamSelect} />}
      {flow === 'username' && <UsernameEntry onSubmit={handleUsernameSubmit} team={selectedTeam} />}
    </div>
  )
}

