import { Routes, Route } from 'react-router-dom'
import { HomePage, NotFoundPage } from './pages/index.ts'
import './App.css'

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
