import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import FormInput from '../../components/forms/FormInput'
import FormSelect from '../../components/forms/FormSelect'
import FloatingChessPieces from '../../components/common/FloatingChessPieces'
import { loginSchema } from '../../utils/validationSchemas'
import useAuthStore from '../../store/authStore'
import useDemoStore from '../../store/demoStore'
import authService from '../../services/authService'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message
  const { login, linkDemoAccount, role, token } = useAuthStore()
  const { demoData, clearDemoData } = useDemoStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  // Redirect if already authenticated
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if ((token || storedToken) && role) {
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true })
      else if (role === 'COACH') navigate('/coach/dashboard', { replace: true })
      else if (role === 'CUSTOMER') navigate('/customer/dashboard', { replace: true })
    }
  }, [token, role, navigate])

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data.email, data.password)
      login(response.user, response.token)
      
      // Check if logging in with demo account email
      if (demoData && demoData.parentEmail === data.email && demoData.status === 'CONVERTED') {
        // Link demo account data to user account
        linkDemoAccount(demoData)
        // Clear demo store after linking
        clearDemoData()
      }
      
      // Redirect based on role
      const userRole = response.user.role
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === 'COACH') {
        navigate('/coach/dashboard', { replace: true })
      } else if (userRole === 'CUSTOMER') {
        // For customers, check payment status first
        navigate('/customer/payment-check', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Invalid email or password'
      })
    }
  }

  const roleOptions = [
    { value: 'CUSTOMER', label: 'Parent/Student' },
    { value: 'COACH', label: 'Coach' },
    { value: 'ADMIN', label: 'Admin' }
  ]

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12 relative">
      <FloatingChessPieces />
      <Card className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <img 
            src="/LOGO.png" 
            alt="Indian Chess Academy Logo" 
            className="h-[128px] w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your Indian Chess Academy account</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            error={errors.email}
            {...register('email')}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-orange hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/book-demo" className="text-orange hover:underline font-medium">
            Book a Free Demo
          </Link>
          {' '}or{' '}
          <Link to="/demo-login" className="text-orange hover:underline font-medium">
            Access Demo Account
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Login
