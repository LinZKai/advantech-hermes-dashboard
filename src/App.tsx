import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { CasesPage } from './pages/CasesPage'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { ImprovementsPage } from './pages/ImprovementsPage'
import { ImprovementDetailPage } from './pages/ImprovementDetailPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content">
        <div className="app-content-inner">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:caseId" element={<CaseDetailPage />} />
            <Route path="/improvements" element={<ImprovementsPage />} />
            <Route path="/improvements/:proposalId" element={<ImprovementDetailPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
