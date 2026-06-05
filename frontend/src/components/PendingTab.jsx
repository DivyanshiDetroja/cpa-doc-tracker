import { useState, useEffect } from 'react'
import { getMissingDocsReport, generateEmail, getReminder } from '../api'

const URGENCY_STYLE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

export default function PendingTab({ report, setReport }) {
  const [reminder, setReminder] = useState(null)
  const [emailBody, setEmailBody] = useState('')
  const [generatingEmail, setGeneratingEmail] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    getReminder().then(setReminder)
  }, [report])

  useEffect(() => {
    if (!report) {
      setLoadingReport(true)
      getMissingDocsReport()
        .then(setReport)
        .finally(() => setLoadingReport(false))
    }
  }, [report, setReport])

  async function handleGenerateEmail() {
    setGeneratingEmail(true)
    try {
      const { email_body } = await generateEmail()
      setEmailBody(email_body)
    } finally {
      setGeneratingEmail(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(emailBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loadingReport) return (
    <div className="text-center text-blue-600 font-medium animate-pulse">Loading report…</div>
  )

  if (!report) return null

  return (
    <div className="space-y-6">
      {/* Follow-up reminder */}
      {reminder && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-amber-800">Follow-up scheduled: {reminder.follow_up_date}</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {reminder.outstanding_items.length > 0
                ? `${reminder.outstanding_items.length} item${reminder.outstanding_items.length > 1 ? 's' : ''} still outstanding`
                : 'All documents received'}
            </p>
          </div>
        </div>
      )}

      {/* Accepted */}
      {report.accepted?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Accepted ✓</h3>
          <div className="flex flex-wrap gap-2">
            {report.accepted.map((t, i) => (
              <span key={i} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing docs */}
      {report.missing?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Missing Documents</h3>
          <ul className="space-y-3">
            {report.missing.map((d, i) => (
              <li key={i} className="flex gap-3">
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full h-fit mt-0.5 ${URGENCY_STYLE[d.urgency] || 'bg-gray-100 text-gray-600'}`}>
                  {d.urgency}
                </span>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{d.doc_type} <span className="text-slate-400 font-normal">— {d.source}</span></p>
                  <p className="text-sm text-slate-500 mt-0.5">{d.context_note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rejected docs */}
      {report.rejected?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Needs Re-upload</h3>
          <ul className="space-y-2">
            {report.rejected.map((d, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-slate-700">{d.doc_type}</span>
                <span className="text-slate-400"> ({d.filename})</span>
                <span className="text-red-600"> — {d.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No items */}
      {report.missing?.length === 0 && report.rejected?.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-semibold text-lg">All required documents received!</p>
        </div>
      )}

      {/* Email generator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up Email Draft</h3>
          <button
            onClick={handleGenerateEmail}
            disabled={generatingEmail}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {generatingEmail ? 'Generating…' : 'Generate Email'}
          </button>
        </div>

        {emailBody && (
          <>
            <textarea
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              rows={12}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleCopy}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy to clipboard'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
