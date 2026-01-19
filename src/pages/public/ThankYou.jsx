import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-600 text-4xl">✓</span>
        </div>
        <h1 className="text-4xl font-secondary font-bold text-navy mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-2 text-lg">
          Your demo request has been successfully submitted.
        </p>
        <p className="text-gray-600 mb-8">
          Our team will contact you shortly to confirm your demo session time.
        </p>
        <div className="space-y-4">
          <Link to="/">
            <Button variant="primary" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default ThankYou
