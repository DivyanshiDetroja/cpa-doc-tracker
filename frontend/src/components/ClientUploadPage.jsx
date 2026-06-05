import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocuments } from '../api'

export default function ClientUploadPage() {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [count, setCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const onDrop = useCallback(async (accepted) => {
    const pdfs = accepted.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) {
      setErrorMsg('Please upload PDF files only.')
      setStatus('error')
      return
    }
    setStatus('uploading')
    setErrorMsg('')
    try {
      await uploadDocuments(pdfs)
      setCount(pdfs.length)
      setStatus('success')
    } catch (e) {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    disabled: status === 'uploading',
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
            CPA
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Upload Your Financial Statements</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Please upload all documents requested for the audit engagement. PDF files only.
          </p>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-semibold text-green-800">Documents received!</h2>
            <p className="text-green-600 mt-1">
              {count} document{count !== 1 ? 's' : ''} successfully uploaded.
            </p>
            <p className="text-sm text-green-500 mt-3">
              Your CPA will review them and follow up if anything is needed.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
            {errorMsg}
            <button
              onClick={() => setStatus('idle')}
              className="ml-3 underline text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {(status === 'idle' || status === 'uploading' || status === 'error') && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors
              ${status === 'uploading'
                ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                : isDragActive
                  ? 'border-blue-500 bg-blue-50 cursor-copy'
                  : 'border-slate-300 hover:border-blue-400 bg-white cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            {status === 'uploading' ? (
              <div className="space-y-2">
                <div className="text-3xl animate-bounce">📤</div>
                <p className="text-blue-600 font-medium">Uploading your documents…</p>
                <p className="text-blue-400 text-sm">This may take a few seconds.</p>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">📄</div>
                <p className="text-slate-700 font-medium text-lg">
                  {isDragActive ? 'Drop your files here' : 'Drag & drop your documents here'}
                </p>
                <p className="text-slate-400 text-sm mt-2">or click to browse</p>
                <p className="text-xs text-slate-300 mt-3">PDF files only</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
