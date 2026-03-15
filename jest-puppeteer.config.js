// jest-puppeteer configuration
// When BASE_URL is set, tests run against that URL (no local server started).
// When BASE_URL is unset, quasar dev is started automatically on port 9000.

const useRemote = !!process.env.BASE_URL;

module.exports = {
  launch: {
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  },
  // Only spin up local dev server when not targeting a remote URL
  server: useRemote
    ? undefined
    : {
        command: 'quasar dev --port 9005',
        port: 9005,
        launchTimeout: 120000,
        debug: false,
      },
};
