import type {
  Website,
  WebsiteStats,
  SSLCertInfo,
  CheckResponse,
  WebsiteFormData,
  UptimeCheck,
  ChartDataPoint,
} from '../types'
import api from './client'

export async function fetchWebsites(): Promise<Website[]> {
  const { data } = await api.get<Website[]>('/websites/')
  return data
}

export async function fetchWebsite(id: string): Promise<Website> {
  const { data } = await api.get<Website>(`/websites/${id}/`)
  return data
}

export async function createWebsite(form: WebsiteFormData): Promise<Website> {
  const { data } = await api.post<Website>('/websites/', form)
  return data
}

export async function updateWebsite(id: string, form: Partial<WebsiteFormData>): Promise<Website> {
  const { data } = await api.patch<Website>(`/websites/${id}/`, form)
  return data
}

export async function deleteWebsite(id: string): Promise<void> {
  await api.delete(`/websites/${id}/`)
}

export async function fetchChecks(id: string): Promise<UptimeCheck[]> {
  const { data } = await api.get<UptimeCheck[]>(`/websites/${id}/checks/`)
  return data
}

export async function fetchStats(id: string): Promise<WebsiteStats> {
  const { data } = await api.get<WebsiteStats>(`/websites/${id}/stats/`)
  return data
}

export async function fetchSSLInfo(id: string): Promise<SSLCertInfo> {
  const { data } = await api.get<SSLCertInfo>(`/websites/${id}/ssl_check/`)
  return data
}

export async function triggerCheck(id: string): Promise<CheckResponse> {
  const { data } = await api.post<CheckResponse>(`/websites/${id}/check/`)
  return data
}

export async function triggerSSLCheck(id: string): Promise<SSLCertInfo> {
  const { data } = await api.post<SSLCertInfo>(`/websites/${id}/ssl_check/`)
  return data
}

export async function fetchChart(id: string, hours: number = 24): Promise<ChartDataPoint[]> {
  const { data } = await api.get<ChartDataPoint[]>(`/websites/${id}/chart/`, { params: { hours } })
  return data
}
