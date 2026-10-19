// A recorded meeting with media, for docker/tests/stack/recording-e2e.sh: a moderator joins with
// the fake microphone and webcam of upstream's Playwright setup (bigbluebutton-tests/playwright,
// core/setup/browsersConfig.ts), stays for RECORDING_E2E_MEDIA_SECONDS, then the meeting is ended.
// recording-e2e.sh copies this directory into a copy of bigbluebutton-tests/playwright, so the
// imports are upstream's helpers.
import { expect, test } from '@playwright/test';

import { apiCall } from '../core/helpers';
import { Page } from '../core/page';

type ApiResponse = { response: Record<string, string[]> };

const mediaSeconds = Number(process.env.RECORDING_E2E_MEDIA_SECONDS || '20');

test('recorded meeting with microphone and webcam', async ({ browser, page }) => {
  const meetingID = `recording-e2e-${Date.now()}`;
  const create = await apiCall<ApiResponse>('create', {
    name: meetingID,
    meetingID,
    moderatorPW: 'mp',
    attendeePW: 'ap',
    record: 'true',
    autoStartRecording: 'true',
    allowStartStopRecording: 'true',
  });
  expect(create.data.response.returncode[0], 'create should succeed').toBe('SUCCESS');
  // The record id of a meeting is its internal meeting id; recording-e2e.sh follows it.
  console.log(`RECORD-ID ${create.data.response.internalMeetingID[0]}`);

  const moderator = new Page(browser, page);
  await moderator.init(true, { meetingId: meetingID, fullName: 'Moderator', shouldCloseAudioModal: false });
  await moderator.joinMicrophone();
  console.log('MEDIA microphone joined, talking indicator shown');
  await moderator.shareWebcam();
  console.log('MEDIA webcam shared');

  const info = await apiCall<ApiResponse>('getMeetingInfo', { meetingID });
  expect(info.data.response.recording?.[0], 'the meeting should be recording (autoStartRecording)').toBe('true');
  expect(info.data.response.voiceParticipantCount?.[0], 'one voice participant').toBe('1');
  expect(info.data.response.videoCount?.[0], 'one webcam').toBe('1');
  console.log('MEDIA getMeetingInfo: recording=true voiceParticipantCount=1 videoCount=1');

  await page.waitForTimeout(mediaSeconds * 1000);

  const end = await apiCall<ApiResponse>('end', { meetingID });
  expect(end.data.response.returncode[0], 'end should succeed').toBe('SUCCESS');
  console.log(`ENDED after ${mediaSeconds}s with media`);
});
