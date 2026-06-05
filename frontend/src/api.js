const BASE = '/api'

export async function getClientProfile() {
  const r = await fetch(`${BASE}/client-profile`)
  return r.json()
}

export async function getDocuments() {
  const r = await fetch(`${BASE}/documents`)
  return r.json()
}

export function getDocumentUrl(filename) {
  return `${BASE}/document/${encodeURIComponent(filename)}`
}

export async function uploadDocuments(files) {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  const r = await fetch(`${BASE}/upload-documents`, { method: 'POST', body: form })
  return r.json()
}

export async function getMissingDocsReport() {
  const r = await fetch(`${BASE}/missing-docs-report`)
  return r.json()
}

export async function generateEmail() {
  const r = await fetch(`${BASE}/generate-email`, { method: 'POST' })
  return r.json()
}

export async function getReminder() {
  const r = await fetch(`${BASE}/reminder`)
  return r.json()
}

export async function resetState() {
  await fetch(`${BASE}/reset`, { method: 'DELETE' })
}
