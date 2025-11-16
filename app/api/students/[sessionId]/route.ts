import { NextRequest, NextResponse } from 'next/server'

// In-memory store for students (in production, use a database)
const studentsStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
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
    
    studentsStore.set(sessionId, students)
    return NextResponse.json({ success: true, students })
  } catch (error) {
    console.error('Error saving students:', error)
    return NextResponse.json({ error: 'Failed to save students' }, { status: 500 })
  }
}

