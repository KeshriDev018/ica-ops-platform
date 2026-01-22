/**
 * TIMEZONE OPTIONS
 * User-friendly timezone labels with country/region names
 * Stores IANA timezone strings for accurate conversion
 */
export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "🇮🇳 India (IST)", abbreviation: "IST" },
  { value: "Asia/Dubai", label: "🇦🇪 UAE (GST)", abbreviation: "GST" },
  { value: "Asia/Singapore", label: "🇸🇬 Singapore (SGT)", abbreviation: "SGT" },
  { value: "Asia/Hong_Kong", label: "🇭🇰 Hong Kong (HKT)", abbreviation: "HKT" },
  { value: "Europe/London", label: "🇬🇧 United Kingdom (GMT)", abbreviation: "GMT" },
  { value: "Europe/Paris", label: "🇫🇷 Europe - Paris (CET)", abbreviation: "CET" },
  { value: "America/New_York", label: "🇺🇸 USA - East Coast (EST)", abbreviation: "EST" },
  { value: "America/Chicago", label: "🇺🇸 USA - Central (CST)", abbreviation: "CST" },
  { value: "America/Los_Angeles", label: "🇺🇸 USA - West Coast (PST)", abbreviation: "PST" },
  { value: "Australia/Sydney", label: "🇦🇺 Australia - Sydney (AEDT)", abbreviation: "AEDT" },
  { value: "Pacific/Auckland", label: "🇳🇿 New Zealand (NZDT)", abbreviation: "NZDT" },
];

/**
 * Get timezone label by value
 * @param {string} timezoneValue - IANA timezone string (e.g., "Asia/Kolkata")
 * @returns {string} - User-friendly label or the value itself if not found
 */
export const getTimezoneLabel = (timezoneValue) => {
  const timezone = TIMEZONE_OPTIONS.find((tz) => tz.value === timezoneValue);
  return timezone ? timezone.label : timezoneValue;
};

/**
 * Get timezone abbreviation by value
 * @param {string} timezoneValue - IANA timezone string (e.g., "Asia/Kolkata")
 * @returns {string} - Timezone abbreviation (e.g., "IST")
 */
export const getTimezoneAbbreviation = (timezoneValue) => {
  const timezone = TIMEZONE_OPTIONS.find((tz) => tz.value === timezoneValue);
  return timezone ? timezone.abbreviation : "";
};

/**
 * Validate if timezone value is supported
 * @param {string} timezoneValue - IANA timezone string
 * @returns {boolean} - True if timezone is in supported list
 */
export const isValidTimezone = (timezoneValue) => {
  return TIMEZONE_OPTIONS.some((tz) => tz.value === timezoneValue);
};
