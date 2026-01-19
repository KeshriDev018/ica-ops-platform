import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import FormInput from '../../components/forms/FormInput'
import FormSelect from '../../components/forms/FormSelect'
import FloatingChessPieces from '../../components/common/FloatingChessPieces'
import { bookDemoSchema } from '../../utils/validationSchemas'
import demoService from '../../services/demoService'

const BookDemo = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(bookDemoSchema),
    defaultValues: {
      timezone: 'Asia/Kolkata',
      preferred_language: 'English'
    }
  })

  const onSubmit = async (data) => {
    try {
      await demoService.create({
        ...data,
        scheduled_start: `${data.preferred_date}T${data.preferred_time}:00`,
        status: 'BOOKED',
        preferred_language: data.preferred_language
      })
      navigate('/thank-you')
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Failed to book demo. Please try again.'
      })
    }
  }

  const timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' }
  ]

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' }
  ]

  return (
    <div className="min-h-screen bg-cream py-16 px-6 relative">
      <FloatingChessPieces />
      <div className="container mx-auto max-w-2xl relative z-10">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-secondary font-bold text-navy mb-2">Book a Free Demo</h1>
            <p className="text-gray-600">Experience our coaching methodology firsthand</p>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="student_name"
              label="Student Name"
              placeholder="Enter student's name"
              error={errors.student_name}
              {...register('student_name')}
            />

            <FormInput
              id="parent_name"
              label="Parent Name"
              placeholder="Enter parent's name"
              error={errors.parent_name}
              {...register('parent_name')}
            />

            <FormInput
              id="parent_email"
              label="Parent Email"
              type="email"
              placeholder="parent@example.com"
              error={errors.parent_email}
              {...register('parent_email')}
            />

            <FormSelect
              id="preferred_language"
              label="Preferred Language"
              options={languages}
              error={errors.preferred_language}
              {...register('preferred_language')}
            />

            <FormSelect
              id="timezone"
              label="Timezone"
              options={timezones}
              error={errors.timezone}
              {...register('timezone')}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                id="preferred_date"
                label="Preferred Date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                error={errors.preferred_date}
                {...register('preferred_date')}
              />

              <FormInput
                id="preferred_time"
                label="Preferred Time"
                type="time"
                error={errors.preferred_time}
                {...register('preferred_time')}
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Book Free Demo'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default BookDemo
