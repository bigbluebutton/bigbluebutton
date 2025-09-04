const { MultiUsers } = require("../user/multiusers");
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { expect } = require('playwright/test');
const { apiCall, sleep } = require("../core/helpers");
const Page = require('../core/page');
const { openPublicChat } = require("../chat/util");
const { startSharedNotes, getNotesLocator } = require("../sharednotes/util");

const { playbackElements } = e;

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
          response.recordings.length > 0
        ) {
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
    // check recording modal
    const recordingIndicatorButton = this.modPage.getLocator(`${e.recordingIndicator} button`);
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.recordingIndicator, 'should the recording indicator to be displayed once the user join the meeting');
    await expect(
      recordingIndicatorButton,
      'recording indicator button should not have any background color when not recording'
    ).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    // start recording
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.hasElement(e.simpleModal, 'should display the recording modal');
    await this.modPage.hasElement(e.noButton, 'should display the "No" button in the recording modal');
    await this.modPage.hasElement(e.yesButton, 'should display the "Yes" button in the recording modal');
    await this.modPage.waitAndClick(e.yesButton);
    await expect(
      recordingIndicatorButton,
      'recording indicator button should have a red background color when recording'
    ).toHaveCSS('background-color', 'rgb(174, 16, 16)');

    // send chat message
    await openPublicChat(this.modPage);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElementCount(e.chatUserMessageText, 1, 'should have on message on the public chat');

    // type on shared notes
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.testMessage);
    await expect(notesLocator, 'should contain the typed text on shared notes').toContainText(e.testMessage, { timeout: ELEMENT_WAIT_TIME });

    // stop recording and end meeting
    await expect(
      recordingIndicatorButton,
      'should display 5 seconds on the recording button counter'
    ).toContainText('00:05', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.waitAndClick(e.leaveMeetingDropdown);
    await this.modPage.waitAndClick(e.endMeetingButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the confirm meeting end modal');
    await this.modPage.waitAndClick(e.confirmEndMeetingButton);
    await this.modPage.hasElement(e.meetingEndedModal, 'should display the meeting ended modal for the moderator');

    // request recording API endpoint with retry logic
    const { response } = await this.getRecordingsWithRetry();
    const recordingData = response.recordings[0].recording[0];
    expect(response.returncode[0], 'getRecordings API call should return "SUCCESS"').toEqual('SUCCESS');
    expect(recordingData.metadata[0].isBreakout[0], 'metadata.isBreakout should not be true').toEqual('false');
    // validate recording format
    const playbackData = recordingData.playback[0].format[0];
    expect(playbackData.type[0], 'playback type should be presentation').toEqual('presentation');
    // validate playback URL
    const playbackUrl = playbackData.url[0];
    expect(() => new URL(playbackUrl), 'playback URL should be valid').not.toThrow();
    expect(playbackUrl, 'playback URL should contain "/playback/presentation/"').toContain('/playback/presentation/');
    return playbackUrl;
  }

  async accessPlayback(playbackUrl) {
    const response = await this.playbackPage.page.goto(playbackUrl);
    expect(response.ok(), 'playback URL should be accessible').toBeTruthy();
    await this.playbackPage.page.waitForLoadState('domcontentloaded');
    // check elements
    await this.playbackPage.hasElement(playbackElements.topBar, 'should display the playback top bar');
    await this.playbackPage.hasElement(playbackElements.mediaArea, 'should display the playback media area');
    await this.playbackPage.hasElement(playbackElements.applicationArea, 'should display the playback application area');
    await this.playbackPage.hasElement(playbackElements.topContentArea, 'should display the playback top content area');
    await this.playbackPage.hasElement(playbackElements.bottomContentArea, 'should display the playback bottom content area');
    await this.playbackPage.hasElement(playbackElements.sectionLeftButton, 'should display the playback section left button');
    await this.playbackPage.hasElement(playbackElements.searchButton, 'should display the playback search button');
    await this.playbackPage.hasElement(playbackElements.swapContentButton, 'should display the playback swap content button');
    await this.playbackPage.hasElement(playbackElements.darkThemeButton, 'should display the playback dark theme button');
  }

  async darkMode() {
    const getBackgroundColorComputed = (node) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node) => getComputedStyle(node).color;

    // set all locators
    const [
      topBarLocator,
      mediaAreaLocator,
      applicationAreaLocator,
      topContentAreaLocator,
      bottomContentAreaLocator,
      titleLocator,
      sectionLeftLocator,
      searchButtonLocator,
      swapContentLocator,
    ] = [
      playbackElements.topBar,
      playbackElements.mediaArea,
      playbackElements.applicationArea,
      playbackElements.topContentArea,
      playbackElements.bottomContentArea,
      `${playbackElements.topBar} ${playbackElements.title}`,
      playbackElements.sectionLeftButton,
      playbackElements.searchButton,
      playbackElements.swapContentButton,
    ].map(e => this.playbackPage.getLocator(e));

    // background color elements that should be changed (light mode)
    const topBarBackgroundColor = await topBarLocator.evaluate(getBackgroundColorComputed);
    const mediaAreaBackgroundColor = await mediaAreaLocator.evaluate(getBackgroundColorComputed);
    const applicationAreaBackgroundColor = await applicationAreaLocator.evaluate(getBackgroundColorComputed);
    const topContentAreaBackgroundColor = await topContentAreaLocator.evaluate(getBackgroundColorComputed);
    const bottomContentAreaBackgroundColor = await bottomContentAreaLocator.evaluate(getBackgroundColorComputed);
    // text colors that should be changed (light mode)
    const titleColor = await titleLocator.evaluate(getTextColorComputed);
    const sectionLeftColor = await sectionLeftLocator.evaluate(getTextColorComputed);
    const searchButtonColor = await searchButtonLocator.evaluate(getTextColorComputed);
    const swapContentColor = await swapContentLocator.evaluate(getTextColorComputed);

    // toggle to dark mode
    await this.playbackPage.hasElement(playbackElements.darkThemeButton, 'should display the toggle theme to dark mode');
    await this.playbackPage.waitAndClick(playbackElements.darkThemeButton);
    await this.playbackPage.wasRemoved(playbackElements.darkThemeButton, 'should remove the dark mode button');
    await this.playbackPage.hasElement(playbackElements.lightThemeButton, 'should display the toggle theme to light mode when dark mode is active');

    // assert light mode element styles
    expect.soft(topBarBackgroundColor).not.toEqual(await topBarLocator.evaluate(getBackgroundColorComputed), 'should the top bar background color be changed');
    expect.soft(mediaAreaBackgroundColor).not.toEqual(await mediaAreaLocator.evaluate(getBackgroundColorComputed), 'should the media area background color be changed');
    expect.soft(applicationAreaBackgroundColor).not.toEqual(await applicationAreaLocator.evaluate(getBackgroundColorComputed), 'should the application area background color be changed');
    expect.soft(topContentAreaBackgroundColor).not.toEqual(await topContentAreaLocator.evaluate(getBackgroundColorComputed), 'should the top content area background color be changed');
    expect.soft(bottomContentAreaBackgroundColor).not.toEqual(await bottomContentAreaLocator.evaluate(getBackgroundColorComputed), 'should the bottom content area background color be changed');
    expect.soft(titleColor).not.toEqual(await titleLocator.evaluate(getTextColorComputed), 'should the title color be changed');
    expect.soft(sectionLeftColor).not.toEqual(await sectionLeftLocator.evaluate(getTextColorComputed), 'should the section left color be changed');
    expect.soft(searchButtonColor).not.toEqual(await searchButtonLocator.evaluate(getTextColorComputed), 'should the search button color be changed');
    expect.soft(swapContentColor).not.toEqual(await swapContentLocator.evaluate(getTextColorComputed), 'should the swap content color be changed');
  }

  async swapContent() {
    await this.playbackPage.hasElement(playbackElements.title, 'should display the playback title');
    const titleLocator = this.playbackPage.getLocator(playbackElements.title);
    await expect(this.playbackPage.page, 'top content area should be visible').toHaveScreenshot('default-content-disposition.png', {
      mask: [titleLocator],
    });

    await this.playbackPage.waitAndClick(playbackElements.swapContentButton);
    await expect(this.playbackPage.page, 'bottom content area should be visible after swapping content').toHaveScreenshot('swapped-content-disposition.png', {
      mask: [titleLocator],
    });
  }

  async toggleChatNotes() {
    // check chat - expected by default
    await this.playbackPage.hasElement(playbackElements.chatContentArea, 'should display the chat content area by default');
    await this.playbackPage.wasRemoved(playbackElements.notesContentArea, 'should not display the notes content area when chat is visible');
    await this.playbackPage.hasText(playbackElements.chatContentArea, e.message, 'should display the chat message sent during the meeting');
    // toggle to notes
    await this.playbackPage.waitAndClick(playbackElements.notesButton);
    await this.playbackPage.hasElement(playbackElements.notesContentArea, 'should display the notes content area when notes button is clicked');
    await this.playbackPage.wasRemoved(playbackElements.chatContentArea, 'should not display the chat content area when notes is visible');
    await this.playbackPage.hasText(playbackElements.notesContentArea, e.testMessage, 'should display the notes text typed during the meeting');
  }
}

exports.Recording = Recording;
