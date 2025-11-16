import { NextRequest, NextResponse } from 'next/server'
import { questionDb } from '@/lib/database'

// In-memory store for questions (fallback if database not available)
const questionsStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try database first
    try {
      const questions = await questionDb.getBySession(sessionId)
      if (questions.length > 0) {
        return NextResponse.json({ questions })
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback:', dbError)
    }
    
    // Fallback to in-memory store
    const questions = questionsStore.get(sessionId) || []
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { questions } = body
    
    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'questions must be an array' }, { status: 400 })
    }
    
    // Try to save to database
    try {
      // Delete existing questions for this session
      const existingQuestions = await questionDb.getBySession(sessionId)
      
      // Create new questions
      for (const q of questions) {
        await questionDb.create(sessionId, q.text, q.level, q.order_index || 0)
      }
    } catch (dbError) {
      console.warn('Database save failed, using fallback:', dbError)
    }
    
    // Always save to in-memory store as fallback
    questionsStore.set(sessionId, questions)
    
    return NextResponse.json({ success: true, questions })
  } catch (error) {
    console.error('Error saving questions:', error)
    return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 })
  }
}

