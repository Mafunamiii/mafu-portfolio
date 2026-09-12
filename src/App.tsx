import { ArrowUp, Mail, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import './styles.css'

type Slide = { number: string; title: string; image: string }

const slides: Slide[] = [
  { number: '01', title: 'Introduction', image: '/images/1.png' },
  { number: '02', title: 'Engineering Areas', image: '/images/2.png' },
  { number: '03', title: 'HomeLab', image: '/images/3.png' },
  { number: '04', title: '2Phishy', image: '/images/4.png' },
  { number: '05', title: 'QuantumCash / Zoopwallet', image: '/images/5.png' },
  { number: '06', title: 'AI Engineering', image: '/images/6.png' },
  { number: '07', title: 'AI Digital Assistant', image: '/images/7.png' },
  { number: '08', title: 'Automation', image: '/images/8.png' },
  { number: '09', title: 'Knowledge Management', image: '/images/9.png' },
  { number: '10', title: 'NamiCash', image: '/images/10.png' },
  { number: '11', title: 'Custom RSVP Platform', image: '/images/11.png' },
  { number: '12', title: 'What I’m Exploring', image: '/images/12.png' },
]

export default function App() {
  const [lightboxSlide, setLightboxSlide] = useState<Slide | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxSlide(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = lightboxSlide ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxSlide])

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#top"><img className="brand-logo" src="/images/MafuLogo.png" alt="Mafu logo" /><strong>Jahnreil Amarillento</strong></a>
          <div className="nav-links">
            <a href="#portfolio">Portfolio</a>
            <a href="mailto:amarillentojahnreil@gmail.com"><Mail size={14} /> Contact</a>
            <a href="https://github.com/mafunamiii" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/jahnreilamarillento" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </nav>
      </header>

      <main className="portfolio" id="portfolio">
        <div className="portfolio-intro"><p>Software Engineer · Backend · Platform · AI</p><span>Selected work and explorations</span></div>
        <div className="slide-list">
          {slides.map((slide, index) => (
            <section className="slide" id={`slide-${slide.number}`} key={slide.image}>
              <div className="slide-heading"><span>{slide.number} —</span><h1>{slide.title}</h1></div>
              <button className="slide-image-button" onClick={() => setLightboxSlide(slide)} aria-label={`Open ${slide.title} image fullscreen`}>
                <img src={slide.image} alt={`${slide.title} portfolio slide`} loading={index < 2 ? 'eager' : 'lazy'} />
              </button>
            </section>
          ))}
        </div>
        <a className="back-to-top" href="#top"><ArrowUp size={14} /> Back to top</a>
      </main>

      <footer className="site-footer"><p>Jahnreil J. Amarillento</p><a href="mailto:amarillentojahnreil@gmail.com">amarillentojahnreil@gmail.com</a></footer>

      {lightboxSlide && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${lightboxSlide.title} fullscreen`} onClick={() => setLightboxSlide(null)}><button className="lightbox-close" onClick={() => setLightboxSlide(null)} aria-label="Close fullscreen image"><X /></button><img src={lightboxSlide.image} alt={`${lightboxSlide.title} portfolio slide fullscreen`} onClick={(event) => event.stopPropagation()} /></div>}
    </div>
  )
}
