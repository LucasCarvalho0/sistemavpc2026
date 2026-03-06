import { useRef, useState, useCallback, useEffect } from 'react'
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library'

interface UseScannerOptions {
  onScan: (vin: string) => void
  onError?: (err: Error) => void
}

export function useVinScanner({ onScan, onError }: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startScan = useCallback(async () => {
    try {
      const hints = new Map()
      // VINs are usually Code 128 or Code 39
      const formats = [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.DATA_MATRIX]
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
      hints.set(DecodeHintType.TRY_HARDER, true) // Higher accuracy, might be slightly slower but better for VINs

      readerRef.current = new BrowserMultiFormatReader(hints)
      setScanning(true)
      setError(null)

      // Use environment (back) camera
      const constraints = {
        video: { facingMode: 'environment' }
      }

      await readerRef.current.decodeFromConstraints(
        constraints,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const text = result.getText().trim()
            // VIN is 17 chars — filter and clean
            // Matches alphanumeric 17 chars
            if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(text)) {
              const vin = text.toUpperCase()

              // Haptic feedback
              if (navigator.vibrate) {
                navigator.vibrate(200)
              }

              // Audio feedback (Beep)
              try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
                const ctx = new AudioContextClass()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()

                osc.connect(gain)
                gain.connect(ctx.destination)

                osc.type = 'sine'
                osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note

                gain.gain.setValueAtTime(0, ctx.currentTime)
                gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05)
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)

                osc.start(ctx.currentTime)
                osc.stop(ctx.currentTime + 0.2)
              } catch (e) {
                console.warn('Audio feedback failed:', e)
              }

              onScan(vin)
              stopScan()
            }
          }
          if (err && !(err instanceof NotFoundException)) {
            // Only log serious errors
            console.error('Scanner error:', err)
          }
        }
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Câmera não disponível'
      setError(msg)
      setScanning(false)
      onError?.(err instanceof Error ? err : new Error(msg))
    }
  }, [onScan, onError])

  const stopScan = useCallback(() => {
    readerRef.current?.reset()
    readerRef.current = null
    setScanning(false)
  }, [])

  useEffect(() => {
    return () => {
      readerRef.current?.reset()
    }
  }, [])

  return { videoRef, scanning, error, startScan, stopScan }
}
