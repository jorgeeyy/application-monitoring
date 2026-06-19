export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export interface UptimeCheck {
  id: string
  status_code: number | null
  response_time_ms: number | null
  is_up: boolean
  error_message: string | null
  checked_at: string
}

export interface Website {
  id: string
  name: string
  url: string
  check_interval: number
  is_active: boolean
  created_at: string
  updated_at: string
  latest_check: UptimeCheck | null
}

export interface WebsiteStats {
  total_checks: number
  uptime_percentage_24h: number
  uptime_percentage_7d: number
  uptime_percentage_30d: number
  current_status: boolean | null
  last_check: UptimeCheck | null
  average_response_time_ms: number | null
}

export interface SSLCertInfo {
  hostname: string
  is_valid: boolean
  issuer: string | null
  subject: string | null
  expires_at: string | null
  days_remaining: number | null
  error_message: string | null
}

export interface CheckResponse {
  uptime: UptimeCheck
  ssl: SSLCertInfo
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export interface WebsiteFormData {
  name: string
  url: string
  check_interval: number
}
