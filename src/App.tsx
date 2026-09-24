import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import Simulate from './pages/Simulate'
import Forcing from './pages/Forcing'
import Result from './pages/Result'
import History from './pages/History'
import Methodology from './pages/Methodology'
import Onboarding from './pages/Onboarding'
import ConsentGate from './pages/ConsentGate'

function Gate({ children }: { children: React.ReactNode }) {
  const onboarded = localStorage.getItem('bercabang_onboarded') === '1'
  const consented = localStorage.getItem('bercabang_birthYear')
  if (!onboarded || !consented) return <Navigate to="/start" replace />
  return <>{children}</>
}

function StartFlow() {
  const nav = useNavigate()
  const [step, setStep] = useState<'onboard'|'consent'>(() => localStorage.getItem('bercabang_onboarded') ? 'consent' : 'onboard')
  if (step==='onboard') return <div className="mx-auto max-w-[480px] min-h-screen bg-[#f6f8fb] px-4 pt-6"><Onboarding onDone={()=> setStep('consent')} /></div>
  return <div className="mx-auto max-w-[480px] min-h-screen bg-[#f6f8fb] px-4 pt-6"><ConsentGate onPassed={()=> nav('/', { replace:true })} /></div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/start" element={<StartFlow />} />
        <Route path="/*" element={
          <Shell>
            <Routes>
              <Route path="/" element={<Gate><Home /></Gate>} />
              <Route path="/simulasi" element={<Gate><Simulate /></Gate>} />
              <Route path="/forcing" element={<Gate><Forcing /></Gate>} />
              <Route path="/hasil/:id" element={<Gate><Result /></Gate>} />
              <Route path="/riwayat" element={<Gate><History /></Gate>} />
              <Route path="/metodologi" element={<Methodology />} />
              <Route path="/profil" element={<Gate><ProfilePage /></Gate>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        } />
      </Routes>
    </BrowserRouter>
  )
}
