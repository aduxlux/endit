import { NextRequest, NextResponse } from 'next/server'
import { teamDb, userDb } from '@/lib/database'

// In-memory store for sessions (fallback if database not available)
const sessionStore = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try in-memory store first (fastest)
    const cached = sessionStore.get(sessionId)
    if (cached) {
      return NextResponse.json(cached)
    }
    
    // Try database
    try {
      const teams = await teamDb.getBySession(sessionId)
      const students = await userDb.getBySession(sessionId)
      
      const sessionData = {
        teams: teams.map(t => ({
          id: t.id,
          name: t.name,
          emblem: t.emblem || '',
          color: t.color || ''
        })),
        students: students.map(s => ({
          id: s.id,
          name: s.name,
          team: s.team_id,
          status: s.status || 'pending',
          response: '',
          lastSeen: s.last_seen ? new Date(s.last_seen).getTime() : Date.now(),
          isOnline: s.last_seen ? (Date.now() - new Date(s.last_seen).getTime()) < 30000 : false
        })),
        questions: [], // Questions would be loaded separately if needed
        settings: {
          currentLevel: 'medium',
          isRunning: false
        }
      }
      
      // Cache in memory
      sessionStore.set(sessionId, sessionData)
      
      return NextResponse.json(sessionData)
    } catch (dbError) {
      console.warn('Database fetch failed:', dbError)
    }
    
    // Return empty session
    return NextResponse.json({
      teams: [],
      students: [],
      questions: [],
      settings: {
        currentLevel: 'medium',
        isRunning: false
      }
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { teams, students, questions, settings } = body
    
    // Prepare session data
    const sessionData = {
      teams: teams || [],
      students: students || [],
      questions: questions || [],
      settings: settings || {
        currentLevel: 'medium',
        isRunning: false
      },
      updatedAt: Date.now()
    }
    
    // Save to in-memory store immediately (fast)
    sessionStore.set(sessionId, sessionData)
    
    // Try to save to database (async, non-blocking)
    try {
      if (teams && Array.isArray(teams)) {
        const existing = await teamDb.getBySession(sessionId)
        const existingIds = new Set(existing.map(t => t.id))
        
        for (const team of teams) {
          if (!existingIds.has(team.id)) {
            try {
              await teamDb.create(sessionId, team.name, team.emblem || '', team.color || '')
            } catch (createError) {
              // Team might already exist
              console.warn('Team creation skipped:', createError)
            }
          }
        }
      }
      
      if (students && Array.isArray(students)) {
        // Students would be saved via userDb if needed
        // For now, we rely on localStorage + in-memory store
      }
    } catch (dbError) {
      console.warn('Database save failed, using in-memory store only:', dbError)
    }
    
    return NextResponse.json({ success: true, session: sessionData })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}

