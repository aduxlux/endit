'use client'

import { supabase } from './supabase'
import { teamDb, userDb } from './database'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  try {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined'
    )
  } catch {
    return false
  }
}

// Get or create session ID
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'default-session'
  
  // Try to get from URL
  const urlParams = new URLSearchParams(window.location.search)
  let sessionId = urlParams.get('session')
  
  if (!sessionId) {
    // Try localStorage
    sessionId = localStorage.getItem('current-session-id')
    
    if (!sessionId) {
      // Create new session ID
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('current-session-id', sessionId)
    }
  } else {
    localStorage.setItem('current-session-id', sessionId)
  }
  
  return sessionId
}

// Teams sync
export const teamsSync = {
  async get(sessionId: string) {
    if (isSupabaseConfigured()) {
      try {
        const teams = await teamDb.getBySession(sessionId)
        return teams.map(t => ({
          id: t.id,
          name: t.name,
          emblem: t.emblem,
          color: t.color
        }))
      } catch (error) {
        console.warn('Supabase teams fetch failed, using localStorage', error)
      }
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(`teams-${sessionId}`)
    return stored ? JSON.parse(stored) : []
  },

  async save(sessionId: string, teams: any[]) {
    // Save to localStorage first for immediate update
    localStorage.setItem(`teams-${sessionId}`, JSON.stringify(teams))
    
    if (isSupabaseConfigured()) {
      try {
        // Get existing teams from DB
        const existing = await teamDb.getBySession(sessionId)
        const existingIds = new Set(existing.map(t => t.id))
        
        // Add new teams
        for (const team of teams) {
          if (!existingIds.has(team.id)) {
            await teamDb.create(sessionId, team.name, team.emblem, team.color)
          }
        }
        
        // Note: We don't delete teams from DB to preserve data
      } catch (error) {
        console.warn('Supabase teams save failed, using localStorage only', error)
      }
    }
  },

  async delete(sessionId: string, teamId: string) {
    // Remove from localStorage
    const teams = await this.get(sessionId)
    const updated = teams.filter(t => t.id !== teamId)
    await this.save(sessionId, updated)
  }
}

// Students sync
export const studentsSync = {
  async get(sessionId: string) {
    if (isSupabaseConfigured()) {
      try {
        const users = await userDb.getBySession(sessionId)
        return users.map(u => ({
          id: u.id,
          name: u.name,
          team: u.team_id || '',
          status: u.status as 'pending' | 'answered' | 'submitted',
          response: '' // Would need to fetch from answers table
        }))
      } catch (error) {
        console.warn('Supabase students fetch failed, using localStorage', error)
      }
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(`students-${sessionId}`)
    return stored ? JSON.parse(stored) : []
  },

  async save(sessionId: string, students: any[]) {
    // Save to localStorage first
    localStorage.setItem(`students-${sessionId}`, JSON.stringify(students))
    
    if (isSupabaseConfigured()) {
      try {
        // Update students in DB
        for (const student of students) {
          if (student.id && student.id.startsWith('student-')) {
            // This is a new student, create in DB
            if (student.team) {
              await userDb.create(sessionId, student.team, student.name)
            }
          }
        }
      } catch (error) {
        console.warn('Supabase students save failed, using localStorage only', error)
      }
    }
  },

  async update(sessionId: string, studentId: string, updates: any) {
    const students = await this.get(sessionId)
    const updated = students.map(s => 
      s.id === studentId ? { ...s, ...updates } : s
    )
    await this.save(sessionId, updated)
  }
}

// Answers sync
export const answersSync = {
  async get(sessionId: string) {
    const stored = localStorage.getItem(`answers-${sessionId}`)
    return stored ? JSON.parse(stored) : []
  },

  async save(sessionId: string, answers: any[]) {
    localStorage.setItem(`answers-${sessionId}`, JSON.stringify(answers))
  },

  async add(sessionId: string, answer: any) {
    const answers = await this.get(sessionId)
    answers.push(answer)
    await this.save(sessionId, answers)
  }
}

// Real-time subscription helper
export const subscribeToSession = (
  sessionId: string,
  onTeamsUpdate: (teams: any[]) => void,
  onStudentsUpdate: (students: any[]) => void
) => {
  if (!isSupabaseConfigured()) {
    // Fallback: poll localStorage changes
    const interval = setInterval(async () => {
      const teams = await teamsSync.get(sessionId)
      const students = await studentsSync.get(sessionId)
      onTeamsUpdate(teams)
      onStudentsUpdate(students)
    }, 2000) // Poll every 2 seconds
    
    return () => clearInterval(interval)
  }

  // Use Supabase real-time
  if (!supabase) {
    // Fallback: poll localStorage changes
    const interval = setInterval(async () => {
      const teams = await teamsSync.get(sessionId)
      const students = await studentsSync.get(sessionId)
      onTeamsUpdate(teams)
      onStudentsUpdate(students)
    }, 2000) // Poll every 2 seconds
    
    return () => clearInterval(interval)
  }

  let teamsChannel: any = null
  let studentsChannel: any = null

  try {
    teamsChannel = supabase
      .channel(`teams:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          const teams = await teamsSync.get(sessionId)
          onTeamsUpdate(teams)
        }
      )
      .subscribe()

    studentsChannel = supabase
      .channel(`students:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          const students = await studentsSync.get(sessionId)
          onStudentsUpdate(students)
        }
      )
      .subscribe()
  } catch (error) {
    console.warn('Failed to set up real-time subscriptions:', error)
  }

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
  }
}

