import { Link, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import useDemoStore from '../../store/demoStore'

const VictoryKnight = lazy(() => import('../../components/3d/VictoryKnight'))

const ThankYou = () => {
  const location = useLocation()
  const setDemoData = useDemoStore(state => state.setDemoData)
  
  // Get demo data from location state (passed from BookDemo)
  const demoData = location.state?.demoData
  
  useEffect(() => {
    // Store demo data if available
    if (demoData) {
      setDemoData(demoData)
    }
  }, [demoData, setDemoData])
  
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* 3D Victory Knight */}
          <div className="w-full h-[400px] relative order-2 md:order-1">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
              </div>
            }>
              <VictoryKnight />
            </Suspense>
          </div>
          
          {/* Content */}
          <div className="text-center md:text-left order-1 md:order-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6 animate-bounce">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h1 className="text-4xl font-secondary font-bold text-navy mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-2 text-lg">
              Your demo request has been successfully submitted.
            </p>
            <p className="text-gray-600 mb-8">
              Our team will contact you shortly to confirm your demo session time.
            </p>
            <div className="space-y-3">
              <Link to="/demo-access">
                <Button variant="secondary" size="lg" className="w-full">
                  Access Demo Account
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ThankYou
