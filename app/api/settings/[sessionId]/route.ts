import { NextRequest, NextResponse } from 'next/server'
import { sessionDb } from '@/lib/database'

// In-memory store for settings (fallback if database not available)
const settingsStore = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Try database first
    try {
      const session = await sessionDb.getById(sessionId)
      if (session) {
        return NextResponse.json({
          currentLevel: session.current_level || 'medium',
          isRunning: session.is_active || false
        })
      }
    } catch (dbError) {
      console.warn('Database fetch failed, using fallback:', dbError)
    }
    
    // Fallback to in-memory store
    const settings = settingsStore.get(sessionId) || {
      currentLevel: 'medium',
      isRunning: false
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { currentLevel, isRunning } = body
    
    const settings = {
      currentLevel: currentLevel || 'medium',
      isRunning: isRunning !== undefined ? isRunning : false // Preserve false values
    }
    
    // Try to save to database
    try {
      // Try to update existing session
      try {
        await sessionDb.update(sessionId, {
          current_level: settings.currentLevel,
          is_active: settings.isRunning
        })
      } catch (updateError) {
        // Session might not exist, that's okay - we'll use in-memory store
        console.warn('Session update failed (session may not exist in DB):', updateError)
      }
    } catch (dbError) {
      console.warn('Database save failed, using fallback:', dbError)
    }
    
    // Always save to in-memory store as fallback
    settingsStore.set(sessionId, settings)
    return NextResponse.json({ success: true, ...settings })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

