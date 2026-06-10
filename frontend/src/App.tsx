import { AppRoutes } from '@/routes'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
