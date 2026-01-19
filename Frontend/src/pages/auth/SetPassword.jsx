import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FormInput from '../../components/forms/FormInput'
import authService from '../../services/authService'

// Password validation schema
const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const SetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get('token')
  
  const [validating, setValidating] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [email, setEmail] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm({
    resolver: zodResolver(setPasswordSchema)
  })

  const passwordValue = watch('password')

  // Calculate password strength
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (passwordValue.length >= 8) strength += 25
    if (/[A-Z]/.test(passwordValue)) strength += 25
    if (/[a-z]/.test(passwordValue)) strength += 25
    if (/[0-9]/.test(passwordValue)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength += 12.5

    setPasswordStrength(strength)
  }, [passwordValue])

  // Check if token exists
  useEffect(() => {
    if (!tokenFromQuery) {
      setTokenValid(false)
      setValidating(false)
    }
  }, [tokenFromQuery])

  const onSubmit = async (data) => {
    try {
      await authService.setPassword({
        token: tokenFromQuery,
        password: data.password
      })
      
      // Navigate to login page after successful password setup
      navigate('/login', { 
        state: { 
          message: 'Password set successfully! Please login with your credentials.',
          email: email 
        } 
      })
    } catch (error) {
      console.error('Password setup error:', error)
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to set password. Please try again.'
      })
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength < 50) return 'Weak'
    if (passwordStrength < 75) return 'Medium'
    return 'Strong'
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-secondary font-bold text-navy mb-4">
            Validating Token...
          </h2>
          <p className="text-gray-600">Please wait while we verify your link.</p>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-4xl">✕</span>
          </div>
          <h2 className="text-3xl font-secondary font-bold text-navy mb-4">
            Invalid or Expired Link
          </h2>
          <p className="text-gray-600 mb-6">
            This password setup link is invalid or has expired. Password setup links are valid for 48 hours.
          </p>
          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/demo-login')}
              className="w-full"
            >
              Access Demo Account
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact support@indianchessacademy.com
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/LOGO.png" 
            alt="Indian Chess Academy Logo" 
            className="h-[128px] w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Set Your Password
          </h1>your coach account
          <p className="text-gray-600">
            Create a secure password for <strong>{email}</strong>
          </p>
        </div>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password}
              {...register('password')}
            />
            
            {passwordValue && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 50 ? 'text-red-600' :
                    passwordStrength < 75 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Password requirements:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center">
                <span className={passwordValue?.length >= 8 ? 'text-green-600' : ''}>
                  {passwordValue?.length >= 8 ? '✓' : '○'} At least 8 characters
                </span>
              </li>
              <li className="flex items-center">
                <span className={/[A-Z]/.test(passwordValue || '') ? 'text-green-600' : ''}>
                  {/[A-Z]/.test(passwordValue || '') ? '✓' : '○'} One uppercase letter
                </span>
              </li>
              <li className="flex items-center">
                <span className={/[a-z]/.test(passwordValue || '') ? 'text-green-600' : ''}>
                  {/[a-z]/.test(passwordValue || '') ? '✓' : '○'} One lowercase letter
                </span>
              </li>
              <li className="flex items-center">
                <span className={/[0-9]/.test(passwordValue || '') ? 'text-green-600' : ''}>
                  {/[0-9]/.test(passwordValue || '') ? '✓' : '○'} One number
                </span>
              </li>
              <li className="flex items-center">
                <span className={/[^A-Za-z0-9]/.test(passwordValue || '') ? 'text-green-600' : ''}>
                  {/[^A-Za-z0-9]/.test(passwordValue || '') ? '✓' : '○'} One special character
                </span>
              </li>
            </ul>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting Password...' : 'Create Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default SetPassword
