// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <--- 99% 的可能性是您缺少了這一行！
import { AuthProvider } from './contexts/AuthContext'
import { DatabaseProvider } from './contexts/DatabaseContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </AuthProvider>
  </React.StrictMode>,
)