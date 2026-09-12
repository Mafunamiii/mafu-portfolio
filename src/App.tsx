import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Code2, Mail, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { exploring, featuredProjects, otherProjects, type Project } from './data/projects'

const areas = [
  { name: 'Backend', index: '01', items: ['REST APIs', 'Microservices', 'Databases'] },
  { name: 'Platform', index: '02', items: ['Linux', 'Docker', 'Networking', 'VPS & Self-Hosting', 'Reverse Proxies'] },
  { name: 'AI Engineering', index: '03', items: ['ReAct agents', 'Computer Vision', 'OCR', 'LLMs'] },
  { name: 'Automation', index: '04', items: ['Desktop applications', 'Workflow automation', 'Internal tools', 'Data processing', 'Productivity software'] },
]

const contactLinks = [
  { label: 'GitHub', detail: 'mafunamiii', href: 'https://github.com/mafunamiii', icon: Code2 },
  { label: 'LinkedIn', detail: 'jahnreilamarillento', href: 'https://www.linkedin.com/in/jahnreilamarillento', icon: BriefcaseBusiness },
  { label: 'Email', detail: 'amarillentojahnreil@gmail.com', href: 'mailto:amarillentojahnreil@gmail.com', icon: Mail },
]

function SectionLabel({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>
}

function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className={`project-card ${compact ? 'compact' : ''}`}>
      {project.image && <a className="project-image" href={project.image} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} image`}><img src={project.image} alt={`${project.title} portfolio visual`} loading="lazy" /></a>}
      <div className="project-copy">
        <div className="project-meta"><span>{project.category}</span>{project.group && <span>{project.group}</span>}</div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="tech-list">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
        {project.link && <a className="text-link" href={project.link} target="_blank" rel="noreferrer">View project <ArrowUpRight size={16} /></a>}
      </div>
    </article>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <header className="nav-wrap"><nav className="nav container" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={closeMenu}><span>JA</span><strong>Jahnreil Amarillento</strong></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}><a href="#areas" onClick={closeMenu}>Areas</a><a href="#work" onClick={closeMenu}>Work</a><a href="#exploring" onClick={closeMenu}>Exploring</a><a className="nav-contact" href="mailto:amarillentojahnreil@gmail.com" onClick={closeMenu}>Let's talk <ArrowUpRight size={15} /></a></div>
      </nav></header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy"><p className="eyebrow reveal">Software Engineer <span className="dot" /> Metro Manila, Philippines</p><h1>Building the systems<br /><em>behind the scenes.</em></h1><p className="hero-lede">I’m Jahnreil J. Amarillento — a software engineer focused on backend services, self-hosted infrastructure, and practical AI systems.</p><div className="hero-actions"><a className="button button-primary" href="#work">See selected work <ArrowUpRight size={17} /></a><a className="button button-ghost" href="mailto:amarillentojahnreil@gmail.com">Get in touch <Mail size={16} /></a></div><div className="social-row">{contactLinks.map(({ label, detail, href, icon: Icon }) => <a href={href} key={label} target={label === 'Email' ? undefined : '_blank'} rel={label === 'Email' ? undefined : 'noreferrer'}><Icon size={17} /><span>{label}</span><small>{detail}</small></a>)}</div></div>
          <div className="hero-visual" aria-label="Portfolio portrait visual"><div className="visual-grid" /><div className="visual-label">/ profile_01 <span>available for building</span></div><img src="/images/1.png" alt="Jahnreil J. Amarillento" /><div className="visual-caption"><strong>Backend · Platform · AI</strong><span>From services to deployment.</span></div></div>
          <a className="scroll-cue" href="#areas"><ChevronDown size={17} /> Scroll to explore</a>
        </section>

        <section className="section container" id="areas"><SectionLabel eyebrow="01 — the toolkit" title="Engineering areas" intro="A practical, systems-minded approach to building software that works well in production." /><div className="areas-grid">{areas.map((area) => <article className="area-card" key={area.name}><span className="area-index">{area.index}</span><h3>{area.name}</h3><ul>{area.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>

        <section className="section work-section" id="work"><div className="container"><SectionLabel eyebrow="02 — selected work" title="Projects with a point of view" intro="A selection of platforms, products, and experiments — from cybersecurity education to the infrastructure that keeps things running." /><div className="featured-grid">{featuredProjects.map((project) => <ProjectCard key={project.title} project={project} />)}</div></div></section>

        <section className="section container project-group-section" id="ai-engineering"><SectionLabel eyebrow="03 — applied intelligence" title="AI Engineering" intro="Computer vision, retrieval, agents, and automation designed around a useful outcome." /><div className="mini-grid">{otherProjects.filter((p) => p.group === 'AI Engineering').map((p) => <ProjectCard compact key={p.title} project={p} />)}</div></section>
        <section className="section container project-group-section" id="automation"><SectionLabel eyebrow="04 — less repetition" title="Automation" /><div className="mini-grid">{otherProjects.filter((p) => p.group === 'Automation').map((p) => <ProjectCard compact key={p.title} project={p} />)}</div></section>
        <section className="section container project-group-section" id="knowledge"><SectionLabel eyebrow="05 — find what matters" title="Knowledge Management" /><div className="mini-grid">{otherProjects.filter((p) => p.group === 'Knowledge Management').map((p) => <ProjectCard compact key={p.title} project={p} />)}</div></section>
        <section className="section container project-group-section" id="business"><SectionLabel eyebrow="06 — useful by default" title="Business Applications" /><div className="mini-grid">{otherProjects.filter((p) => p.group === 'Business Applications').map((p) => <ProjectCard compact key={p.title} project={p} />)}</div></section>

        <section className="exploring-section" id="exploring"><div className="container exploring-layout"><div><SectionLabel eyebrow="07 — next up" title="What I’m exploring" intro="The questions and tools currently shaping how I think about software." /></div><div className="explore-list">{exploring.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}</div></div></section>
      </main>

      <footer className="footer container"><div><a className="brand" href="#top"><span>JA</span><strong>Jahnreil Amarillento</strong></a><p>Software Engineer · Backend · Platform · AI</p></div><div className="footer-right"><p>Have a system to build?</p><a className="text-link" href="mailto:amarillentojahnreil@gmail.com">Let’s talk <ArrowUpRight size={16} /></a><small>© {new Date().getFullYear()} Jahnreil J. Amarillento</small></div></footer>
    </div>
  )
}
