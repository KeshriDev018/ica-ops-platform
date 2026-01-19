import { useEffect, useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import Card from '../../components/common/Card'
import scheduleService from '../../services/scheduleService'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Initialize date-fns localizer
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const CoachCalendar = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const coachSchedules = await scheduleService.getByCoachId('coach-1')
        setSchedules(coachSchedules)
      } catch (error) {
        console.error('Error loading calendar:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Transform schedules to calendar events
  const events = useMemo(() => {
    return schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      start: new Date(schedule.start),
      end: new Date(schedule.end),
      resource: {
        type: schedule.type,
        status: schedule.status
      }
    }))
  }, [schedules])

  // Event style based on type
  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource.type === '1-1' ? '#FC8A24' : '#6B8E23'
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    }
    return { style }
  }

  // Custom toolbar
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV')
    }
    const goToNext = () => {
      toolbar.onNavigate('NEXT')
    }
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY')
    }
    const changeView = (viewName) => {
      toolbar.onView(viewName)
    }

    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            ‹ Prev
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Next ›
          </button>
        </div>
        
        <h2 className="text-xl font-secondary font-bold text-navy">
          {toolbar.label}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeView('month')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === 'month'
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => changeView('week')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === 'week'
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => changeView('day')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === 'day'
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => changeView('agenda')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === 'agenda'
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Calendar</h1>
        <p className="text-gray-600">View your full teaching schedule</p>
      </div>

      {/* Legend */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange"></div>
            <span className="text-sm text-gray-700">1-on-1 Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-olive"></div>
            <span className="text-sm text-gray-700">Group Sessions</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Total classes scheduled: {schedules.length}
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar
          }}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
        />
      </Card>
    </div>
  )
}

export default CoachCalendar
