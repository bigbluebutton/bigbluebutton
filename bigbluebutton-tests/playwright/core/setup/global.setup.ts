import { request, test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import * as helpers from '../helpers';
import { parameters } from '../parameters';

const { server, secret } = parameters;

function initializeLogsFolder(): void {
  const logsDir = path.join(__dirname, '../../logs');
  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(logsDir, { recursive: true });
}

async function validateEnvironmentAndAPI(): Promise<void> {
  const BBB_URL_PATTERN = /^https:\/\/[^/]+\/bigbluebutton\/?$/;

  if (!secret) throw new Error('BBB_SECRET environment variable is not set');
  if (!server) throw new Error('BBB_URL environment variable is not set');
  if (!BBB_URL_PATTERN.test(server)) {
    throw new Error('BBB_URL must follow the pattern "https://DOMAIN_NAME/bigbluebutton/"');
  }

  // Create a request context for API validation
  const requestContext = await request.newContext();

  try {
    // Test the /create endpoint with a temporary meeting
    const testMeetingId = `validation-test-${Date.now()}`;
    const createUrl = helpers.createMeetingUrl(undefined, testMeetingId);
    const createResponse = await requestContext.get(createUrl, { timeout: 15000 });

    if (!createResponse.ok()) {
      const msg = `Failed to validate /create endpoint. HTTP status: ${createResponse.status()}.`;
      console.error(msg);
      throw new Error(msg);
    }

    // Test the /join endpoint (will return an error for non-existent meeting, but validates the endpoint works)
    const joinUrl = helpers.getJoinURL({ meetingID: testMeetingId, fullName: 'Test User' });
    const joinResponse = await requestContext.get(joinUrl, { timeout: 15000 });

    // For /join, we expect either success (200) or a valid BBB error response
    if (!joinResponse.ok() && joinResponse.status() !== 404) {
      const msg = `Failed to validate /join endpoint. HTTP status: ${joinResponse.status()}.`;
      console.error(msg);
      throw new Error(msg);
    }
  } catch (error) {
    console.error('Environment and API validation failed:', (error as Error).message);
    throw error;
  } finally {
    await requestContext.dispose();
  }
}

setup('Initialize logs folder and validate environment variables', async () => {
  initializeLogsFolder();
  await validateEnvironmentAndAPI();
});
