import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { Analytics } from '@vercel/analytics/react';
import { LazyMotion, domAnimation } from 'framer-motion';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LazyMotion features={domAnimation}>
      <App />
      <Analytics />
    </LazyMotion>
  </React.StrictMode>,
)
