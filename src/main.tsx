import './polyfill-buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Missing #root')
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void import('virtual:pwa-register')
  .then(({ registerSW }) => {
    try {
      registerSW({ immediate: true })
    } catch (e) {
      console.warn('[PWA] registerSW failed', e)
    }
  })
  .catch((e) => {
    console.warn('[PWA] could not load register module', e)
  })
