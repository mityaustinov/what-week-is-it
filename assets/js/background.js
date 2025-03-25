/**
 * Calculates the ISO 8601 week number for a given date.
 * The ISO week starts on Monday and the first week of the year is the one that contains the first Thursday of the year.
 *
 * @param {Date} date - The date to calculate the week number for.
 * @returns {number} - The ISO week number (1–53).
 */
function getISOWeekNumber(date) {
  const tempDate = new Date(date);

  // Zero out time
  tempDate.setHours(0, 0, 0, 0);
  
  // Adjust to nearest Thursday
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  
  // Week 1 is the week with Jan 4th
  const week1 = new Date(tempDate.getFullYear(), 0, 4);

  return 1 + Math.round(((tempDate - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);  
}


// Updates the extension's action icon and title to reflect the current week number.
function updateIconAndTitle() {
  const weekNumber = getISOWeekNumber(new Date());
  
  chrome.action.setTitle({
    title: `Current week number is ${weekNumber}`,
  });

  chrome.action.setIcon({
    path: `/assets/icons/numbers/${weekNumber}.png`,
  });
}


// Set up a repeating alarm to trigger every 60 minutes
chrome.alarms.create("update", { periodInMinutes: 60 });

/**
 * Event listener: Triggered when the extension is installed or updated.
 * Updates the icon and title immediately.
 */
chrome.runtime.onInstalled.addListener(function () {
  updateIconAndTitle();
});

/**
 * Event listener: Triggered when the browser starts up.
 * Ensures the extension reflects the current week on launch.
 */
chrome.runtime.onStartup.addListener(function () {
  updateIconAndTitle();
});

/**
 * Event listener: Triggered when the "update" alarm goes off.
 * Keeps the icon and title up-to-date over time.
 */
chrome.alarms.onAlarm.addListener(function (alarm) {
  updateIconAndTitle();
});