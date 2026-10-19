import { useLayoutEffect, useRef, type RefObject } from 'react'

export type Rotation = { x: number; y: number; z?: number }

export const LANDING_ROTATION: Rotation = { x: -105, y: -22 }

export const cubeFaces = [
  { id: 'front', category: 'featured', label: 'Featured Projects', rotateX: 0, rotateY: 0, normal: [0, 0, 1] },
  { id: 'right', category: 'applications', label: 'Applications', rotateX: 0, rotateY: 90, normal: [1, 0, 0] },
  { id: 'back', category: 'ai', label: 'AI Engineering', rotateX: 0, rotateY: 180, normal: [0, 0, -1] },
  { id: 'left', category: 'automation', label: 'Automation', rotateX: 0, rotateY: -90, normal: [-1, 0, 0] },
  { id: 'top', category: 'about', label: 'About', rotateX: 90, rotateY: 0, normal: [0, -1, 0] },
  { id: 'bottom', category: 'contact', label: 'Contact', rotateX: -90, rotateY: 0, normal: [0, 1, 0] },
]

// CSS applies rotateZ, then rotateY, then rotateX to each face vector.
const rotateVector = ([vx, vy, vz]: number[], rotation: Rotation) => {
  const x = rotation.x * Math.PI / 180, y = rotation.y * Math.PI / 180, z = (rotation.z ?? 0) * Math.PI / 180
  const zx = vx * Math.cos(z) - vy * Math.sin(z), zy = vx * Math.sin(z) + vy * Math.cos(z)
  const yx = zx * Math.cos(y) + vz * Math.sin(y), yz = -zx * Math.sin(y) + vz * Math.cos(y)
  return [yx, zy * Math.cos(x) - yz * Math.sin(x), zy * Math.sin(x) + yz * Math.cos(x)]
}
export const getFaceFacing = (normal: number[], rotation: Rotation) => rotateVector(normal, rotation)[2]
// Keep lettering upright within its own face plane as the cube turns.
const getFaceUpY = (face: { rotateX: number; rotateY: number }, rotation: Rotation) =>
  rotateVector(rotateVector([0, -1, 0], { x: face.rotateX, y: face.rotateY }), rotation)[1]

// Turn around screen axes so top and bottom faces respond like side faces.
export const turnCube = (rotation: Rotation, pitch: number, yaw: number): Rotation => {
  const columns = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(axis =>
    rotateVector(rotateVector(rotateVector(axis, rotation), { x: pitch, y: 0 }), { x: 0, y: yaw }))
  const y = Math.asin(Math.max(-1, Math.min(1, columns[2][0])))
  const singular = Math.abs(Math.cos(y)) < 1e-6
  return {
    x: (singular ? Math.atan2(columns[0][1] * Math.sign(Math.sin(y)), columns[1][1]) : Math.atan2(-columns[2][1], columns[2][2])) * 180 / Math.PI,
    y: y * 180 / Math.PI,
    z: (singular ? 0 : Math.atan2(-columns[1][0], columns[0][0])) * 180 / Math.PI,
  }
}
// Unit quaternions let selection take the shortest physical path even when
// screen-axis dragging crosses an Euler singularity or wraps past 180 degrees.
type Quaternion = [number, number, number, number]
const quaternion = (r: Rotation): Quaternion => {
  const half = Math.PI / 360
  const cx = Math.cos(r.x * half), sx = Math.sin(r.x * half)
  const cy = Math.cos(r.y * half), sy = Math.sin(r.y * half)
  const cz = Math.cos((r.z ?? 0) * half), sz = Math.sin((r.z ?? 0) * half)
  return [sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz,
    cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz]
}
const fromQuaternion = ([x, y, z, w]: Quaternion): Rotation => {
  const yy = Math.asin(Math.max(-1, Math.min(1, 2 * (x * z + y * w))))
  const singular = Math.abs(Math.cos(yy)) < 1e-6
  return {
    x: (singular ? Math.atan2(2 * (x * y + z * w) * Math.sign(Math.sin(yy)), 1 - 2 * (x * x + z * z)) : Math.atan2(2 * (x * w - y * z), 1 - 2 * (x * x + y * y))) * 180 / Math.PI,
    y: yy * 180 / Math.PI,
    z: (singular ? 0 : Math.atan2(2 * (z * w - x * y), 1 - 2 * (y * y + z * z))) * 180 / Math.PI,
  }
}
const interpolate = (from: Quaternion, target: Quaternion, progress: number): Rotation => {
  let dot = from.reduce((sum, value, i) => sum + value * target[i], 0)
  const to = dot < 0 ? target.map(value => -value) as Quaternion : target
  dot = Math.min(1, Math.abs(dot))
  const angle = Math.acos(dot), sine = Math.sin(angle)
  const a = sine < .001 ? 1 - progress : Math.sin((1 - progress) * angle) / sine
  const b = sine < .001 ? progress : Math.sin(progress * angle) / sine
  const blended = from.map((value, i) => value * a + to[i] * b)
  const length = Math.hypot(...blended)
  return fromQuaternion(blended.map(value => value / length) as Quaternion)
}

const IDLE_RESUME_DELAY = 1900
const SELECTION_DURATION = 320

type MotionOptions = { motionEnabled: boolean; reducedMotion: boolean; active: boolean; gestureHint: boolean }
type Controller = {
  apply: (rotation: Rotation) => void
  select: (rotation: Rotation) => void
  beginDrag: () => void
  endDrag: () => void
  reconcile: () => void
  paint: () => void
}

// React owns selection/content. This hook alone owns the cube transform,
// camera-facing class and upright lettering; no React updates run per frame.
export function useCubeMotion(cubeRef: RefObject<HTMLDivElement | null>, options: MotionOptions) {
  const rotationRef = useRef<Rotation>(LANDING_ROTATION)
  const optionsRef = useRef(options)
  const controllerRef = useRef<Controller | null>(null)

  useLayoutEffect(() => {
    const cube = cubeRef.current
    if (!cube) return
    const faces = cubeFaces.map(face => ({ face,
      node: cube.querySelector<HTMLElement>(`.cube-${face.id}`)!,
      lettering: cube.querySelector<HTMLElement>(`.cube-${face.id} .face-lettering`),
      flipped: false,
    }))
    let frame: number | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let lastTime: number | null = null
    let dragging = false
    let anchor = rotationRef.current
    let idleElapsed = 0, demoElapsed = 0, idleDueAt = 0
    let transition: { from: Quaternion; to: Quaternion; target: Rotation; elapsed: number } | null = null
    const demoMedia = window.matchMedia('(max-width: 700px)')
    const canRun = () => optionsRef.current.motionEnabled && optionsRef.current.active && !document.hidden && !dragging
    const paint = (rotation = rotationRef.current) => {
      rotationRef.current = rotation
      cube.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z ?? 0}deg)`
      const front = cubeFaces.reduce((best, face) => getFaceFacing(face.normal, rotation) > getFaceFacing(best.normal, rotation) ? face : best)
      for (const item of faces) {
        if (item.node.classList.contains('is-facing') !== (item.face === front)) item.node.classList.toggle('is-facing', item.face === front)
        const up = getFaceUpY(item.face, rotation)
        if (!item.flipped && up > .12) item.flipped = true
        else if (item.flipped && up < -.12) item.flipped = false
        if (item.face.category !== 'about' && item.lettering) {
          const transform = `rotateZ(${item.flipped ? 180 : 0}deg)`
          if (item.lettering.style.transform !== transform) item.lettering.style.transform = transform
        }
      }
    }
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      if (timer !== null) clearTimeout(timer)
      frame = null; timer = null; lastTime = null
    }
    const resetIdle = () => { anchor = rotationRef.current; idleElapsed = 0; demoElapsed = 0; lastTime = null }
    const schedule = () => {
      if (!canRun() || frame !== null || timer !== null) return
      const wait = idleDueAt - performance.now()
      if (!transition && wait > 0) {
        timer = setTimeout(() => { timer = null; schedule() }, wait)
      } else frame = requestAnimationFrame(tick)
    }
    const tick = (time: number) => {
      frame = null
      if (!canRun()) { lastTime = null; return }
      const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 64)
      lastTime = time
      if (transition) {
        transition.elapsed += elapsed
        const progress = Math.min(transition.elapsed / SELECTION_DURATION, 1)
        paint(progress === 1 ? transition.target : interpolate(transition.from, transition.to, progress * progress * (3 - 2 * progress)))
        if (progress === 1) { transition = null; resetIdle() }
      } else if (optionsRef.current.gestureHint && demoMedia.matches && demoElapsed < 1800) {
        demoElapsed = Math.min(demoElapsed + elapsed, 1800)
        const progress = demoElapsed / 1800
        const tilt = Math.sin(progress * Math.PI * 2) * Math.sin(progress * Math.PI) * 9
        paint(turnCube(anchor, tilt * .4, tilt))
      } else {
        idleElapsed += elapsed
        paint(turnCube(anchor, 0, Math.sin(idleElapsed / 1600) * 5))
      }
      schedule()
    }
    const reconcile = () => {
      stop()
      if (optionsRef.current.reducedMotion && transition) {
        paint(transition.target); transition = null; resetIdle()
      }
      cube.dataset.motionSuspended = String(!optionsRef.current.motionEnabled || !optionsRef.current.active || document.hidden)
      schedule()
    }
    controllerRef.current = {
      apply(rotation) {
        stop(); transition = null; paint(rotation); resetIdle()
        idleDueAt = performance.now() + IDLE_RESUME_DELAY
        schedule()
      },
      select(target) {
        stop(); transition = null
        if (!optionsRef.current.motionEnabled) { paint(target); resetIdle() }
        else transition = { from: quaternion(rotationRef.current), to: quaternion(target), target, elapsed: 0 }
        idleDueAt = 0
        schedule()
      },
      beginDrag() { stop(); transition = null; dragging = true; resetIdle() },
      endDrag() {
        dragging = false; resetIdle(); idleDueAt = performance.now() + IDLE_RESUME_DELAY
        schedule()
      },
      reconcile,
      paint: () => paint(),
    }
    document.addEventListener('visibilitychange', reconcile)
    reconcile()
    return () => { stop(); document.removeEventListener('visibilitychange', reconcile); controllerRef.current = null }
  }, [cubeRef])

  useLayoutEffect(() => {
    optionsRef.current = options
    controllerRef.current?.reconcile()
  }, [options.motionEnabled, options.reducedMotion, options.active, options.gestureHint])
  // A normal React commit may replace face classes. Restore geometry before paint.
  useLayoutEffect(() => { controllerRef.current?.paint() })

  return {
    rotationRef,
    applyRotation: (rotation: Rotation) => controllerRef.current?.apply(rotation),
    selectRotation: (rotation: Rotation) => controllerRef.current?.select(rotation),
    beginDrag: () => controllerRef.current?.beginDrag(),
    endDrag: () => controllerRef.current?.endDrag(),
  }
}
