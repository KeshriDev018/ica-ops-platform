import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import FormInput from '../../components/forms/FormInput'
import FloatingChessPieces from '../../components/common/FloatingChessPieces'
import useDemoStore from '../../store/demoStore'
import demoAccountService from '../../services/demoAccountService'

// Validation schema
const demoLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
})

const DemoLogin = () => {
  const navigate = useNavigate()
  const setDemoData = useDemoStore(state => state.setDemoData)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(demoLoginSchema)
  })

  const onSubmit = async (data) => {
    try {
      // Verify demo exists for this email (backend validation)
      const demoData = await demoAccountService.verifyDemoByEmail(data.email)
      
      // Store demo data in Zustand store
      setDemoData(demoData)
      
      // Navigate to demo account page
      navigate('/demo-access', { replace: true })
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'No demo found for this email. Please book a demo first.'
      })
    }
  }

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
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Access Demo Account
          </h1>
          <p className="text-gray-600">
            Enter your email to access your demo session details
          </p>
        </div>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email used for demo booking"
            error={errors.email}
            hint="Use the email you provided when booking your demo"
            {...register('email')}
          />

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Access Demo Account'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have a demo booked?{' '}
              <button
                onClick={() => navigate('/book-demo')}
                className="text-orange hover:underline font-medium"
              >
                Book a Free Demo
              </button>
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have a full account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-orange hover:underline font-medium"
              >
                Login Here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Note:</strong> This is for accessing your demo session details. 
            After payment, you'll receive a password setup email to create your full account.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default DemoLogin
