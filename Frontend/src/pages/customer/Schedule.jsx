import { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import Card from "../../components/common/Card";
import classService from "../../services/classService";
import studentService from "../../services/studentService";
import { convertClassTime } from "../../utils/timezoneHelpers";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Initialize date-fns localizer
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomerSchedule = () => {
  const [classes, setClasses] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentClasses, myStudent] = await Promise.all([
          classService.getMyStudentClasses(),
          studentService.getMyStudent(),
        ]);
        console.log("📚 Loaded student classes:", studentClasses);
        console.log("👤 Student timezone:", myStudent.timezone);
        
        // Convert class times to student's timezone
        const convertedClasses = studentClasses.map((classItem) => {
          if (!classItem.coachTimezone || !myStudent.timezone) {
            return classItem;
          }
          
          const converted = convertClassTime(
            classItem.startTime,
            classItem.coachTimezone,
            myStudent.timezone,
            classItem.durationMinutes || classItem.duration
          );
          
          return {
            ...classItem,
            startTime: converted.startTime, // Use converted time for calendar
            durationMinutes: classItem.durationMinutes || classItem.duration,
          };
        });
        
        setClasses(convertedClasses);
        setStudent(myStudent);
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Transform classes to calendar events
  // Backend returns classes with weekdays array and startTime
  const events = useMemo(() => {
    const allEvents = [];
    const today = startOfDay(new Date());

    // Map weekday strings to numbers
    const dayMap = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
    };

    classes.forEach((classItem) => {
      // Generate events for the next 4 weeks
      for (let week = 0; week < 4; week++) {
        classItem.weekdays.forEach((dayString) => {
          const dayNumber = dayMap[dayString];

          // Calculate the date for this weekday
          const baseDate = addDays(today, week * 7);
          const currentDay = baseDate.getDay();
          const daysToAdd = (dayNumber - currentDay + 7) % 7;
          const eventDate = addDays(baseDate, daysToAdd);

          // Parse startTime (format: "HH:mm")
          const [hours, minutes] = classItem.startTime.split(":");
          const startDateTime = new Date(eventDate);
          startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(
            endDateTime.getMinutes() +
              (classItem.durationMinutes || classItem.duration),
          );

          allEvents.push({
            id: `${classItem._id}-${eventDate.toISOString()}`,
            title: classItem.title,
            start: startDateTime,
            end: endDateTime,
            resource: {
              type: classItem.studentId ? "1-1" : "group",
              meetLink: classItem.meetLink,
              batch: classItem.batchId,
              student: classItem.studentId,
              coach: classItem.coachId,
            },
          });
        });
      }
    });

    console.log("📅 Generated calendar events:", allEvents.length);
    return allEvents;
  }, [classes]);

  // Event style based on type
  const eventStyleGetter = (event) => {
    const backgroundColor =
      event.resource.type === "1-1" ? "#FC8A24" : "#6B8E23";
    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  // Custom toolbar
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };
    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };
    const goToCurrent = () => {
      toolbar.onNavigate("TODAY");
    };
    const changeView = (viewName) => {
      toolbar.onView(viewName);
    };

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
            onClick={() => changeView("month")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === "month"
                ? "bg-navy text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => changeView("week")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === "week"
                ? "bg-navy text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => changeView("day")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === "day"
                ? "bg-navy text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => changeView("agenda")}
            className={`px-3 py-1 rounded text-sm font-medium ${
              toolbar.view === "agenda"
                ? "bg-navy text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Agenda
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Schedule
          </h1>
          <p className="text-gray-600">
            View and manage your chess class schedule
          </p>
        </div>
      </div>

      {/* Timezone Info Banner */}
      {student && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Your Timezone:</strong> {student.timezone}
            <br />
            All class times are displayed in your timezone. You can change your
            timezone in your{" "}
            <a href="/customer/profile" className="underline font-medium">
              profile settings
            </a>
            .
          </p>
        </div>
      )}

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
          Total classes: {classes.length} | Events shown for next 4 weeks
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
            toolbar: CustomToolbar,
          }}
          defaultView="month"
          views={["month", "week", "day", "agenda"]}
        />
      </Card>
    </div>
  );
};

export default CustomerSchedule;
