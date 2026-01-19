import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const CoachMaterials = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Materials</h1>
          <p className="text-gray-600">Upload and organize teaching materials</p>
        </div>
        <Button variant="primary" size="md">Upload Material</Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-lg mb-4">No materials uploaded yet</p>
          <p className="text-sm text-gray-400">Upload teaching materials to share with your batches</p>
        </div>
      </Card>
    </div>
  )
}

export default CoachMaterials
