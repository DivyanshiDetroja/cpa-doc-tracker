import { useEffect, useRef } from 'react'
import { getDocuments, getDocumentUrl } from '../api'

function StatusBadge({ status }) {
  const map = {
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    unrecognized: 'bg-yellow-100 text-yellow-800',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function CheckIcon({ pass }) {
  return pass
    ? <span className="text-green-600 font-bold">✓</span>
    : <span className="text-red-500 font-bold">✗</span>
}

export default function DocumentsTab({ docs, setDocs, onDocsChanged }) {
  // Use refs so the async poll closure always has the latest values without re-running the effect
  const intervalRef = useRef(null)
  const prevCountRef = useRef(docs.length)
  const setDocsRef = useRef(setDocs)
  const onDocsChangedRef = useRef(onDocsChanged)

  useEffect(() => { setDocsRef.current = setDocs }, [setDocs])
  useEffect(() => { onDocsChangedRef.current = onDocsChanged }, [onDocsChanged])

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const latest = await getDocuments()
        if (cancelled) return

        // Only update state if something actually changed (avoids re-render cascade)
        if (latest.length !== prevCountRef.current) {
          prevCountRef.current = latest.length
          setDocsRef.current(latest)
          onDocsChangedRef.current()
        }

        // Stop polling once documents have arrived
        if (latest.length > 0) {
          clearInterval(intervalRef.current)
        }
      } catch (_) {}
    }

    poll()
    intervalRef.current = setInterval(poll, 3000)

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
    }
  }, []) // empty deps — runs once on mount, refs keep it current

  if (docs.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-16 text-center text-slate-400">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-medium">Waiting for client uploads…</p>
        <p className="text-sm mt-1">
          Client uploads at{' '}
          <a href="/client" target="_blank" className="text-blue-500 underline">
            localhost:3000/client
          </a>
        </p>
        <p className="text-xs mt-3 text-slate-300">Auto-refreshing every 3 seconds</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Uploaded Documents ({docs.length})
      </h3>

      {docs.map((doc) => (
        <div key={doc.filename} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate">{doc.filename}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Identified as:{' '}
                <span className="font-medium text-slate-700">{doc.identified_type}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={doc.status} />
              <a
                href={getDocumentUrl(doc.filename)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition-colors"
              >
                View PDF
              </a>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckIcon pass={doc.type_correct} />
              Type{doc.type_correct ? ' correct' : ' mismatch'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckIcon pass={doc.year_correct} />
              Year: {doc.detected_year ?? '—'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckIcon pass={doc.client_correct} />
              Client: {doc.detected_client ?? '—'}
            </span>
          </div>

          {doc.rejection_reason && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
              {doc.rejection_reason}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
