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

const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// Tracks the current theme so updateIconAndTitle() can pick the right icon set.
// Defaults to light until the offscreen document reports otherwise.
let isDarkMode = false;

// Creates the offscreen document (idempotently) so we can read prefers-color-scheme.
async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ["MATCH_MEDIA"],
    justification: "Detect dark/light theme to pick the correct icon set",
  });
}

// Updates the extension's action icon and title to reflect the current week number and theme.
function updateIconAndTitle() {
  const weekNumber = getISOWeekNumber(new Date());
  const theme = isDarkMode ? "dark" : "light";

  chrome.action.setTitle({
    title: `Current week number is ${weekNumber}`,
  });

  chrome.action.setIcon({
    path: `/assets/icons/numbers/${theme}/${weekNumber}.png`,
  });
}

// Set up a repeating alarm to trigger every 60 minutes
chrome.alarms.create("update", { periodInMinutes: 60 });

/**
 * Event listener: Triggered when the "update" alarm goes off.
 */
chrome.alarms.onAlarm.addListener(function (alarm) {
  updateIconAndTitle();
});

/**
 * Event listener: Triggered by offscreen.js whenever prefers-color-scheme changes.
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "theme-changed") {
    isDarkMode = message.isDarkMode;
    updateIconAndTitle();
  }
});

// Runs every time this service worker starts up — on install, browser startup,
// enable/disable toggle, or wake-from-idle.
ensureOffscreenDocument();
updateIconAndTitle();


chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "theme-changed") {
    console.log("[background] received theme-changed:", message.isDarkMode);
    isDarkMode = message.isDarkMode;
    updateIconAndTitle();
  }
});