import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './globals.css'

// Generate a unique build ID at build time
const BUILD_ID = Date.now().toString()

// Version check component to handle page refreshes
function VersionCheck({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lastBuildId = localStorage.getItem('buildId')
    
    // Store current build ID
    localStorage.setItem('buildId', BUILD_ID)
    
    // If we have a different build ID and we're not on the homepage, refresh
    if (lastBuildId && lastBuildId !== BUILD_ID && window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }, [])
  
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <VersionCheck>
        <App />
      </VersionCheck>
    </BrowserRouter>
  </React.StrictMode>
) 