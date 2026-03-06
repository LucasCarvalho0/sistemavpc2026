import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '../store/useAppStore'
import type { Production } from '../types'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { addProduction, setConnected, addToast } = useAppStore()

  useEffect(() => {
    socketRef.current = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      setConnected(true)
      console.log('WebSocket conectado:', socket.id)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('production:new', (production: Production) => {
      addProduction(production)
    })

    socket.on('production:goalReached', () => {
      addToast('🎉 META DO TURNO ATINGIDA!', 'success')
    })

    socket.on('connect_error', (err) => {
      console.error('WebSocket error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [addProduction, setConnected, addToast])

  return socketRef.current
}
