const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { expect } = require('playwright/test');
const { apiCall, sleep } = require("../core/helpers");

class Recording extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async getRecordingsApi() {
    return apiCall('getRecordings', { meetingID: this.modPage.meetingId });
  }

  async getRecordingsWithRetry(maxAttempts = 5, delayMs = 5000) {
    await sleep(5000); // minimum wait time expected before first attempt
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { response } = await this.getRecordingsApi();

      // Check a successful response with recordings
      if (response.returncode[0] === 'SUCCESS' && 
          response.messageKey?.[0] !== 'noRecordings' && 
          response.recordings && 
          response.recordings.length > 0) {
        return { response };
      }

      if (attempt < maxAttempts) {
        console.log(`getRecordings (attempt ${attempt}/${maxAttempts}): No recordings found yet, retrying in ${delayMs}ms`);
        await sleep(delayMs);
      }
    }

    throw new Error(`Failed to retrieve recordings after ${maxAttempts} attempts`);
  }

  async recordMeeting() {
    // Check recording modal
    const recordingIndicatorButton = this.modPage.getLocator(`${e.recordingIndicator} button`);
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.recordingIndicator, 'should the recording indicator to be displayed once the user join the meeting');
    await expect(
      recordingIndicatorButton,
      'recording indicator button should not have any background color when not recording'
    ).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    // Start recording
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.hasElement(e.simpleModal, 'should display the recording modal');
    await this.modPage.hasElement(e.noButton, 'should display the "No" button in the recording modal');
    await this.modPage.hasElement(e.yesButton, 'should display the "Yes" button in the recording modal');
    await this.modPage.waitAndClick(e.yesButton);
    await expect(
      recordingIndicatorButton,
      'recording indicator button should have a red background color when recording'
    ).toHaveCSS('background-color', 'rgb(174, 16, 16)');

    // Stop recording and end meeting
    await expect(
      recordingIndicatorButton,
      'should display 2 seconds on the recording button counter'
    ).toContainText('00:02', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.waitAndClick(e.leaveMeetingDropdown);
    await this.modPage.waitAndClick(e.endMeetingButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the confirm meeting end modal');
    await this.modPage.waitAndClick(e.confirmEndMeetingButton);
    await this.modPage.hasElement(e.meetingEndedModal, 'should display the meeting ended modal for the moderator');

    // Request recording API endpoint with retry logic
    const { response } = await this.getRecordingsWithRetry();
    const recordingData = response.recordings[0].recording[0];
    expect(response.returncode[0], 'getRecordings API call should return "SUCCESS"').toEqual('SUCCESS');
    expect(recordingData.metadata[0].isBreakout[0], 'metadata.isBreakout should not be true').toEqual('false');
    // Validate recording format
    const playbackData = recordingData.playback[0].format[0];
    expect(playbackData.type[0], 'playback type should be presentation').toEqual('presentation');
    // Validate playback URL
    const playbackUrl = playbackData.url[0];
    expect(() => new URL(playbackUrl), 'playback URL should be valid').not.toThrow();
    expect(playbackUrl, 'playback URL should contain "/playback/presentation/"').toContain('/playback/presentation/');

    // Access playback URL in a new tab and verify it returns 200
    const newPage = await this.modPage.context.newPage();
    try {
      const response = await newPage.goto(playbackUrl);
      await expect(response.ok(), 'playback URL should be accessible').toBeTruthy();
    } finally {
      await newPage.close();
    }
  }
}

exports.Recording = Recording;
