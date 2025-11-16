import { supabase } from './supabase'


export interface Session {
  id: string
  host_id: string
  title: string
  description?: string
  current_level: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  session_id: string
  name: string
  emblem: string
  color: string
}

export interface User {
  id: string
  session_id: string
  team_id?: string
  name: string
  status: string
  created_at: string
}

export interface Question {
  id: string
  session_id: string
  text: string
  level: string
  order_index: number
}

export interface Answer {
  id: string
  question_id: string
  user_id: string
  text: string
  rating: number
  is_highlighted: boolean
  created_at: string
}

export interface Achievement {
  id: string
  session_id: string
  user_id: string
  badge_type: string
  title: string
  description?: string
}

export interface Event {
  id: string
  session_id: string
  event_type: string
  payload: any
  created_at: string
}

// Session operations
export const sessionDb = {
  async create(hostId: string, title: string, description?: string) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ host_id: hostId, title, description }])
      .select()
      .single()

    if (error) throw error
    return data as Session
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select()
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Session
  },

  async update(id: string, updates: Partial<Session>) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Session
  },

  async setLevel(id: string, level: string) {
    return this.update(id, { current_level: level })
  },

  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { is_active: isActive })
  },
}

// Team operations
export const teamDb = {
  async create(sessionId: string, name: string, emblem: string, color: string) {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ session_id: sessionId, name, emblem, color }])
        .select()
        .single()

      if (error) throw error
      return data as Team
    } catch (error: any) {
      // If it's a duplicate key error, try to get the existing team
      if (error?.code === '23505' || error?.message?.includes('duplicate')) {
        const existing = await this.getBySession(sessionId)
        return existing.find(t => t.name === name && t.session_id === sessionId) as Team
      }
      throw error
    }
  },

  async getBySession(sessionId: string) {
    if (!supabase) {
      return [] // Return empty array if Supabase not configured
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select()
        .eq('session_id', sessionId)

      if (error) {
        console.warn('Supabase teams fetch failed:', error)
        return []
      }
      return (data || []) as Team[]
    } catch (error) {
      console.warn('Supabase teams fetch error:', error)
      return []
    }
  },
}

// User (student) operations
export const userDb = {
  async create(sessionId: string, teamId: string, name: string) {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ session_id: sessionId, team_id: teamId || null, name }])
        .select()
        .single()

      if (error) throw error
      return data as User
    } catch (error: any) {
      // If it's a duplicate key error, try to get the existing user
      if (error?.code === '23505' || error?.message?.includes('duplicate')) {
        const existing = await this.getBySession(sessionId)
        return existing.find(u => u.name === name && u.session_id === sessionId) as User
      }
      throw error
    }
  },

  async getBySession(sessionId: string) {
    if (!supabase) {
      return [] // Return empty array if Supabase not configured
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('session_id', sessionId)

      if (error) {
        console.warn('Supabase users fetch failed:', error)
        return []
      }
      return (data || []) as User[]
    } catch (error) {
      console.warn('Supabase users fetch error:', error)
      return []
    }
  },

  async updateStatus(userId: string, status: string) {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ status, last_seen: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data as User
    } catch (error) {
      console.warn('Supabase user update failed:', error)
      throw error
    }
  },
}

// Question operations
export const questionDb = {
  async create(sessionId: string, text: string, level: string, orderIndex: number = 0) {
    const { data, error } = await supabase
      .from('questions')
      .insert([{ session_id: sessionId, text, level, order_index: orderIndex }])
      .select()
      .single()

    if (error) throw error
    return data as Question
  },

  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select()
      .eq('session_id', sessionId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Question[]
  },
}

// Answer operations
export const answerDb = {
  async create(questionId: string, userId: string, text: string) {
    const { data, error } = await supabase
      .from('answers')
      .insert([{ question_id: questionId, user_id: userId, text }])
      .select()
      .single()

    if (error) throw error
    return data as Answer
  },

  async getByQuestion(questionId: string) {
    const { data, error } = await supabase
      .from('answers')
      .select()
      .eq('question_id', questionId)

    if (error) throw error
    return data as Answer[]
  },

  async rate(answerId: string, rating: number) {
    const { data, error } = await supabase
      .from('answers')
      .update({ rating })
      .eq('id', answerId)
      .select()
      .single()

    if (error) throw error
    return data as Answer
  },

  async highlight(answerId: string, isHighlighted: boolean) {
    const { data, error } = await supabase
      .from('answers')
      .update({ is_highlighted: isHighlighted })
      .eq('id', answerId)
      .select()
      .single()

    if (error) throw error
    return data as Answer
  },
}

// Achievement operations
export const achievementDb = {
  async create(
    sessionId: string,
    userId: string,
    badgeType: string,
    title: string,
    description?: string
  ) {
    const { data, error } = await supabase
      .from('achievements')
      .insert([{ session_id: sessionId, user_id: userId, badge_type: badgeType, title, description }])
      .select()
      .single()

    if (error) throw error
    return data as Achievement
  },

  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select()
      .eq('session_id', sessionId)

    if (error) throw error
    return data as Achievement[]
  },
}

// Event operations (for replay mode)
export const eventDb = {
  async log(sessionId: string, eventType: string, payload?: any) {
    const { data, error } = await supabase
      .from('events')
      .insert([{ session_id: sessionId, event_type: eventType, payload }])
      .select()
      .single()

    if (error) throw error
    return data as Event
  },

  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('events')
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Event[]
  },
}

// Summary page operations
export const summaryDb = {
  async create(sessionId: string, token: string, title: string) {
    const { data, error } = await supabase
      .from('summary_pages')
      .insert([{ session_id: sessionId, token, title, is_public: true }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('summary_pages')
      .select()
      .eq('token', token)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('summary_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
