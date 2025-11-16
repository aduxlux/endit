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

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [channel, table, filter, onUpdate])

  return subscriptionRef.current
}
