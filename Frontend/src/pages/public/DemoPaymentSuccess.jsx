import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const DemoPaymentSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const planName = location.state?.planName

  useEffect(() => {
    if (!email) {
      navigate('/demo-access', { replace: true })
    }
  }, [email, navigate])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="max-w-2xl w-full">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-600 text-5xl">✓</span>
          </div>
          
          <h1 className="text-4xl font-secondary font-bold text-navy mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            Your payment for <strong>{planName || 'your subscription'}</strong> has been processed successfully.
          </p>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">📧</span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-secondary font-bold text-blue-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-blue-800 mb-3">
                  We've sent a password setup link to:
                </p>
                <p className="text-blue-900 font-semibold text-lg mb-3 bg-white px-4 py-2 rounded-lg border border-blue-300">
                  {email}
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Open the email from Indian Chess Academy</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Click on the "Set Password" link</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Create your password</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Login to access your full dashboard</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> The password setup link will expire in 48 hours. 
              If you don't receive the email, please check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/demo-access')}
              className="w-full"
            >
              Back to Demo Account
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

          <div className="mt-8 text-sm text-gray-500">
            <p>Need help? Contact us at support@indianchessacademy.com</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DemoPaymentSuccess
