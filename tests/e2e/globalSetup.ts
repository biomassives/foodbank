import * as fs from 'fs';
import * as path from 'path';
// Must run first — launches Chromium and sets PUPPETEER_WS_ENDPOINTS
import puppeteerSetup from 'jest-environment-puppeteer/setup';

export default async function globalSetup(globalConfig: unknown) {
  await puppeteerSetup(globalConfig);

  const recordingsDir = path.resolve(process.cwd(), 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }
}
