// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('No se encontró el elemento #root en index.html')
}

ReactDOM.createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
