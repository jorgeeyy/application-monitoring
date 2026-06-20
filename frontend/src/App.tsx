import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/sonner'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import WebsitesPage from './pages/WebsitesPage'
import WebsiteDetailPage from './pages/WebsiteDetailPage'
import AddWebsitePage from './pages/AddWebsitePage'
import EditWebsitePage from './pages/EditWebsitePage'
import SSLPage from './pages/SSLPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/websites" element={<WebsitesPage />} />
                <Route path="/websites/new" element={<AddWebsitePage />} />
                <Route path="/websites/:id/edit" element={<EditWebsitePage />} />
                <Route path="/websites/:id" element={<WebsiteDetailPage />} />
                <Route path="/ssl" element={<SSLPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
