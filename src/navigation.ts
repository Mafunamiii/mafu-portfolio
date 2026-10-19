export type PortfolioView = 'explore' | 'simple'

export type PortfolioLocation = {
  category: string
  view: PortfolioView
  exploring: boolean
  hash: string
}

const sectionCategory: Record<string, string> = {
  about: 'about',
  experience: 'about',
  education: 'about',
  contact: 'contact',
}

export function readPortfolioLocation(url: URL, categories: string[], projectCounts: Record<string, number>): PortfolioLocation {
  const categoryParam = url.searchParams.get('category')
  const selectedView: PortfolioView = url.searchParams.get('view') === 'simple' ? 'simple' : 'explore'
  let category = categoryParam && categories.includes(categoryParam) ? categoryParam : 'about'
  let hashCategory: string | undefined
  let anchorImpliesExplore = false
  let hash = url.hash

  try { hash = decodeURIComponent(url.hash) } catch { /* Keep malformed fragments untouched. */ }
  const project = /^#project-([a-z0-9-]+)-(\d+)$/i.exec(hash)
  if (project && categories.includes(project[1]) && Number(project[2]) <= (projectCounts[project[1]] ?? 0)) {
    hashCategory = project[1]
    anchorImpliesExplore = true
  } else {
    const fragment = hash.slice(1)
    if (sectionCategory[fragment]) {
      hashCategory = sectionCategory[fragment]
      anchorImpliesExplore = true
    } else if (fragment === 'work') {
      anchorImpliesExplore = true
    }
  }
  if (hashCategory) category = hashCategory

  const validCategoryParam = Boolean(categoryParam && categories.includes(categoryParam))
  const exploring = selectedView === 'simple' || (hash !== '#top' && (validCategoryParam || anchorImpliesExplore))
  return { category, view: selectedView, exploring, hash }
}

export function portfolioUrl(current: URL, category: string, view: PortfolioView, exploring: boolean, hash?: string, includeCategory = exploring || view === 'simple'): string {
  const next = new URL(current)
  next.searchParams.delete('category')
  next.searchParams.delete('view')
  if (includeCategory) next.searchParams.set('category', category)
  if (view === 'simple') next.searchParams.set('view', 'simple')
  if (hash !== undefined) next.hash = hash
  return `${next.pathname}${next.search}${next.hash}`
}

export function scrollToPortfolioHash(hash: string): boolean {
  if (!hash || hash === '#top') {
    if (hash === '#top') window.scrollTo({ top: 0, behavior: 'instant' })
    return hash === '#top'
  }
  const target = document.getElementById(hash.slice(1))
  if (!target) return false
  target.scrollIntoView({ block: 'start', behavior: 'instant' })
  return true
}
