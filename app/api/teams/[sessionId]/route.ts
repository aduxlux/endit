import { NextRequest, NextResponse } from 'next/server'
import { teamDb } from '@/lib/database'

// In-memory store for teams (fallback if database not available)
const teamsStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try database first
    try {
      const dbTeams = await teamDb.getBySession(sessionId)
      if (dbTeams && dbTeams.length > 0) {
        const teams = dbTeams.map(t => ({
          id: t.id,
          name: t.name,
          emblem: t.emblem || '',
          color: t.color || ''
        }))
        return NextResponse.json({ teams })
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback:', dbError)
    }
    
    // Fallback to in-memory store
    const teams = teamsStore.get(sessionId) || []
    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { teams } = body
    
    if (!Array.isArray(teams)) {
      return NextResponse.json({ error: 'Teams must be an array' }, { status: 400 })
    }
    
    // Try to save to database
    try {
      // Get existing teams from DB
      const existing = await teamDb.getBySession(sessionId)
      const existingIds = new Set(existing.map(t => t.id))
      
      // Add new teams to database
      for (const team of teams) {
        if (!existingIds.has(team.id)) {
          try {
            await teamDb.create(sessionId, team.name, team.emblem || '', team.color || '')
          } catch (createError) {
            // Team might already exist, continue
            console.warn('Team creation skipped:', createError)
          }
        }
      }
    } catch (dbError) {
      console.warn('Database save failed, using fallback:', dbError)
    }
    
    // Always save to in-memory store as fallback
    teamsStore.set(sessionId, teams)
    return NextResponse.json({ success: true, teams })
  } catch (error) {
    console.error('Error saving teams:', error)
    return NextResponse.json({ error: 'Failed to save teams' }, { status: 500 })
  }
}

