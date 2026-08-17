// This runs in an offscreen document, which — unlike the service worker —
// has access to `window`, so it can check the OS/browser color scheme.
//
// Note: the MediaQueryList 'change' event is unreliable inside offscreen
// documents (they aren't part of a composited window), so we poll instead.

let lastReportedIsDarkMode = null;

function checkAndReportTheme() {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDarkMode === lastReportedIsDarkMode) return;

  lastReportedIsDarkMode = isDarkMode;
  chrome.runtime.sendMessage({
    type: "theme-changed",
    isDarkMode,
  });
}

// Check immediately on load...
checkAndReportTheme();

// ...and then periodically, since we can't reliably listen for the change event here.
setInterval(checkAndReportTheme, 2000);