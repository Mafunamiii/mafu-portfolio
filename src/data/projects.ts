export type Project = {
  title: string
  category: string
  description: string
  technologies: string[]
  image?: string
  link?: string
  featured?: boolean
  group?: string
}

export const featuredProjects: Project[] = [
  {
    title: '2Phishy',
    category: 'Featured project · Thesis',
    description: 'A gamified cybersecurity learning platform with adaptive assessments, Phaser-based gameplay, and a full administrative dashboard for analytics and surveys.',
    technologies: ['React', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis', 'Phaser'],
    image: '/images/4.png',
    featured: true,
  },
  {
    title: 'HomeLab',
    category: 'Platform · Self-hosting',
    description: 'A self-hosted environment for services and automation, supported by containerized workloads, Linux hosts, private networking, reverse proxying, and monitoring.',
    technologies: ['Docker', 'Linux', 'Tailscale', 'Nginx', 'Pi-hole', 'Unbound'],
    image: '/images/3.png',
    featured: true,
  },
  {
    title: 'QuantumCash',
    category: 'Backend · Microservices',
    description: 'A backend microservice e-wallet system covering bank reconciliation, REST API development, notifications, and email service integrations.',
    technologies: ['REST APIs', 'Stripe', 'SendGrid', 'Microservices'],
    image: '/images/5.png',
    featured: true,
    group: 'Zoopwallet',
  },
  {
    title: 'AI Digital Assistant',
    category: 'AI engineering · Internship project',
    description: 'An enterprise AI assistant for an automotive client, combining multimodal chat, voice and avatar interfaces with identity-aware retrieval and response guardrails.',
    technologies: ['RAG', 'Prompt engineering', 'Facial recognition', 'Authorization'],
    image: '/images/7.png',
    featured: true,
  },
]

export const otherProjects: Project[] = [
  { title: 'CrossPlate', category: 'Computer vision', description: 'Vehicle and license plate detection using YOLOv5 and OCR.', technologies: ['YOLOv5', 'OCR'], image: '/images/6.png', group: 'AI Engineering' },
  { title: 'WaterCatch', category: 'Geospatial mapping', description: 'Maps historical weather data to help determine high-sale spots.', technologies: ['Geospatial mapping', 'Historical weather data'], image: '/images/6.png', group: 'AI Engineering' },
  { title: 'Agent001', category: 'QA automation', description: 'A Streamlit web application for generating Selenium automation.', technologies: ['Streamlit', 'Selenium'], image: '/images/6.png', group: 'AI Engineering' },
  { title: 'ClipCue', category: 'Automation', description: 'Desktop workflow automation for clipboard-based productivity workflows.', technologies: ['Desktop applications', 'Workflow automation'], image: '/images/8.png', group: 'Automation' },
  { title: 'ClipWatcher', category: 'Automation', description: 'Automated monitoring with Telegram and phone notifications.', technologies: ['Monitoring', 'Notifications'], image: '/images/8.png', group: 'Automation' },
  { title: 'ClipTrack', category: 'Automation', description: 'A productivity application with CSV import and export.', technologies: ['Productivity software', 'CSV'], image: '/images/8.png', group: 'Automation' },
  { title: 'ClipQA', category: 'Automation', description: 'Annotation quality assurance workflows for reliable data processing.', technologies: ['Data processing', 'Quality assurance'], image: '/images/8.png', group: 'Automation' },
  { title: "Supling's Repository", category: 'Knowledge management', description: 'A centralized, searchable document repository for secure team sharing.', technologies: ['Search', 'Role-based access'], image: '/images/9.png', group: 'Knowledge Management' },
  { title: 'MafuSheets', category: 'Knowledge management', description: 'A self-hosted digital sheet music library with sharing, search, and annotation tools.', technologies: ['Self-hosting', 'Search', 'Annotations'], image: '/images/9.png', group: 'Knowledge Management' },
  { title: 'NamiCash', category: 'Business application', description: 'A personal finance platform for budgeting, expense tracking, allowances, and dashboard reporting.', technologies: ['Full-stack application', 'Dashboard analytics'], image: '/images/10.png', group: 'Business Applications' },
  { title: 'Custom RSVP Platform', category: 'Business application', description: 'A personalized RSVP experience using a custom UI over an existing Google Forms workflow.', technologies: ['Google Forms integration', 'Custom UI'], image: '/images/11.png', group: 'Business Applications' },
]

export const exploring = [
  'Self-hostable services',
  'AI-assisted development do’s and don’ts',
  'DevOps and Cloud Technologies',
  'System Design',
  'Kubernetes',
  'CI/CD',
  'Post-deployment monitoring and maintenance',
]
