import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { router } from './Routes/Routes'
import { RouterProvider } from 'react-router-dom'
import AnimCursor from './Components/AnimCursor/AnimCursor'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnimCursor />
    <Toaster />
    <RouterProvider router={router} />
    <Analytics />
  </React.StrictMode>,
)
