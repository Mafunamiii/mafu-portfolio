import { useEffect } from 'react'

const POINTER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 768px)'

export default function CursorAmbientGlow() {
  useEffect(() => {
    const pointerMedia = window.matchMedia(POINTER_QUERY)
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    const body = document.body
    const previousX = root.style.getPropertyValue('--cursor-ambient-x')
    const previousY = root.style.getPropertyValue('--cursor-ambient-y')
    let enabled = false
    let frame: number | null = null
    let cursorX = window.innerWidth / 2
    let cursorY = window.innerHeight / 2

    const paint = () => {
      root.style.setProperty('--cursor-ambient-x', `${cursorX}px`)
      root.style.setProperty('--cursor-ambient-y', `${cursorY}px`)
    }

    const cancelFrame = () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
    }

    const paintFrame = () => {
      frame = null
      if (!enabled || document.hidden) return
      paint()
    }

    const schedule = () => {
      if (enabled && !document.hidden && frame === null) {
        frame = window.requestAnimationFrame(paintFrame)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      cursorX = event.clientX
      cursorY = event.clientY
      schedule()
    }

    const updateEnabled = () => {
      const nextEnabled = pointerMedia.matches && !reducedMotionMedia.matches
      if (enabled === nextEnabled) return
      enabled = nextEnabled

      if (enabled) {
        cursorX = window.innerWidth / 2
        cursorY = window.innerHeight / 2
        paint()
        body.classList.add('cursor-ambient-enabled')
      } else {
        cancelFrame()
        body.classList.remove('cursor-ambient-enabled')
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) cancelFrame()
      else schedule()
    }

    pointerMedia.addEventListener('change', updateEnabled)
    reducedMotionMedia.addEventListener('change', updateEnabled)
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    updateEnabled()

    return () => {
      pointerMedia.removeEventListener('change', updateEnabled)
      reducedMotionMedia.removeEventListener('change', updateEnabled)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      cancelFrame()
      body.classList.remove('cursor-ambient-enabled')
      if (previousX) root.style.setProperty('--cursor-ambient-x', previousX)
      else root.style.removeProperty('--cursor-ambient-x')
      if (previousY) root.style.setProperty('--cursor-ambient-y', previousY)
      else root.style.removeProperty('--cursor-ambient-y')
    }
  }, [])

  return null
}
