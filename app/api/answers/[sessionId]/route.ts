import { NextRequest, NextResponse } from 'next/server'
import { answerDb, questionDb, userDb } from '@/lib/database'

// In-memory store for answers (fallback if database not available)
const answersStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try database first
    try {
      // Get all questions for this session
      const questions = await questionDb.getBySession(sessionId)
      const allAnswers: any[] = []
      
      // Get answers for each question
      for (const question of questions) {
        const answers = await answerDb.getByQuestion(question.id)
        for (const answer of answers) {
          // Get user info
          const users = await userDb.getBySession(sessionId)
          const user = users.find(u => u.id === answer.user_id)
          
          allAnswers.push({
            id: answer.id,
            studentId: answer.user_id,
            studentName: user?.name || 'Unknown',
            teamId: user?.team_id || '',
            questionId: answer.question_id,
            text: answer.text,
            timestamp: answer.created_at
          })
        }
      }
      
      if (allAnswers.length > 0) {
        return NextResponse.json({ answers: allAnswers })
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback:', dbError)
    }
    
    // Fallback to in-memory store
    const answers = answersStore.get(sessionId) || []
    return NextResponse.json({ answers })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { studentId, studentName, teamId, text, questionId } = body
    
    if (!studentId || !text) {
      return NextResponse.json({ error: 'studentId and text are required' }, { status: 400 })
    }
    
    const answerData = {
      id: `answer-${Date.now()}`,
      studentId,
      studentName,
      teamId,
      text,
      questionId: questionId || 'default-question',
      timestamp: new Date().toISOString()
    }
    
    // Try to save to database
    try {
      // Ensure user exists
      const users = await userDb.getBySession(sessionId)
      let userId = users.find(u => u.id === studentId)?.id
      
      if (!userId) {
        // Create user if doesn't exist
        try {
          const newUser = await userDb.create(sessionId, teamId || '', studentName)
          userId = newUser.id
        } catch (createError) {
          console.warn('User creation failed, using existing or fallback:', createError)
          // Try to find by name instead
          const userByName = users.find(u => u.name === studentName)
          if (userByName) {
            userId = userByName.id
          }
        }
      }
      
      // Get or create question
      let questionIdToUse = questionId
      if (!questionIdToUse || questionIdToUse === 'default-question') {
        const questions = await questionDb.getBySession(sessionId)
        if (questions.length > 0) {
          questionIdToUse = questions[0].id
        } else {
          // Create a default question
          try {
            const newQuestion = await questionDb.create(
              sessionId,
              'Quelle est la nature de la bonne vie, et comment se rapporte-t-elle à la vertu?',
              'medium',
              0
            )
            questionIdToUse = newQuestion.id
          } catch (qError) {
            console.warn('Question creation failed:', qError)
          }
        }
      }
      
      // Save answer to database if we have userId and questionId
      if (userId && questionIdToUse && questionIdToUse !== 'default-question') {
        await answerDb.create(questionIdToUse, userId, text)
      }
    } catch (dbError) {
      console.warn('Database save failed, using fallback:', dbError)
    }
    
    // Always save to in-memory store as fallback
    const existingAnswers = answersStore.get(sessionId) || []
    existingAnswers.push(answerData)
    answersStore.set(sessionId, existingAnswers)
    
    return NextResponse.json({ success: true, answer: answerData })
  } catch (error) {
    console.error('Error saving answer:', error)
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
  }
}

