import { NextRequest, NextResponse } from 'next/server'

// In-memory store for teams (in production, use a database)
// This will work across devices on the same server instance
const teamsStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
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
    
    teamsStore.set(sessionId, teams)
    return NextResponse.json({ success: true, teams })
  } catch (error) {
    console.error('Error saving teams:', error)
    return NextResponse.json({ error: 'Failed to save teams' }, { status: 500 })
  }
}

