import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import CursorAmbientGlow from './CursorAmbientGlow'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><><CursorAmbientGlow /><App /></></StrictMode>,
)
