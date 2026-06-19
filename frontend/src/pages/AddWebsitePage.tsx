import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createWebsite } from '../api/websites'

export default function AddWebsitePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', url: '', check_interval: 60 })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => createWebsite(form),
    onSuccess: (data) => navigate(`/websites/${data.id}`),
    onError: (err: any) => {
      setError(err.response?.data?.url?.[0] || err.response?.data?.detail || 'Failed to create website')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate()
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: field === 'check_interval' ? Number(e.target.value) : e.target.value }))

  return (
    <div className="max-w-lg">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 block">&larr; Back</Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Website</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={update('name')}
            required
            placeholder="My Website"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
          <input
            type="url"
            value={form.url}
            onChange={update('url')}
            required
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Check interval (seconds)
          </label>
          <input
            type="number"
            value={form.check_interval}
            onChange={update('check_interval')}
            min={10}
            max={3600}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {mutation.isPending ? 'Adding...' : 'Add Website'}
        </button>
      </form>
    </div>
  )
}
