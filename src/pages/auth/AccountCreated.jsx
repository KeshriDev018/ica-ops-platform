import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const AccountCreated = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  if (!email) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="max-w-2xl w-full">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-600 text-5xl">🎉</span>
          </div>
          
          <h1 className="text-4xl font-secondary font-bold text-navy mb-4">
            Account Created Successfully!
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Your Indian Chess Academy account has been created and is ready to use.
          </p>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 mb-8">
            <div className="text-left">
              <h3 className="text-xl font-secondary font-bold text-blue-900 mb-4 text-center">
                Your Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">Email:</span>
                  <span className="text-blue-900 font-medium">{email}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2">Status:</span>
                  <span className="text-green-700 font-medium">✓ Active</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">
              🚀 What's Next?
            </h3>
            <ul className="text-left text-sm text-orange-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Login to your account using your email and password</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Complete your profile information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Access your learning dashboard and resources</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Attend your scheduled demo session</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">5.</span>
                <span>Start your chess learning journey!</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Login to Your Account
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

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>📌 Important:</strong> You can now login with your email (<strong>{email}</strong>) 
              and the password you just created. Keep your credentials safe!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AccountCreated
