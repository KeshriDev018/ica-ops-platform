import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../../store/authStore'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { role, token, checkAuth } = useAuthStore()
  const location = useLocation()
  
  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  
  // Get token from localStorage for initial check
  const storedToken = localStorage.getItem('auth_token')
  
  if (!storedToken && !token) {
    // Redirect to login with return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (role === 'COACH') return <Navigate to="/coach/dashboard" replace />
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute
