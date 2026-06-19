import { Link } from 'react-router-dom'
import type { Website } from '../types'

interface Props {
  website: Website
}

export default function WebsiteCard({ website }: Props) {
  const status = website.latest_check
  const isUp = status?.is_up

  return (
    <Link
      to={`/websites/${website.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{website.name}</h3>
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isUp === true ? 'bg-green-500' : isUp === false ? 'bg-red-500' : 'bg-slate-300'
          }`}
        />
      </div>
      <p className="text-sm text-slate-500 truncate">{website.url}</p>
      {status ? (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <span>{status.status_code}</span>
          <span>{status.response_time_ms}ms</span>
          <span>{new Date(status.checked_at).toLocaleString()}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400">No checks yet</p>
      )}
      <p className="mt-1 text-xs text-slate-400">
        Every {website.check_interval}s
      </p>
    </Link>
  )
}
