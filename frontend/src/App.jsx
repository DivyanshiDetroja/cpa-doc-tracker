import { useCallback, useEffect, useState } from 'react'
import { getClientProfile, resetState } from './api'
import DocumentsTab from './components/DocumentsTab'
import CaseContextTab from './components/CaseContextTab'
import PendingTab from './components/PendingTab'
import ClientUploadPage from './components/ClientUploadPage'

const TABS = ['Documents', 'Case Context', 'Pending & Reminders']

export default function App() {
  const path = window.location.pathname
  if (path === '/client') return <ClientUploadPage />
  return <CPADashboard />
}

function CPADashboard() {
  const [tab, setTab] = useState('Documents')
  const [profile, setProfile] = useState(null)
  const [docs, setDocs] = useState([])
  const [report, setReport] = useState(null)

  // Stable reference — won't change on re-renders, so DocumentsTab's effect never restarts
  const onDocsChanged = useCallback(() => setReport(null), [])

  useEffect(() => {
    resetState().then(() => getClientProfile().then(setProfile))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            🐝
          </div>
          <span className="font-semibold text-slate-800 text-lg">Audit Bee</span>
        </div>
        {profile && (
          <div className="text-right text-sm">
            <p className="font-medium text-slate-800">{profile.name}</p>
            <p className="text-slate-400">{profile.entity_type} · Tax Year {profile.tax_year}</p>
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                ${tab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Documents' && (
          <DocumentsTab docs={docs} setDocs={setDocs} onDocsChanged={onDocsChanged} />
        )}
        {tab === 'Case Context' && (
          <CaseContextTab profile={profile} />
        )}
        {tab === 'Pending & Reminders' && (
          <PendingTab report={report} setReport={setReport} />
        )}
      </div>
    </div>
  )
}
