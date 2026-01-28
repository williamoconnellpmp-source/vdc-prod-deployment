// lib/life_sciences_app_lib/utils.js

/**
 * Formats a UTC timestamp in a human-readable format
 * @param {string|Date} timestamp - ISO 8601 timestamp string or Date object
 * @returns {string} Human-readable format like "Jan 27, 2026 at 11:44 PM UTC"
 */
export function formatUtcTimestamp(timestamp) {
  if (!timestamp) return "—";
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp); // Return as-is if invalid
    
    // Format: "Jan 27, 2026 at 11:44 PM UTC"
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    };
    
    const formatted = date.toLocaleString("en-US", options);
    return `${formatted} UTC`;
  } catch {
    return String(timestamp);
  }
}

/**
 * Formats a UTC timestamp for audit trail (ISO 8601 with Z)
 * @param {string|Date} timestamp - ISO 8601 timestamp string or Date object
 * @returns {string} ISO 8601 format like "2026-01-27T23:44:35.412663Z"
 */
export function formatUtcTimestampForAudit(timestamp) {
  if (!timestamp) return "—";
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    
    // Convert to ISO 8601 with Z (UTC)
    return date.toISOString().replace(/\.(\d{3})Z$/, ".$1Z");
  } catch {
    return String(timestamp);
  }
}
