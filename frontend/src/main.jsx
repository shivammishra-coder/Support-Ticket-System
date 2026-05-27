import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Reset browser defaults
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; }
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)