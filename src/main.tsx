import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CodeRain } from './components/CodeRain.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodeRain />
    <App />
  </StrictMode>,
)
