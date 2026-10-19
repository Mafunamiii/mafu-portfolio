import { createPortal } from 'react-dom'
import { cubeFaces, getFaceFacing, LANDING_ROTATION, turnCube, useCubeMotion, type Rotation } from './cubeMotion'
import { portfolioUrl, readPortfolioLocation, scrollToPortfolioHash, type PortfolioView } from './navigation'
import { ArrowDownRight, ExternalLink, Menu, Pause, Play, X } from 'lucide-react'
import { PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Lossless, full-resolution copies of the same assigned images for decoration.
const decorativeImage = (image: string) => image.replace(/(\/images\/)(.*)\.png$/, (_, prefix, name) => `${prefix}decorative/${name}.webp`)
const imagePath = (name: string) => `${import.meta.env.BASE_URL}images/${name}`
const projectImageSizes: Record<string, [number, number]> = {
  '2phishy-gameplay.png': [1606, 1080], '2phishydashboard.png': [1876, 1080], 'Agent001.png': [921, 1080],
  'Clipcue.png': [1100, 1080], 'Crossplate-cropped-zoom-license.png': [680, 1080], 'Crossplate-license-detail.png': [632, 164], 'clipcue-hotkey-selection.png': [1107, 1080],
  'clipqa.png': [1407, 1080], 'cliptrack.png': [1235, 1080], 'clipwatcher.png': [1095, 1080],
  'crossplate-detection-summary.png': [1620, 1080], 'mafusheets-dashboard-with-sheets.png': [1270, 1080],
  'mafusheets-dashboard.png': [1266, 1080], 'mafusheets-details.png': [1260, 1080], 'namicash-budget-settings.png': [709, 1080],
  'namicash-dashboard.png': [674, 1080], 'rsvp.png': [1281, 1080], 'suplings-handbook-dashboard.png': [1118, 1080], 'watercatch.png': [1215, 1080],
}
const assetPreview = (name: string, alt: string, caption: string, rect?: [number, number, number, number]): Preview => {
  const [width, height] = projectImageSizes[name]
  return { image: imagePath(`projects/${name}`), sourceSize: [width, height], rect: rect ?? [0, 0, width, height], alt, caption }
}

type Preview = { sourceSize?: [number, number]; image: string; rect: [number, number, number, number]; alt: string; caption: string }
type Slide = { number: string; title: string; image: string; preview?: Preview }
type CaseStudy = { context: string; purpose: string; contribution: string; details: string[]; preview?: Preview }

// Project images are lossless crops of the existing portfolio diagrams and screenshots.
// Keep captions and case study copy grounded in those slides and the existing project summaries.
function ProjectPreview({ preview, expanded = false }: { preview: Preview; expanded?: boolean }) {
  const [imageState, setImageState] = useState<{ image: string; status: 'loading' | 'loaded' | 'error' }>({ image: preview.image, status: 'loading' })
  const [x, y, width, height] = preview.rect
  const [sourceWidth, sourceHeight] = preview.sourceSize ?? [1920, 1080]
  const isFullImage = x === 0 && y === 0 && width === sourceWidth && height === sourceHeight
  const status = imageState.image === preview.image ? imageState.status : 'loading'
  return <div className="case-preview" style={{ aspectRatio: `${width} / ${height}` }}>
    {status !== 'loaded' && <span className="preview-placeholder" role={status === 'error' ? 'status' : undefined}>{status === 'error' ? 'Preview unavailable' : 'Loading preview…'}</span>}
    <img key={preview.image} src={preview.image} alt={preview.alt} width={sourceWidth} height={sourceHeight} loading={expanded ? 'eager' : 'lazy'} decoding="async" onLoad={() => setImageState({ image: preview.image, status: 'loaded' })} onError={() => setImageState({ image: preview.image, status: 'error' })} style={isFullImage ? { width: '100%', height: '100%', left: 0, top: 0, objectFit: 'contain' } : { width: `${sourceWidth / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
  </div>
}
type Project = { title: string; category: string; summary: string; stack: string; preview?: Preview; gallery?: Preview[]; links?: { label: string; href: string }[] }

const categories = [
  { id: 'featured', label: 'Featured Projects', description: 'Selected work in infrastructure, cybersecurity, and financial applications.' },
  { id: 'applications', label: 'Applications', description: 'Document libraries, backend services, and an event-response application.' },
  { id: 'ai', label: 'AI Engineering', description: 'Vehicle detection, OCR, geospatial applications, QA automation, and document-grounded assistants.' },
  { id: 'automation', label: 'Automation', description: 'Tools that simplify clipboard workflows, task monitoring, and annotation quality assurance.' },
  { id: 'about', label: 'About', description: 'A curious builder who likes making complex systems easier to understand and use.' },
  { id: 'contact', label: 'Contact', description: 'Have a good problem to solve? Let’s talk.' },
]

const projects: Project[] = [
  { title: 'Homelab', category: 'featured', summary: 'A personal platform running 20+ Dockerized services across three Linux hosts. I work with self-hosting, reverse proxying, Pi-hole and Unbound, Tailscale, network segmentation, monitoring, and ongoing maintenance.', stack: 'Docker · Linux · Networking · Tailscale' },
  { title: '2Phishy', category: 'featured', summary: 'My thesis project: a gamified cybersecurity awareness experience with Phaser gameplay and adaptive assessments, alongside an administration interface and API.', stack: 'Phaser · React · FastAPI · PostgreSQL · MongoDB · Redis', gallery: [assetPreview('2phishy-gameplay.png', '2Phishy learning gameplay with cybersecurity lessons and interactive challenges.', 'Gameplay showing the cybersecurity learning experience.'), assetPreview('2phishydashboard.png', '2Phishy administration dashboard with user scores and performance analytics.', 'Administration dashboard with learner scores and performance analytics.')] },
  { title: 'NamiCash', category: 'featured', summary: 'A self-hosted, multi-user budgeting platform for transaction tracking, budgets, payday-based reporting, dashboards, and user administration. Its data model and migration workflow support consistent financial records across users.', stack: 'React · TypeScript · FastAPI · PostgreSQL · SQLAlchemy · Alembic · Docker', gallery: [assetPreview('namicash-dashboard.png', 'NamiCash personal finance dashboard with account balance and budget charts.', 'NamiCash dashboard and budget overview.'), assetPreview('namicash-budget-settings.png', 'NamiCash budget settings screen with monthly budget controls.', 'Budget settings and allocation controls.')] },
  { title: 'QuantumCash', category: 'featured', summary: 'E-wallet backend microservices for notifications and bank reconciliation, with SendGrid and Stripe integrations.', stack: 'Java · Spring Boot · SendGrid · Stripe' },
  { title: 'Supling’s Repository', category: 'applications', summary: 'A centralized document repository with searchable resources and secure team sharing.', stack: 'Document management · Search · Team sharing', preview: assetPreview('suplings-handbook-dashboard.png', 'Suplings Handbook resource dashboard with document collections.', 'Suplings Handbook document library dashboard.') },
  { title: 'MafuSheets', category: 'applications', summary: 'A self-hosted digital sheet-music library with role-based access, search, and annotation tools.', stack: 'Self-hosting · Role-based access · Search · Annotations', gallery: [assetPreview('mafusheets-dashboard-with-sheets.png', 'MafuSheets library dashboard displaying sheet-music collections.', 'MafuSheets library with sheet music.'), assetPreview('mafusheets-dashboard.png', 'MafuSheets dashboard with music library navigation.', 'MafuSheets library dashboard.'), assetPreview('mafusheets-details.png', 'MafuSheets sheet-music detail and annotation view.', 'Sheet-music details and annotation tools.')] },
  { title: 'ZoopWallet', category: 'applications', summary: 'An internship backend modernization project migrating microservices from JavaScript to TypeScript while maintaining API compatibility.', stack: 'JavaScript · TypeScript · Microservices · REST APIs' },
  { title: 'Business Application', category: 'applications', summary: 'A custom platform for collecting and managing event responses.', stack: 'Web application', preview: assetPreview('rsvp.png', 'Event RSVP page with invitation details and response fields.', 'Event invitation and RSVP form.') },
  { title: 'CrossPlate', category: 'ai', summary: 'Vehicle detection and license-plate recognition using YOLOv5 and OCR.', stack: 'YOLOv5 · OCR · Vehicle detection · License-plate recognition', gallery: [assetPreview('Crossplate-license-detail.png', 'CrossPlate license-plate crop with the detected plate number.', 'Zoomed license-plate crop with the plate number clearly visible.'), assetPreview('crossplate-detection-summary.png', 'CrossPlate detection summary showing vehicle and license-plate detection results.', 'Supporting vehicle and license-plate detection summary.')] },
  { title: 'WaterCatch', category: 'ai', summary: 'A geospatial application that combines historical weather data and mapping to identify potential high-sales locations.', stack: 'Geospatial mapping · Historical weather data', preview: assetPreview('watercatch.png', 'WaterCatch map with location results and search filters.', 'WaterCatch location map and search controls.') },
  { title: 'Agent001', category: 'ai', summary: 'A Streamlit web application for QA automation and Selenium generation, with file upload and structured test results.', stack: 'Streamlit · QA automation · Selenium', preview: assetPreview('Agent001.png', 'Agent001 interface with test upload and generated QA results.', 'Agent001 upload and test-results panel.') },
  { title: 'AI Digital Assistant', category: 'ai', summary: 'A ReAct-based assistant using document-grounded reasoning and retrieval augmented generation, with prompt engineering, guardrails, and facial-recognition-based access control. The automotive client remains unnamed under NDA.', stack: 'ReAct · RAG · Prompt engineering · Facial recognition' },
  { title: 'ClipCue', category: 'automation', summary: 'A desktop workflow tool for global hotkeys and multi-step clipboard tasks, with CSV import/export and portable profiles to reduce repetitive work.', stack: 'Hotkey automation · Clipboard workflows · CSV', gallery: [assetPreview('Clipcue.png', 'ClipCue desktop interface with clipboard slots and saved workflows.', 'ClipCue clipboard slots and workflow controls.'), assetPreview('clipcue-hotkey-selection.png', 'ClipCue hotkey selection interface with reusable clipboard actions.', 'ClipCue hotkey selection and workflow details.')] },
  { title: 'ClipWatcher', category: 'automation', summary: 'An automated monitoring system that tracks available annotation tasks and sends Telegram and phone notifications.', stack: 'Task monitoring · Notifications · Automation', preview: assetPreview('clipwatcher.png', 'ClipWatcher task monitor with queue status and notification settings.', 'ClipWatcher monitoring and notification controls.') },
  { title: 'ClipTrack', category: 'automation', summary: 'A dashboard providing summaries and analytics from annotation-task monitoring, with queue, history, and reporting views.', stack: 'Monitoring analytics · Dashboard · Reporting', preview: assetPreview('cliptrack.png', 'ClipTrack monitoring dashboard with task counts and queue analytics.', 'ClipTrack queue and monitoring dashboard.') },
  { title: 'ClipQA', category: 'automation', summary: 'A CSV quality-assurance tool for validating annotations, detecting inconsistencies, and improving dataset quality.', stack: 'CSV validation · Annotation QA', preview: assetPreview('clipqa.png', 'ClipQA CSV validation interface with issue summary and annotation review table.', 'ClipQA annotation validation and review results.') },
]

const caseStudies: Record<string, CaseStudy> = {
  'AI Digital Assistant': {
    context: 'AI internship · Enterprise assistant',
    purpose: 'An enterprise assistant with avatar, chat, and voice interfaces, grounded in documents and designed to control access before requests reach the language model.',
    contribution: 'During my AI internship, I worked on document-grounded reasoning, retrieval augmented generation, prompt design, response guardrails, and facial-recognition-based access control.',
    details: ['ReAct-based reasoning and RAG connect the assistant to document knowledge.', 'An authorization and validation layer sits before the assistant service, with identity-aware knowledge retrieval.', 'The interface supports speech-to-text and text-to-speech alongside chat.'],
    preview: { image: imagePath('projects/7-747-301.png'), sourceSize: [1120, 607], rect: [0, 0, 1120, 607], alt: 'Redacted AI assistant architecture: avatar web client, API gateway, authorization layer, assistant and language model services, speech service, and facial recognition with redacted identity and event stores.', caption: 'Architecture overview from the portfolio. Identity and event stores are redacted; the automotive client remains unnamed under NDA.' },
  },
  'NamiCash': {
    context: 'Personal finance · Self-hosted application',
    purpose: 'A multi-user budgeting platform for tracking transactions, monthly budgets, payday allowances, and financial activity.',
    contribution: 'I built the self-hosted platform, including transaction tracking, reporting, dashboards, and user administration, with a data model and migration workflow for consistent financial records.',
    details: ['React and TypeScript provide the web interface; FastAPI serves the backend.', 'PostgreSQL, SQLAlchemy, and Alembic support persistence and database migrations.', 'Budget and payday views sit alongside reporting and invite-only user management.'],
    preview: assetPreview('namicash-dashboard.png', 'NamiCash personal finance dashboard with account balance and budget charts.', 'NamiCash dashboard and budget overview.'),
  },
  '2Phishy': {
    context: 'Thesis · Cybersecurity learning',
    purpose: 'A gamified learning platform that combines security lessons with adaptive assessments and multi-level gameplay.',
    contribution: 'My thesis work brings together Phaser gameplay, adaptive assessments, an administration interface, and an API for the learning experience.',
    details: ['Phaser gameplay integrates security lessons and personalized question sets.', 'React and FastAPI connect the interface and API, with PostgreSQL, MongoDB, and Redis in the stack.', 'Administration and analytics support content management, learning progress, and assessment performance.'],
    preview: assetPreview('2phishy-gameplay.png', '2Phishy learning gameplay with cybersecurity lessons and interactive challenges.', 'Gameplay showing the cybersecurity learning experience.'),
  },
  'Homelab': {
    context: 'Personal infrastructure · Ongoing operation',
    purpose: 'A hands-on platform for running self-hosted services and learning through the operation of real infrastructure.',
    contribution: 'I run and maintain 20+ Dockerized services across three Linux hosts, working on reverse proxying, DNS, remote access, network segmentation, and monitoring.',
    details: ['Nginx reverse proxying and a VPS provide public service access.', 'Tailscale supports private access; network segmentation separates device groups.', 'Pi-hole and Unbound handle DNS filtering, alongside service monitoring and ongoing maintenance.'],
    preview: { image: imagePath('projects/3-610-157.png'), sourceSize: [1261, 841], rect: [0, 0, 1261, 841], alt: 'Homelab topology showing a public VPS, home Docker host, segmented home network, storage, backups, and Tailscale access.', caption: 'Infrastructure overview: public and private access paths, Docker services, and segmented networks.' },
  },
  'QuantumCash': {
    context: 'Software engineering internship · Backend services',
    purpose: 'E-wallet backend services for notification delivery and bank-reconciliation workflows.',
    contribution: 'I contributed Java/Spring Boot microservices and SendGrid and Stripe integrations to QuantumCash.',
    details: ['QuantumCash was an internship team project involving REST APIs, notification delivery, and bank reconciliation.', 'The diagram shows service boundaries and external provider integrations.'],
    preview: { image: imagePath('projects/5-650-169.png'), sourceSize: [1204, 803], rect: [0, 0, 1204, 803], alt: 'QuantumCash Spring Boot service diagram showing user, account, reconciliation, transaction, payment, and notification services with Stripe and SendGrid.', caption: 'QuantumCash service architecture and external provider integrations.' },
  },
  'ZoopWallet': {
    context: 'Software engineering internship · Backend modernization',
    purpose: 'Modernize existing backend microservices while preserving the API used by clients.',
    contribution: 'I migrated backend microservices from JavaScript to TypeScript while maintaining API compatibility.',
    details: ['Individual internship migration project.', 'The work focused on the existing backend API and its JavaScript-to-TypeScript migration.'],
  },
  'Business Application': {
    context: 'Event coordination · Forms integration',
    purpose: 'A personalized RSVP interface that collects event responses through an existing Google Forms workflow.',
    contribution: 'I created a custom interface over Google Forms and reverse-engineered form submission endpoints to connect the RSVP experience to the existing workflow.',
    details: ['Google Sites and HTML provide the custom presentation.', 'Google Forms and Google Sheets support response collection and the existing event workflow.'],
    preview: assetPreview('rsvp.png', 'Event RSVP page with invitation details and response fields.', 'Event invitation and RSVP form.'),
  },
}

// Reuse each project's assigned image; never use the original presentation slides.
const facetCollages = Object.fromEntries(categories.map(category => [
  category.id,
  projects.filter(project => project.category === category.id).flatMap(project => {
    const preview = project.gallery?.[project.gallery.length - 1] ?? project.preview ?? caseStudies[project.title]?.preview
    return preview ? [{ title: project.title, image: preview.image }] : []
  }),
]))

facetCollages.about = [{ title: 'Jahnreil J. Amarillento', image: imagePath('mafu-mark.png') }]

const DRAG_THRESHOLD = 7
const categoryIds = categories.map(category => category.id)
const projectCounts = Object.fromEntries(categories.map(category => [category.id, projects.filter(project => project.category === category.id).length]))
const readCurrentLocation = () => readPortfolioLocation(new URL(window.location.href), categoryIds, projectCounts)
const currentReadingY = (fallback = 0) => {
  if (document.body.style.position === 'fixed') {
    const top = Number.parseFloat(document.body.style.top)
    if (Number.isFinite(top) && top < 0) return -top
    return fallback
  }
  return window.scrollY
}

export default function App() {
  const [initialLocation] = useState(readCurrentLocation)
  const [view, setView] = useState<PortfolioView>(initialLocation.view)
  const [selectedCategory, setSelectedCategory] = useState(initialLocation.category)
  const selectedCategoryRef = useRef(initialLocation.category)
  const readingYRef = useRef(window.scrollY)
  const [lightboxSlide, setLightboxSlide] = useState<Slide | null>(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [motionPaused, setMotionPaused] = useState(false)
  const [exploring, setExploring] = useState(initialLocation.exploring)
  const [menuOpen, setMenuOpen] = useState(false)
  const [gestureHint, setGestureHint] = useState(() => {
    try { return localStorage.getItem('cube-learned') !== 'true' } catch { return true }
  })
  const [compactViewport, setCompactViewport] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  const [mobileViewport, setMobileViewport] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [cubeExpanded, setCubeExpanded] = useState(false)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const floatingCube = mobileViewport && exploring && view === 'explore'
  const focusedHeader = compactViewport && !mobileViewport && exploring && view === 'explore'
  useEffect(() => {
    if (!floatingCube) return
    const host = document.getElementById('portfolio-cube-host')
    let frame = 0
    let obscured = false
    const update = () => {
      frame = 0
      const aside = host?.querySelector<HTMLElement>('.mobile-floating')
      const cube = aside?.querySelector<HTMLElement>('.cube')
      const experience = document.getElementById('experience')
      if (!aside || !cube || !experience || getComputedStyle(aside).display === 'none') {
        aside?.classList.remove('is-reading-obscured')
        obscured = false
        return
      }
      if (cubeExpanded || cube.contains(document.activeElement)) {
        aside.classList.remove('is-reading-obscured')
        obscured = false
        return
      }
      const cubeRect = cube.getBoundingClientRect()
      const clearance = obscured ? 24 : 0
      const bounds = {
        left: cubeRect.left - clearance,
        right: cubeRect.right + clearance,
        top: cubeRect.top - clearance,
        bottom: cubeRect.bottom + clearance,
      }
      obscured = Array.from(experience.querySelectorAll<HTMLElement>('p, h2, h3, .eyebrow, .timeline-date')).some(element => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return Array.from(range.getClientRects()).some(rect => rect.width > 0 && rect.height > 0 &&
          rect.right > bounds.left && rect.left < bounds.right && rect.bottom > bounds.top && rect.top < bounds.bottom)
      })
      aside.classList.toggle('is-reading-obscured', obscured)
    }
    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update) }
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) cancelAnimationFrame(frame)
      host?.querySelector('.mobile-floating')?.classList.remove('is-reading-obscured')
    }
  }, [floatingCube, cubeExpanded, selectedCategory, view, menuOpen, lightboxSlide])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => { setMobileViewport(media.matches); setCubeExpanded(false) }
    media.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    }
  }, [])
  const [cubeHost] = useState(() => document.createElement('div'))
  const headerCubeSlot = useRef<HTMLDivElement>(null)
  const workspaceCubeSlot = useRef<HTMLDivElement>(null)
  const [currentProject, setCurrentProject] = useState('')
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const update = () => setCompactViewport(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  // The portal target never changes: moving its host preserves the renderer,
  // native touch listener, rotation, and face state across layout transitions.
  useLayoutEffect(() => {
    cubeHost.style.display = 'contents'
    cubeHost.id = 'portfolio-cube-host'
    const slot = floatingCube ? document.body : focusedHeader ? headerCubeSlot.current : workspaceCubeSlot.current
    slot?.appendChild(cubeHost)
    return () => { cubeHost.remove() }
  }, [cubeHost, focusedHeader, floatingCube, view])
  useEffect(() => {
    if (!focusedHeader) return
    const updateProject = () => {
      const stories = Array.from(readingRef.current?.querySelectorAll<HTMLElement>('.project-story') ?? [])
      const boundary = (headerCubeSlot.current?.getBoundingClientRect().bottom ?? 170) + 40
      const story = stories.find(item => item.getBoundingClientRect().bottom > boundary)
      setCurrentProject(story?.querySelector('h2')?.textContent ?? '')
    }
    updateProject()
    window.addEventListener('scroll', updateProject, { passive: true })
    return () => window.removeEventListener('scroll', updateProject)
  }, [focusedHeader, selectedCategory])
  const menuRef = useRef<HTMLDialogElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const learnCube = () => {
    if (!gestureHint) return
    setGestureHint(false)
    try { localStorage.setItem('cube-learned', 'true') } catch { /* Storage may be unavailable. */ }
  }
  useEffect(() => {
    if (!menuOpen) return
    const dialog = menuRef.current
    dialog?.showModal()
    return () => {
      dialog?.close()
      menuTriggerRef.current?.focus({ preventScroll: true })
    }
  }, [menuOpen])
  const overlayOpen = menuOpen || lightboxSlide !== null
  useLayoutEffect(() => {
    if (!overlayOpen) return
    const body = document.body
    const properties = ['overflow', 'position', 'top', 'width'] as const
    const previous = properties.map(name => [name, body.style.getPropertyValue(name), body.style.getPropertyPriority(name)] as const)
    const scrollY = currentReadingY(readingYRef.current)
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    return () => {
      previous.forEach(([name, value, priority]) => {
        if (value) body.style.setProperty(name, value, priority)
        else body.style.removeProperty(name)
      })
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [overlayOpen])
  const lightboxRef = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    if (!lightboxSlide) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = lightboxRef.current
    dialog?.showModal()
    dialog?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    return () => {
      dialog?.close()
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [lightboxSlide])
  const explorerRef = useRef<HTMLElement>(null)

  const pushPortfolioLocation = (category: string, nextView: PortfolioView, nextExploring: boolean, hash: string, includeCategory = nextExploring || nextView === 'simple') => {
    const currentState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {}
    window.history.replaceState({ ...currentState, __portfolioScrollY: currentReadingY(readingYRef.current) }, '', window.location.href)
    const nextUrl = portfolioUrl(new URL(window.location.href), category, nextView, nextExploring, hash, includeCategory)
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (nextUrl !== currentUrl) window.history.pushState({ ...currentState, __portfolioScrollY: 0 }, '', nextUrl)
  }
  const commitCategory = (id: string, rotate = false) => {
    if (!categoryIds.includes(id)) return
    if (rotate) {
      const face = cubeFaces.find(item => item.category === id)
      if (face) selectRotation({ x: -face.rotateX - 15, y: -face.rotateY - 22 })
    }
    pushPortfolioLocation(id, view, true, '')
    selectedCategoryRef.current = id
    setSelectedCategory(id)
    setExploring(true)
    setMenuOpen(false)
    requestAnimationFrame(() => { readingYRef.current = 0; window.scrollTo({ top: 0, behavior: 'instant' }) })
  }
  const openExplorer = (id = selectedCategory) => {
    commitCategory(id, true)
    learnCube()
  }
  const changeView = (nextView: PortfolioView) => {
    const nextExploring = exploring || nextView === 'simple'
    pushPortfolioLocation(selectedCategory, nextView, nextExploring, window.location.hash, nextExploring)
    setView(nextView)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (view !== 'explore' || exploring) return
    const onScroll = () => {
      if (!window.matchMedia('(max-width: 700px)').matches && window.scrollY > 90) setExploring(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [view, exploring])
  const cubeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cube = cubeRef.current
    if (!cube) return
    // Native, non-passive handling also blocks viewport panning on mobile Safari.
    // Keep the listener on the cube so the surrounding page scrolls normally.
    const preventCubeScroll = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault()
    }
    cube.addEventListener('touchmove', preventCubeScroll, { passive: false })
    return () => cube.removeEventListener('touchmove', preventCubeScroll)
  }, [])
  const { rotationRef, applyRotation, selectRotation, beginDrag, endDrag } = useCubeMotion(cubeRef, {
    motionEnabled: !reducedMotion && !motionPaused,
    reducedMotion,
    active: view === 'explore' && !overlayOpen,
    gestureHint,
  })
  const selectRotationRef = useRef(selectRotation)
  selectRotationRef.current = selectRotation
  const restoreSequenceRef = useRef(0)
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    let scrollFrame = 0
    let restoreFrameOne = 0
    let restoreFrameTwo = 0
    const stateWithScroll = (state: unknown, scrollY: number) => ({
      ...(state && typeof state === 'object' ? state : {}),
      __portfolioScrollY: scrollY,
    })
    const saveScroll = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        if (document.body.style.position !== 'fixed') {
          readingYRef.current = window.scrollY
          window.history.replaceState(stateWithScroll(window.history.state, readingYRef.current), '', window.location.href)
        }
      })
    }
    const applyLocation = (entryState: unknown, initial = false) => {
      const next = readCurrentLocation()
      const categoryChanged = next.category !== selectedCategoryRef.current
      selectedCategoryRef.current = next.category
      setSelectedCategory(next.category)
      setView(next.view)
      setExploring(next.exploring)
      if (initial || categoryChanged) {
        const face = cubeFaces.find(item => item.category === next.category)
        if (face) selectRotationRef.current({ x: -face.rotateX - 15, y: -face.rotateY - 22 })
      }
      const sequence = ++restoreSequenceRef.current
      const state = entryState && typeof entryState === 'object' ? entryState as { __portfolioScrollY?: unknown } : null
      const savedY = typeof state?.__portfolioScrollY === 'number' ? state.__portfolioScrollY : 0
      cancelAnimationFrame(restoreFrameOne)
      cancelAnimationFrame(restoreFrameTwo)
      restoreFrameOne = requestAnimationFrame(() => {
        restoreFrameTwo = requestAnimationFrame(() => {
          if (sequence !== restoreSequenceRef.current) return
          if (next.hash && scrollToPortfolioHash(next.hash)) {
            readingYRef.current = window.scrollY
            return
          }
          readingYRef.current = savedY
          window.scrollTo({ top: savedY, behavior: 'instant' })
        })
      })
    }
    const onPopState = (event: PopStateEvent) => applyLocation(event.state)
    const onHashChange = () => applyLocation(window.history.state)
    if (!window.history.state || typeof window.history.state !== 'object') {
      window.history.replaceState(stateWithScroll(window.history.state, currentReadingY()), '', window.location.href)
    } else if (typeof (window.history.state as { __portfolioScrollY?: unknown }).__portfolioScrollY !== 'number') {
      window.history.replaceState(stateWithScroll(window.history.state, currentReadingY()), '', window.location.href)
    }
    applyLocation(window.history.state, true)
    window.addEventListener('scroll', saveScroll, { passive: true })
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener('scroll', saveScroll)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
      cancelAnimationFrame(scrollFrame)
      cancelAnimationFrame(restoreFrameOne)
      cancelAnimationFrame(restoreFrameTwo)
    }
  }, [])
  const dragRef = useRef({ active: false, pointerId: -1, moved: false, startX: 0, startY: 0, lastX: 0, lastY: 0 })
  const suppressClickRef = useRef(false)
  const coveredActionRef = useRef<HTMLElement | null>(null)
  const captureTargetRef = useRef<HTMLElement | null>(null)
  const category = categories.find((item) => item.id === selectedCategory) ?? categories[0]
  const categoryProjects = projects.filter((project) => project.category === selectedCategory)
  const frontFace = (next: Rotation) => cubeFaces.reduce((front, face) =>
    getFaceFacing(face.normal, next) > getFaceFacing(front.normal, next) ? face : front)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (dragRef.current.active || !event.isPrimary) return
    coveredActionRef.current = null
    if (mobileViewport && cubeRef.current?.closest('.mobile-floating')) {
      const cubeHost = document.getElementById('portfolio-cube-host')
      const underCube = document.elementsFromPoint(event.clientX, event.clientY)
        .find(element => !cubeHost?.contains(element))
      const action = underCube?.closest<HTMLElement>('a, button, input, summary, [role="button"]')
      if (action && !(action instanceof HTMLButtonElement && action.disabled)) coveredActionRef.current = action
    }
    if (mobileViewport) {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
      setCubeExpanded(true)
    }
    beginDrag()
    const target = event.target instanceof HTMLElement ? event.target : cubeRef.current
    target?.setPointerCapture(event.pointerId); captureTargetRef.current = target
    dragRef.current = { active: true, pointerId: event.pointerId, moved: false, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY }
    suppressClickRef.current = false
  }
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.lastX, dy = event.clientY - drag.lastY
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > DRAG_THRESHOLD) drag.moved = true
    if (drag.moved) {
      coveredActionRef.current = null
      learnCube()
      applyRotation(turnCube(rotationRef.current, -dy * .42, dx * .42))
    }
    drag.lastX = event.clientX; drag.lastY = event.clientY
  }
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return
    if (mobileViewport) {
      // Leave time for a face tap after rotating, then collapse smoothly.
      collapseTimerRef.current = setTimeout(() => setCubeExpanded(false), 700)
    }
    const completed = event.type === 'pointerup'
    const coveredAction = coveredActionRef.current
    coveredActionRef.current = null
    drag.active = false; suppressClickRef.current = drag.moved || !completed
    if (completed && !drag.moved && coveredAction?.isConnected) suppressClickRef.current = true
    // A near-edge orientation has no clear destination. Keep the committed
    // category until a deliberate face click or an unambiguous completed drag.
    if (completed && drag.moved && exploring && view === 'explore') {
      const ranked = cubeFaces.map(face => ({ face, facing: getFaceFacing(face.normal, rotationRef.current) }))
        .sort((a, b) => b.facing - a.facing)
      if (ranked[0].facing - ranked[1].facing >= .2 && ranked[0].face.category !== selectedCategoryRef.current) commitCategory(ranked[0].face.category)
    }
    const target = captureTargetRef.current
    if (target?.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
    captureTargetRef.current = null
    endDrag()
    if (completed && !drag.moved && coveredAction?.isConnected) coveredAction.click()
  }
  const handleFaceClick = (id: string, event: React.MouseEvent) => {
    if (suppressClickRef.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; return }
    suppressClickRef.current = false
    openExplorer(id)
  }
  const returnToLanding = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    suppressClickRef.current = false
    setLightboxSlide(null)
    pushPortfolioLocation(selectedCategory, 'explore', false, '#top', true)
    setView('explore')
    setExploring(false)
    setMenuOpen(false)
    requestAnimationFrame(() => { readingYRef.current = 0; window.scrollTo({ top: 0, behavior: 'instant' }) })
  }
  const handleCubeKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      event.preventDefault()
      openExplorer(frontFace(rotationRef.current).category)
      return
    }
    const offsets: Record<string, Rotation> = { ArrowLeft: { x: 0, y: -15 }, ArrowRight: { x: 0, y: 15 }, ArrowUp: { x: 15, y: 0 }, ArrowDown: { x: -15, y: 0 } }
    const offset = offsets[event.key]
    if (!offset) return
    event.preventDefault()
    learnCube()
    applyRotation(turnCube(rotationRef.current, offset.x, offset.y))
  }

  const toggleMotion = () => {
    setMotionPaused(paused => !paused)
  }

  return <div className="site-shell" id="top">
    <a className="skip-link" href="#portfolio">Skip to content</a>
    <header className={`site-header ${focusedHeader ? 'focused-header' : ''}`}><nav className="nav" aria-label="Main navigation">
      <a className="brand" href="#top" onClick={returnToLanding}><img className="brand-logo" src={decorativeImage(imagePath('MafuLogo.png'))} decoding="async" alt="" /><strong>Jahnreil J. Amarillento</strong><span className="brand-alias">/ Mafu</span></a>
      <button ref={menuTriggerRef} className="menu-trigger" aria-label="Open section navigation" aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="section-menu" onClick={() => setMenuOpen(true)}><Menu size={24} /></button><div className="nav-links"><a className="header-contact" href="mailto:amarillentojahnreil@gmail.com">Contact</a><span className="view-switch" aria-label="View mode"><button className={view === 'explore' ? 'view-link active' : 'view-link'} onClick={() => changeView('explore')} aria-pressed={view === 'explore'}>Explore</button><button className={view === 'simple' ? 'view-link active' : 'view-link'} onClick={() => changeView('simple')} aria-pressed={view === 'simple'}>Simplified</button></span></div>
    </nav><div ref={headerCubeSlot} className="header-cube-slot cube-experience is-exploring" /></header>

    <dialog ref={menuRef} id="section-menu" className="section-menu" aria-labelledby="menu-title" onCancel={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMenuOpen(false) }} onKeyDown={event => {
      if (event.key === 'Tab') {
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        return
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
      const links = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('nav .menu-destination'))
      const current = links.indexOf(document.activeElement as HTMLButtonElement)
      event.preventDefault()
      links[event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + links.length) % links.length]?.focus()
    }}>
      <div className="menu-panel"><div className="menu-heading"><h2 id="menu-title">Explore the portfolio</h2><button autoFocus aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button></div>
        <nav aria-label="Portfolio sections">{cubeFaces.map(face => <button className="menu-destination" key={face.id} aria-current={selectedCategory === face.category ? 'page' : undefined} onClick={() => openExplorer(face.category)}>{face.label}<ArrowDownRight size={18} /></button>)}</nav>
        <div className="menu-view-switch view-switch" aria-label="View mode"><button className="view-link" aria-pressed={view === 'explore'} onClick={() => changeView('explore')}>Explore</button><button className="view-link" aria-pressed={view === 'simple'} onClick={() => changeView('simple')}>Simplified</button></div>
        <button className="menu-destination" disabled={reducedMotion} aria-pressed={motionPaused} onClick={toggleMotion}>{reducedMotion ? 'Motion disabled by your system preference' : motionPaused ? 'Resume motion' : 'Pause motion'}{motionPaused || reducedMotion ? <Play size={16} /> : <Pause size={16} />}</button>
        <p>Choose a section or explore with the cube.</p>
      </div>
    </dialog>
    <main ref={explorerRef} className={`explore cube-experience ${exploring || view === 'simple' ? 'is-exploring' : 'is-intro'} ${view === 'simple' ? 'facet-simple' : ''}`} id="portfolio">
      {view === 'simple' && <nav className="facet-navigation" aria-label="Portfolio facets">{categories.map(item => <button key={item.id} aria-pressed={item.id === selectedCategory} onClick={() => openExplorer(item.id)}>{item.label}</button>)}</nav>}
      <div className="cube-workspace">
        <div ref={readingRef} className="explorer-reading">
          {!exploring && view === 'explore' ? <section className="landing-intro" aria-labelledby="hero-title">
            <p className="eyebrow">Jahnreil / Mafu · Software engineer</p>
            <h1 id="hero-title">There has to be a better way.</h1>
            <p>That’s usually where I start: understanding the workflow, shaping the system, and building software that’s easier to use, run, and maintain.</p>
            <button className="text-link" onClick={() => openExplorer()}>Select a face to explore <ArrowDownRight size={16} /></button>
          </section> : <section className="explorer-content" id="work" aria-labelledby="category-title">
            <div className="panel-kicker"><span>Inside the cube</span><span>{String(categories.indexOf(category) + 1).padStart(2, '0')} / 06</span></div>
            <div key={selectedCategory} className="section-reveal">
              <h1 id="category-title" aria-live="polite">{category.label}</h1>
              <p className="category-description">{category.description}</p>
              {selectedCategory === 'about' && <div id="about"><p className="about-note">I’m Jahnreil J. Amarillento — Mafu. I build backend services, self-hosted platforms, and applied AI workflows.</p><p className="about-note">I’m a musician and Rubik’s Cube solver. Finding patterns in music and breaking a solve into steps both shape how I approach complex problems.</p><section className="content-section" id="experience"><div className="section-heading"><p className="eyebrow">Professional experience</p><h2>Experience</h2></div><article className="timeline-entry"><div className="timeline-date">Jun — Dec 2024</div><div><h3>Stratpoint Global Outsourcing</h3><p className="role">Software Engineer Intern (Java Developer) · Jun — Sep 2024</p><p>Contributed to QuantumCash and ZoopWallet services, including notification and bank-reconciliation workflows, third-party integrations, and backend migration work.</p><p className="role">AI Intern · Sep — Dec 2024</p><p>Worked on an AI digital assistant using document-grounded reasoning, retrieval augmented generation, prompt design, guardrails, and access control.</p></div></article></section>
        <section className="content-section two-column-section" id="education"><div><p className="eyebrow">In progress</p><h2>Education</h2><p><strong>Mapúa University</strong><br />B.S. Information Technology<br />Expected 2026</p></div><div><p className="eyebrow">Current learning</p><h2>Learning now</h2><p>Terraform and Ansible for infrastructure as code; system design, Kubernetes, CI/CD, and post-deployment monitoring and maintenance.</p><p className="small-note">These are current learning areas, distinct from the hands-on projects above.</p></div></section>
        <section className="content-section skills-section"><div className="section-heading"><p className="eyebrow">Tools and practice</p><h2>Skills</h2></div><div className="skill-lines"><p><strong>Backend</strong><span>Java · Spring Boot · Python · FastAPI · TypeScript · REST APIs</span></p><p><strong>Data</strong><span>PostgreSQL · MongoDB · Redis · SQLAlchemy · Alembic</span></p><p><strong>Platform</strong><span>Linux · Docker · Networking · Tailscale · Monitoring</span></p><p><strong>AI Engineering</strong><span>RAG · Prompt engineering · Guardrails · Computer vision</span></p></div></section>
        </div>}
              {categoryProjects.length > 0 && <details className="project-index" open>
                <summary><span>Projects in this category <span className="project-index-count">({categoryProjects.length})</span></span><span className="project-index-toggle" aria-hidden="true" /></summary>
                <nav aria-label={`${category.label} project index`}>
                  <ol>{categoryProjects.map((project, i) => <li key={project.title}>
                    <a href={`#project-${selectedCategory}-${i + 1}`}><span className="project-index-number">{String(i + 1).padStart(2, '0')}</span><span><strong>{project.title}</strong><span className="project-index-description">{project.summary}</span></span><ArrowDownRight size={16} aria-hidden="true" /></a>
                  </li>)}</ol>
                </nav>
              </details>}
              <div className="project-stories">{categoryProjects.map((project, i) => {
                const study = caseStudies[project.title]
                const preview = study?.preview ?? project.preview
                const previews = project.gallery ?? (preview ? [preview] : [])
                return <article className="project-story case-study" id={`project-${selectedCategory}-${i + 1}`} tabIndex={-1} key={project.title}>
                  <header className="case-heading"><p className="eyebrow">0{i + 1} / {study?.context ?? project.stack}</p><h2>{project.title}</h2></header>
                  {previews.length ? <div className={project.title === 'CrossPlate' ? 'crossplate-gallery' : project.gallery ? 'project-image-gallery' : undefined}>
                    {previews.map((item, index) => <figure className="case-figure" key={item.image}>
                      <button className="preview-button" aria-label={`Enlarge ${project.title} preview${project.gallery ? ` ${index + 1}` : ''}`} onClick={() => setLightboxSlide({ number: '', title: project.title, image: item.image, preview: item })}><ProjectPreview preview={item} /><span className="preview-action">Enlarge preview <ExternalLink size={14} /></span></button>
                      <figcaption>{item.caption}</figcaption>
                    </figure>)}
                    {project.title === 'CrossPlate' && <aside className="crossplate-ocr" aria-label="CrossPlate OCR result availability"><h3>OCR result</h3><p>OCR output is not included in the available source screenshots.</p><p>The actual OCR result is still needed to complete this sequence.</p></aside>}
                  </div> : <div className="preview-placeholder">Project-specific image still needed for {project.title}</div>}
                  <div className="case-narrative">
                    <section><h3>Purpose</h3><p>{study?.purpose ?? project.summary}</p></section>
                    {study && <><section><h3>My contribution</h3><p>{study.contribution}</p></section><section><h3>Technical details</h3><ul>{study.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></section></>}
                  </div>
                  <div className="stack-tags" aria-label="Technologies and practices">{project.stack.split(' · ').map((tech) => <span key={tech}>{tech}</span>)}</div>
                  {project.links && <div className="case-links">{project.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <ExternalLink size={14} /></a>)}</div>}
                </article>
              })}</div>
              {selectedCategory === 'contact' && <section className="contact-section" id="contact"><p className="eyebrow">Have a good problem to solve?</p><h2>Let’s talk.</h2><a href="mailto:amarillentojahnreil@gmail.com">amarillentojahnreil@gmail.com <ArrowDownRight size={16} /></a><div className="contact-links"><a href="https://github.com/Mafunamiii" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/jahnreilamarillento" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://projects.mafunami.me" target="_blank" rel="noreferrer">projects.mafunami.me</a></div></section>}

            </div>
          </section>}
        </div>
        <div ref={workspaceCubeSlot} className="workspace-cube-slot" />
        {createPortal(<aside className={`visual-column ${floatingCube ? 'mobile-floating' : ''} ${cubeExpanded ? 'is-expanded' : ''}`} aria-label="Interactive portfolio cube" style={mobileViewport && (view !== 'explore' || menuOpen || lightboxSlide) ? { display: 'none' } : undefined}><div className="cube-sticky"><div className="focused-context"><span>{category.label}</span><strong>{currentProject || category.label}</strong></div><h2 className="cube-explore-title">Explore the Cube</h2><p className="cube-caption"><span>{exploring ? `Exploring / ${category.label}` : `Selected / ${category.label}`}</span><span>Drag / tap to explore</span></p><div className="cube-stage"><div ref={cubeRef} className="cube" style={{ transform: `rotateX(${LANDING_ROTATION.x}deg) rotateY(${LANDING_ROTATION.y}deg) rotateZ(0deg)` }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onLostPointerCapture={event => { if (dragRef.current.active) handlePointerUp(event) }} tabIndex={0} onKeyDown={handleCubeKey} aria-describedby="cube-instructions" aria-label="Freely rotatable portfolio cube">{cubeFaces.map((face) => {
        return <button key={face.id} className={`cube-face cube-${face.id} ${face.category === selectedCategory ? 'is-selected' : ''} ${face.category === 'about' ? 'has-logo' : ''}`} onClick={(event) => handleFaceClick(face.category, event)} aria-label={`Select ${face.label}`} aria-pressed={face.category === selectedCategory}><span className="tile-grid" aria-hidden="true">{Array.from({ length: 9 }, (_, tile) => <span className="cube-tile" key={tile} />)}</span>{face.category !== 'about' && facetCollages[face.category].length > 0 && <span className="facet-collage" aria-hidden="true">{facetCollages[face.category].map(item => <img key={item.title} src={decorativeImage(item.image)} decoding="async" alt="" draggable={false} />)}</span>}<span className="face-overlay" aria-hidden="true">{face.category === 'about' ? <span className="about-face-content"><span className="about-face-logo"><img src={imagePath('mafu-mark.png')} decoding="async" alt="" draggable={false} /></span><span className="face-lettering"><span className="face-title">{face.label}</span></span></span> : <span className="face-lettering"><span className="face-title">{face.label}</span></span>}</span></button>
      })}</div></div><p className="cube-selection">Selected / <strong>{category.label}</strong></p>{gestureHint && <p className="gesture-hint"><span aria-hidden="true">↔</span> Swipe to rotate<br />Tap a face to explore</p>}<div className="cube-controls"><p className="cube-help" id="cube-instructions"><span className="pointer-instructions">Drag to rotate · Select a face to explore<br /></span><span className="keyboard-instructions">Keyboard: arrows to rotate; Enter to select.</span></p><button className="motion-toggle" disabled={reducedMotion} aria-label={reducedMotion ? 'Motion disabled by your system preference' : motionPaused ? 'Resume motion' : 'Pause motion'} title={motionPaused ? 'Resume motion' : 'Pause motion'} onClick={toggleMotion} aria-pressed={motionPaused}>{motionPaused || reducedMotion ? <Play size={16} /> : <Pause size={16} />}</button></div></div></aside>, cubeHost)}
      </div>
    </main>

    <footer className="site-footer"><p>Jahnreil J. Amarillento <span>·</span> Mafu</p><div><a href="mailto:amarillentojahnreil@gmail.com">Email</a><a href="https://github.com/Mafunamiii" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/jahnreilamarillento" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://projects.mafunami.me" target="_blank" rel="noreferrer">Portfolio</a></div></footer>
    {lightboxSlide && <dialog ref={lightboxRef} className="lightbox" onKeyDown={event => {
      // The close button is the preview's only interactive element.
      if (event.key === 'Tab') {
        event.preventDefault()
        event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }} onCancel={() => setLightboxSlide(null)} aria-label={`${lightboxSlide.title} fullscreen`} onClick={event => { if (event.target === event.currentTarget) setLightboxSlide(null) }}><button className="lightbox-close" onClick={() => setLightboxSlide(null)} aria-label="Close fullscreen image"><X /></button>{lightboxSlide.preview ? <figure className="preview-lightbox" style={{ width: `min(1200px, 100%, calc((100svh - 160px) * ${lightboxSlide.preview.rect[2] / lightboxSlide.preview.rect[3]}))` }} onClick={(event) => event.stopPropagation()}><ProjectPreview preview={lightboxSlide.preview} expanded /><figcaption>{lightboxSlide.preview.caption}</figcaption></figure> : <img src={lightboxSlide.image} alt={`${lightboxSlide.title} portfolio slide fullscreen`} onClick={(event) => event.stopPropagation()} />}</dialog>}
  </div>
}
