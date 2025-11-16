'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'


export function useRealtimeSubscription(
  channel: string,
  table: string,
  filter: string,
  onUpdate: (payload: any) => void
) {
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured, skipping real-time subscription')
      return
    }

    try {
      subscriptionRef.current = supabase
        .channel(channel)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter,
          },
          (payload) => {
            console.log(`[v0] Real-time update: ${table} ${payload.eventType}`)
            onUpdate(payload)
          }
        )
        .subscribe()
    } catch (error) {
      console.warn('Failed to set up real-time subscription:', error)
    }

    return () => {
      if (supabase && subscriptionRef.current) {
        try {
          supabase.removeChannel(subscriptionRef.current)
        } catch (error) {
          console.warn('Failed to remove channel:', error)
        }
      }
    }
  }, [channel, table, filter, onUpdate])

  return subscriptionRef.current
}
