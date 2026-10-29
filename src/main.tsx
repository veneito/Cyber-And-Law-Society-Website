import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageSwitch } from './i18n/language'
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

// In-page links scroll without putting #section in the URL, so a refresh
// starts at the top instead of jumping to the last section clicked.
document.addEventListener("click", (e) => {
  const link = (e.target as Element).closest?.('a[href^="#"]');
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const id = link.getAttribute("href")!.slice(1);
  const target = id && id !== "top" ? document.getElementById(id) : null;
  e.preventDefault();
  if (target) target.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CodeRain />
    <App />
    <LanguageSwitch />
  </StrictMode>,
)
