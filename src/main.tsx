import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CodeRain } from './components/CodeRain.tsx'

// Always land at the very top on page load (no restored scroll), unless
// the URL targets a specific section like /#events.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const startHash = window.location.hash.slice(1);
window.addEventListener("load", () => {
  const target = startHash && startHash !== "top" ? document.getElementById(startHash) : null;
  if (target) target.scrollIntoView({ behavior: "instant" });
  else window.scrollTo({ top: 0, behavior: "instant" });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodeRain />
    <App />
  </StrictMode>,
)
