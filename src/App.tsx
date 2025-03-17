import { Routes, Route } from 'react-router-dom'
import Layout from './components/ui/layout'
import Dashboard from './routes/dashboard'
import SearchPage from './routes/search'
import UploadPage from './routes/upload'
import './globals.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
    </Routes>
  )
} 