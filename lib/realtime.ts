'use client'

import { supabase } from './supabase'


export const realtimeHandlers = {
  // Subscribe to session changes
  subscribeToSession(
    sessionId: string,
    onUpdate: (session: any) => void,
    onError?: (error: any) => void
  ) {
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          onUpdate(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[v0] Real-time: Subscribed to session ${sessionId}`)
        } else if (status === 'CHANNEL_ERROR' && onError) {
          onError(new Error(`Subscription failed: ${status}`))
        }
      })

    return subscription
  },

  // Subscribe to answers for a question
  subscribeToAnswers(
    questionId: string,
    onInsert: (answer: any) => void,
    onUpdate: (answer: any) => void,
    onDelete?: (answer: any) => void
  ) {
    return supabase
      .channel(`answers:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          console.log(`[v0] New answer received for question ${questionId}`)
          onInsert(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          console.log(`[v0] Answer updated for question ${questionId}`)
          onUpdate(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          if (onDelete) onDelete(payload.old)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[v0] Real-time: Subscribed to answers for question ${questionId}`)
        }
      })
  },

  // Subscribe to user joins
  subscribeToUserJoins(
    sessionId: string,
    onUserJoin: (user: any) => void
  ) {
    return supabase
      .channel(`users:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log(`[v0] New user joined session ${sessionId}`)
          onUserJoin(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[v0] Real-time: Subscribed to user joins for session ${sessionId}`)
        }
      })
  },

  // Subscribe to achievements
  subscribeToAchievements(
    sessionId: string,
    onAchievement: (achievement: any) => void
  ) {
    return supabase
      .channel(`achievements:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log(`[v0] New achievement unlocked in session ${sessionId}`)
          onAchievement(payload.new)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[v0] Real-time: Subscribed to achievements for session ${sessionId}`)
        }
      })
  },
}
