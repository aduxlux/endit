import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/database'

// In-memory store for students (fallback if database not available)
const studentsStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try database first
    try {
      const dbUsers = await userDb.getBySession(sessionId)
      if (dbUsers && dbUsers.length > 0) {
        const students = dbUsers.map(u => ({
          id: u.id,
          name: u.name,
          team: u.team_id || '',
          status: u.status || 'pending',
          response: '' // Would need to fetch from answers table
        }))
        return NextResponse.json({ students })
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback:', dbError)
    }
    
    // Fallback to in-memory store
    const students = studentsStore.get(sessionId) || []
    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { students } = body
    
    if (!Array.isArray(students)) {
      return NextResponse.json({ error: 'Students must be an array' }, { status: 400 })
    }
    
    // Try to save to database
    try {
      // Get existing users from DB
      const existing = await userDb.getBySession(sessionId)
      const existingIds = new Set(existing.map(u => u.id))
      
      // Add new students to database
      for (const student of students) {
        if (!existingIds.has(student.id) && student.team) {
          try {
            await userDb.create(sessionId, student.team, student.name)
          } catch (createError) {
            // Student might already exist, continue
            console.warn('Student creation skipped:', createError)
          }
        } else if (existingIds.has(student.id)) {
          // Update existing student status
          try {
            await userDb.updateStatus(student.id, student.status || 'pending')
          } catch (updateError) {
            console.warn('Student update skipped:', updateError)
          }
        }
      }
    } catch (dbError) {
      console.warn('Database save failed, using fallback:', dbError)
    }
    
    // Always save to in-memory store as fallback
    studentsStore.set(sessionId, students)
    return NextResponse.json({ success: true, students })
  } catch (error) {
    console.error('Error saving students:', error)
    return NextResponse.json({ error: 'Failed to save students' }, { status: 500 })
  }
}

