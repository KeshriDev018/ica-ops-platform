import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import classService from "../../services/classService";
import studentService from "../../services/studentService";
import { convertClassTime, getTimezoneConversionMessage } from "../../utils/timezoneHelpers";

const CustomerClasses = () => {
  const [classes, setClasses] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [myClasses, myStudent] = await Promise.all([
          classService.getMyStudentClasses(),
          studentService.getMyStudent(),
        ]);
        
        // Convert class times to student's timezone
        const convertedClasses = myClasses.map((classItem) => {
          if (!classItem.coachTimezone || !myStudent.timezone) {
            return classItem;
          }
          
          const converted = convertClassTime(
            classItem.startTime,
            classItem.coachTimezone,
            myStudent.timezone,
            classItem.duration
          );
          
          return {
            ...classItem,
            convertedTime: converted,
            displayStartTime: converted.startTime,
            displayEndTime: converted.endTime,
          };
        });
        
        setClasses(convertedClasses);
        setStudent(myStudent);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Group classes by type (1-on-1 vs batch)
  const oneOnOneClasses = classes.filter((c) => !c.batchId);
  const batchClasses = classes.filter((c) => c.batchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Classes
        </h1>
        <p className="text-gray-600">View all your scheduled chess classes</p>
      </div>

      {/* 1-on-1 Classes */}
      {oneOnOneClasses.length > 0 && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            1-on-1 Classes
          </h2>
          <div className="space-y-3">
            {oneOnOneClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-navy transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy mb-2">
                      1-on-1 Chess Class
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Coach:</span>{" "}
                        {classItem.coachId?.email || "Not assigned"}
                      </p>
                      <p>
                        <span className="font-medium">Days:</span>{" "}
                        {classItem.weekdays.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{" "}
                        {classItem.displayStartTime || classItem.startTime} - {classItem.displayEndTime || classItem.endTime}
                        {classItem.convertedTime?.timezoneAbbr && (
                          <span className="ml-1 text-xs font-semibold text-blue-600">
                            {classItem.convertedTime.timezoneAbbr}
                          </span>
                        )}
                        {classItem.convertedTime?.isDifferentDay && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                            {classItem.convertedTime.dayOffset === 1 ? "Next Day" : "Prev Day"}
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {classItem.duration} minutes
                      </p>
                      {classItem.convertedTime?.isDifferentDay && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                          {getTimezoneConversionMessage(classItem.convertedTime)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                    {classItem.meetLink && (
                      <Button
                        onClick={() =>
                          window.open(classItem.meetLink, "_blank")
                        }
                        variant="primary"
                        className="flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={16} />
                        Join Class
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Batch Classes */}
      {batchClasses.length > 0 && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Group/Batch Classes
          </h2>
          <div className="space-y-3">
            {batchClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-navy transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy mb-2">
                      {classItem.batchId?.name || "Batch Class"}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Coach:</span>{" "}
                        {classItem.coachId?.email || "Not assigned"}
                      </p>
                      <p>
                        <span className="font-medium">Batch Level:</span>{" "}
                        {classItem.batchId?.level || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Days:</span>{" "}
                        {classItem.weekdays.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span>{" "}
                        {classItem.displayStartTime || classItem.startTime} - {classItem.displayEndTime || classItem.endTime}
                        {classItem.convertedTime?.timezoneAbbr && (
                          <span className="ml-1 text-xs font-semibold text-blue-600">
                            {classItem.convertedTime.timezoneAbbr}
                          </span>
                        )}
                        {classItem.convertedTime?.isDifferentDay && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                            {classItem.convertedTime.dayOffset === 1 ? "Next Day" : "Prev Day"}
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {classItem.duration} minutes
                      </p>
                      {classItem.convertedTime?.isDifferentDay && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                          {getTimezoneConversionMessage(classItem.convertedTime)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Batch
                    </span>
                    {classItem.meetLink && (
                      <Button
                        onClick={() =>
                          window.open(classItem.meetLink, "_blank")
                        }
                        variant="primary"
                        className="flex items-center gap-2 text-sm"
                      >
                        <ExternalLink size={16} />
                        Join Class
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {classes.length === 0 && (
        <Card>
          <p className="text-gray-500 text-center py-12">
            No classes found. Your coach will schedule classes for you soon.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CustomerClasses;
