import { format, parse } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { getTimezoneAbbreviation } from "./timezoneConstants";

/**
 * Convert class time from coach timezone to student timezone
 * @param {string} startTime - Time string in "HH:mm" format (e.g., "18:30")
 * @param {string} fromTimezone - Coach's timezone (IANA format, e.g., "Asia/Kolkata")
 * @param {string} toTimezone - Student's timezone (IANA format, e.g., "America/New_York")
 * @param {number} durationMinutes - Duration of the class in minutes
 * @returns {object} - Converted time information
 */
export const convertClassTime = (
  startTime,
  fromTimezone,
  toTimezone,
  durationMinutes = 60
) => {
  try {
    // If timezones are the same, no conversion needed
    if (fromTimezone === toTimezone) {
      const [hours, minutes] = startTime.split(":");
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + durationMinutes;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

      return {
        startTime,
        endTime,
        timezone: fromTimezone,
        timezoneAbbr: getTimezoneAbbreviation(fromTimezone),
        isDifferentDay: false,
        dayOffset: 0,
        formattedTime: `${startTime} - ${endTime}`,
      };
    }

    // Create a reference date (today) for conversion
    const referenceDate = new Date();
    const year = referenceDate.getFullYear();
    const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
    const day = String(referenceDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Parse the time in the coach's timezone
    const dateTimeString = `${dateString}T${startTime}:00`;
    const coachTime = new Date(dateTimeString);
    
    // Convert coach's local time to UTC
    const utcTime = fromZonedTime(coachTime, fromTimezone);
    
    // Convert UTC to student's timezone
    const studentTime = toZonedTime(utcTime, toTimezone);

    // Calculate end time in student's timezone
    const studentEndTime = new Date(studentTime.getTime() + durationMinutes * 60000);

    // Format times
    const convertedStartTime = format(studentTime, "HH:mm");
    const convertedEndTime = format(studentEndTime, "HH:mm");

    // Check if it's a different day
    const coachDay = coachTime.getDate();
    const studentDay = studentTime.getDate();
    const dayOffset = studentDay - coachDay;

    // Get timezone abbreviations
    const timezoneAbbr = getTimezoneAbbreviation(toTimezone);

    // Format display string
    let formattedTime = `${convertedStartTime} - ${convertedEndTime}`;
    if (timezoneAbbr) {
      formattedTime += ` ${timezoneAbbr}`;
    }

    return {
      startTime: convertedStartTime,
      endTime: convertedEndTime,
      timezone: toTimezone,
      timezoneAbbr,
      isDifferentDay: dayOffset !== 0,
      dayOffset, // +1 = next day, -1 = previous day
      formattedTime,
      originalStartTime: startTime,
      originalTimezone: fromTimezone,
    };
  } catch (error) {
    console.error("Timezone conversion error:", error);
    // Return original time if conversion fails
    return {
      startTime,
      endTime: startTime,
      timezone: fromTimezone,
      timezoneAbbr: getTimezoneAbbreviation(fromTimezone),
      isDifferentDay: false,
      dayOffset: 0,
      formattedTime: startTime,
      error: error.message,
    };
  }
};

/**
 * Format day offset for display
 * @param {number} dayOffset - Day offset from conversion (+1, 0, -1)
 * @returns {string} - Human-readable day offset (e.g., "Next Day", "Same Day", "Previous Day")
 */
export const formatDayOffset = (dayOffset) => {
  if (dayOffset === 1) return "Next Day";
  if (dayOffset === -1) return "Previous Day";
  return "";
};

/**
 * Get a friendly timezone conversion message
 * @param {object} conversionResult - Result from convertClassTime
 * @returns {string} - User-friendly message about timezone conversion
 */
export const getTimezoneConversionMessage = (conversionResult) => {
  if (!conversionResult || !conversionResult.isDifferentDay) {
    return "";
  }

  const { dayOffset, originalStartTime, originalTimezone, startTime, timezone } = conversionResult;
  const originalAbbr = getTimezoneAbbreviation(originalTimezone);
  const convertedAbbr = getTimezoneAbbreviation(timezone);

  if (dayOffset === 1) {
    return `⚠️ This class is scheduled for ${originalStartTime} ${originalAbbr} (coach time), which is ${startTime} ${convertedAbbr} the next day for you.`;
  } else if (dayOffset === -1) {
    return `⚠️ This class is scheduled for ${originalStartTime} ${originalAbbr} (coach time), which is ${startTime} ${convertedAbbr} the previous day for you.`;
  }

  return "";
};

/**
 * Convert multiple class times at once
 * @param {Array} classes - Array of class objects with startTime, coachTimezone, duration
 * @param {string} studentTimezone - Student's timezone
 * @returns {Array} - Array of classes with converted times
 */
export const convertMultipleClassTimes = (classes, studentTimezone) => {
  return classes.map((classItem) => {
    const conversion = convertClassTime(
      classItem.startTime,
      classItem.coachTimezone,
      studentTimezone,
      classItem.duration || classItem.durationMinutes || 60
    );

    return {
      ...classItem,
      convertedTime: conversion,
    };
  });
};
