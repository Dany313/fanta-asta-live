import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. IMPORTA QueryClient e QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. CREA un'istanza del client (questo sarà il "cervello" della tua cache)
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. AVVOLGI la tua App nel Provider e passagli il client */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)