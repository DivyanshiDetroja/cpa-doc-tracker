export default function CaseContextTab({ profile }) {
  if (!profile) return <p className="text-slate-500">Loading client profile…</p>

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Client Profile</h3>
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
          <div>
            <span className="text-slate-500">Name</span>
            <p className="font-medium text-slate-800">{profile.name}</p>
          </div>
          <div>
            <span className="text-slate-500">Filing Type</span>
            <p className="font-medium text-slate-800">{profile.entity_type}</p>
          </div>
          <div>
            <span className="text-slate-500">Tax Year</span>
            <p className="font-medium text-slate-800">{profile.tax_year}</p>
          </div>
          <div>
            <span className="text-slate-500">Filing Deadline</span>
            <p className="font-medium text-slate-800">{profile.filing_deadline}</p>
          </div>
          <div>
            <span className="text-slate-500">Assigned CPA</span>
            <p className="font-medium text-slate-800">{profile.assigned_cpa}</p>
          </div>
        </div>
      </div>

      {/* Required docs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Required Documents</h3>
        <ul className="space-y-1.5">
          {profile.required_docs.map((d, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">•</span>
              <span className="font-medium text-slate-700">{d.type}</span>
              <span className="text-slate-400">— {d.source}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Communication trail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Communication Trail</h3>
        <ul className="space-y-3">
          {profile.communication_trail.map((entry, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 text-slate-400 font-medium w-28">{entry.date}</span>
              <span className="text-slate-700">{entry.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
