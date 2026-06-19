import type { User, LoginCredentials, RegisterData } from '../types'
import api from './client'

export async function fetchCSRFToken(): Promise<void> {
  await api.get('/auth/csrf/')
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const { data } = await api.post<User>('/auth/login/', credentials)
  return data
}

export async function register(data: RegisterData): Promise<User> {
  const { data: user } = await api.post<User>('/auth/register/', data)
  return user
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout/')
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me/')
  return data
}
