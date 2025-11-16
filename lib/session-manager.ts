// Fast and efficient session management
// Single source of truth for session data

export interface SessionData {
  id: string
  teams: any[]
  students: any[]
  questions: any[]
  settings: {
    currentLevel: string
    isRunning: boolean
  }
  createdAt: number
  updatedAt: number
}

class SessionManager {
  private currentSession: SessionData | null = null
  private sessionKey = 'current-session-data'

  // Generate a short, unique session ID
  generateSessionId(): string {
    return `s${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`
  }

  // Initialize or get current session
  initSession(sessionId?: string): SessionData {
    if (this.currentSession && this.currentSession.id === sessionId) {
      return this.currentSession
    }

    // Try to load from localStorage
    const stored = localStorage.getItem(this.sessionKey)
    if (stored) {
      try {
        const data = JSON.parse(stored) as SessionData
        if (!sessionId || data.id === sessionId) {
          this.currentSession = data
          return data
        }
      } catch (e) {
        console.warn('Failed to parse stored session:', e)
      }
    }

    // Create new session
    const newSessionId = sessionId || this.generateSessionId()
    this.currentSession = {
      id: newSessionId,
      teams: [],
      students: [],
      questions: [],
      settings: {
        currentLevel: 'medium',
        isRunning: false
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.saveSession()
    return this.currentSession
  }

  // Get current session
  getSession(): SessionData | null {
    if (this.currentSession) {
      return this.currentSession
    }

    const stored = localStorage.getItem(this.sessionKey)
    if (stored) {
      try {
        this.currentSession = JSON.parse(stored) as SessionData
        return this.currentSession
      } catch (e) {
        console.warn('Failed to parse stored session:', e)
      }
    }

    return null
  }

  // Update session data (fast, in-memory first)
  updateSession(updates: Partial<SessionData>): SessionData {
    if (!this.currentSession) {
      this.initSession()
    }

    this.currentSession = {
      ...this.currentSession!,
      ...updates,
      updatedAt: Date.now()
    }

    // Save immediately to localStorage (fast)
    this.saveSession()

    // Sync to API in background (non-blocking)
    this.syncToAPI()

    return this.currentSession!
  }

  // Update specific parts of session
  updateTeams(teams: any[]) {
    return this.updateSession({ teams })
  }

  updateStudents(students: any[]) {
    return this.updateSession({ students })
  }

  updateQuestions(questions: any[]) {
    return this.updateSession({ questions })
  }

  updateSettings(settings: Partial<SessionData['settings']>) {
    return this.updateSession({
      settings: {
        ...this.currentSession?.settings || { currentLevel: 'medium', isRunning: false },
        ...settings
      }
    })
  }

  // Save to localStorage (fast, synchronous)
  private saveSession() {
    if (this.currentSession) {
      localStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession))
      // Also save session ID separately for compatibility
      localStorage.setItem('host-session-id', this.currentSession.id)
    }
  }

  // Sync to API (async, non-blocking)
  private async syncToAPI() {
    if (!this.currentSession) return

    try {
      // Batch all updates in a single API call
      await fetch(`/api/session/${this.currentSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teams: this.currentSession.teams,
          students: this.currentSession.students,
          questions: this.currentSession.questions,
          settings: this.currentSession.settings
        })
      })
    } catch (error) {
      console.warn('API sync failed (using localStorage only):', error)
    }
  }

  // Load from API (if needed)
  async loadFromAPI(sessionId: string): Promise<SessionData | null> {
    try {
      const response = await fetch(`/api/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        this.currentSession = {
          id: sessionId,
          teams: data.teams || [],
          students: data.students || [],
          questions: data.questions || [],
          settings: data.settings || { currentLevel: 'medium', isRunning: false },
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now()
        }
        this.saveSession()
        return this.currentSession
      }
    } catch (error) {
      console.warn('Failed to load from API:', error)
    }
    return null
  }

  // Clear session
  clearSession() {
    this.currentSession = null
    localStorage.removeItem(this.sessionKey)
    localStorage.removeItem('host-session-id')
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()

