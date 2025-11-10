import { expect } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e, playbackElements } from '../core/elements';
import { getRecordings } from '../core/endpoints';
import { Page } from '../core/page';
import { skipSlide } from '../presentation/util';
import { getNotesLocator, startSharedNotes } from '../sharednotes/util';
import { MultiUsers } from '../user/multiusers';

export class Recording extends MultiUsers {
  public playbackPage!: Page;

  async getRecordingsWithRetry(maxAttempts = 5, delayMs = 5000) {
    await this.modPage.page.waitForTimeout(5000); // minimum wait time expected before first attempt
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data } = await getRecordings(this.modPage.meetingId);
      const { response } = data;

      // Check a successful response with recordings
      if (
        response.returncode?.[0] === 'SUCCESS' &&
        response.messageKey?.[0] !== 'noRecordings' &&
        response.recordings &&
        Array.isArray(response.recordings) &&
        response.recordings.length > 0
      ) {
        return { response };
      }

      if (attempt < maxAttempts) {
        console.log(
          `getRecordings (attempt ${attempt}/${maxAttempts}): No recordings found yet, retrying in ${delayMs}ms`,
        );
        await this.modPage.page.waitForTimeout(delayMs);
      }
    }

    throw new Error(`Failed to retrieve recordings after ${maxAttempts} attempts`);
  }

  async recordMeeting() {
    // check recording modal
    const recordingIndicatorButton = this.modPage.page.locator(`${e.recordingIndicator} button`);
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(
      e.recordingIndicator,
      'should the recording indicator to be displayed once the user join the meeting',
    );
    await expect(
      recordingIndicatorButton,
      'recording indicator button should not have any background color when not recording',
    ).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    // start recording
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.hasElement(e.simpleModal, 'should display the recording modal');
    await this.modPage.hasElement(e.noButton, 'should display the "No" button in the recording modal');
    await this.modPage.hasElement(e.yesButton, 'should display the "Yes" button in the recording modal');
    await this.modPage.waitAndClick(e.yesButton);
    await expect(
      recordingIndicatorButton,
      'recording indicator button should have a red background color when recording',
    ).toHaveCSS('background-color', 'rgb(174, 16, 16)');

    // send chat message
    await openPublicChat(this.modPage);
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElementCount(e.chatUserMessageText, 1, 'should have on message on the public chat');

    // skip slide
    await skipSlide(this.modPage);

    // type on shared notes
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.testMessage);
    await expect(notesLocator, 'should contain the typed text on shared notes').toContainText(e.testMessage, {
      timeout: ELEMENT_WAIT_TIME,
    });

    // stop recording and end meeting
    await expect(recordingIndicatorButton, 'should display 5 seconds on the recording button counter').toContainText(
      '00:05',
      { timeout: ELEMENT_WAIT_LONGER_TIME },
    );
    await this.modPage.waitAndClick(e.leaveMeetingDropdown);
    await this.modPage.waitAndClick(e.endMeetingButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the confirm meeting end modal');
    await this.modPage.waitAndClick(e.confirmEndMeetingButton);
    await this.modPage.hasElement(e.meetingEndedModal, 'should display the meeting ended modal for the moderator');

    // request recording API endpoint with retry logic
    const { response } = await this.getRecordingsWithRetry();
    const recordings = response?.recordings?.[0];
    const recordingData = recordings?.recording?.[0];
    if (!recordingData) {
      throw new Error('Invalid recording data structure in API response');
    }
    expect(response?.returncode?.[0], 'getRecordings API call should return "SUCCESS"').toEqual('SUCCESS');
    expect(recordingData?.metadata?.[0]?.isBreakout?.[0], 'metadata.isBreakout should not be true').toEqual('false');
    // validate recording format
    const playbackData = recordingData?.playback?.[0]?.format?.[0];
    expect(playbackData?.type?.[0], 'playback type should be presentation').toEqual('presentation');
    // validate playback URL
    const playbackUrl = playbackData?.url?.[0];
    if (!playbackUrl) {
      throw new Error('Playback URL not found in API response');
    }
    expect(() => new URL(playbackUrl), 'playback URL should be valid').not.toThrow();
    expect(playbackUrl, 'playback URL should contain "/playback/presentation/"').toContain('/playback/presentation/');
    return playbackUrl;
  }

  async accessPlayback() {
    // check elements
    await this.playbackPage.hasElement(playbackElements.topBar, 'should display the playback top bar');
    await this.playbackPage.hasElement(playbackElements.mediaArea, 'should display the playback media area');
    await this.playbackPage.hasElement(
      playbackElements.applicationArea,
      'should display the playback application area',
    );
    await this.playbackPage.hasElement(playbackElements.topContentArea, 'should display the playback top content area');
    await this.playbackPage.hasElement(
      playbackElements.bottomContentArea,
      'should display the playback bottom content area',
    );
    await this.playbackPage.hasElement(
      playbackElements.sectionLeftButton,
      'should display the playback section left button',
    );
    await this.playbackPage.hasElement(playbackElements.searchButton, 'should display the playback search button');
    await this.playbackPage.hasElement(
      playbackElements.swapContentButton,
      'should display the playback swap content button',
    );
    await this.playbackPage.hasElementCount(
      playbackElements.applicationControlButton,
      2,
      'should display both chat and notes application buttons',
    );
  }

  async darkMode() {
    const getBackgroundColorComputed = (node: Element) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node: Element) => getComputedStyle(node).color;

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
      playbackElements.title,
      playbackElements.sectionLeftButton,
      playbackElements.searchButton,
      playbackElements.swapContentButton,
    ].map((element) => this.playbackPage.page.locator(element));

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
    await this.playbackPage.hasElement(
      `${playbackElements.toggleThemeButton} span.icon-dark`,
      'should display the toggle theme with the dark mode icon by default',
    );
    await this.playbackPage.waitAndClick(playbackElements.toggleThemeButton);
    await this.playbackPage.hasElement(
      `${playbackElements.toggleThemeButton} span.icon-light`,
      'should display the light icon when in dark mode',
    );
    await this.playbackPage.wasRemoved(
      `${playbackElements.toggleThemeButton} span.icon-dark`,
      'should remove the dark mode icon when in dark mode',
    );

    // assert light mode element styles
    expect
      .soft(topBarBackgroundColor, 'should the top bar background color be changed')
      .not.toEqual(await topBarLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(mediaAreaBackgroundColor, 'should the media area background color be changed')
      .not.toEqual(await mediaAreaLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(applicationAreaBackgroundColor, 'should the application area background color be changed')
      .not.toEqual(await applicationAreaLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(topContentAreaBackgroundColor, 'should the top content area background color be changed')
      .not.toEqual(await topContentAreaLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(bottomContentAreaBackgroundColor, 'should the bottom content area background color be changed')
      .not.toEqual(await bottomContentAreaLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(titleColor, 'should the title color be changed')
      .not.toEqual(await titleLocator.evaluate(getTextColorComputed));
    expect
      .soft(sectionLeftColor, 'should the section left color be changed')
      .not.toEqual(await sectionLeftLocator.evaluate(getTextColorComputed));
    expect
      .soft(searchButtonColor, 'should the search button color be changed')
      .not.toEqual(await searchButtonLocator.evaluate(getTextColorComputed));
    expect
      .soft(swapContentColor, 'should the swap content color be changed')
      .not.toEqual(await swapContentLocator.evaluate(getTextColorComputed));
  }

  async swapContent() {
    await this.playbackPage.hasElement(playbackElements.title, 'should display the playback title');
    const titleLocator = this.playbackPage.page.locator(playbackElements.title);
    await expect(this.playbackPage.page, 'top content area should be visible').toHaveScreenshot(
      'default-content-disposition.png',
      {
        mask: [titleLocator],
      },
    );

    await this.playbackPage.waitAndClick(playbackElements.swapContentButton);
    await expect(
      this.playbackPage.page,
      'bottom content area should be visible after swapping content',
    ).toHaveScreenshot('swapped-content-disposition.png', {
      mask: [titleLocator],
    });
  }

  async toggleChatNotes() {
    const notesButtonLocator = this.playbackPage.page
      .locator(playbackElements.applicationControlButton)
      .filter({ has: this.playbackPage.page.locator('span.icon-notes') });
    const chatButtonLocator = this.playbackPage.page
      .locator(playbackElements.applicationControlButton)
      .filter({ has: this.playbackPage.page.locator('span.icon-chat') });

    // toggle to notes - expected chat by default
    await notesButtonLocator.click();
    await this.playbackPage.hasElement(
      playbackElements.notesContentArea,
      'should display the notes content area when notes button is clicked',
    );
    await this.playbackPage.wasRemoved(
      playbackElements.chatContentArea,
      'should not display the chat content area when notes is visible',
    );
    await this.playbackPage.hasText(
      playbackElements.notesContentArea,
      e.testMessage,
      'should display the notes text typed during the meeting',
    );
    // check chat
    await chatButtonLocator.click();
    await this.playbackPage.hasElement(
      playbackElements.chatContentArea,
      'should display the chat content area by default',
    );
    await this.playbackPage.wasRemoved(
      playbackElements.notesContentArea,
      'should not display the notes content area when chat is visible',
    );
    await this.playbackPage.hasText(
      playbackElements.chatContentArea,
      e.message,
      'should display the chat message sent during the meeting',
    );
  }

  async playPause() {
    await this.playbackPage.waitForSelector(playbackElements.title);
    const titleLocator = this.playbackPage.page.locator(playbackElements.title);

    // Assert that progress bar width is 0 at the start
    const progressBarLocator = this.playbackPage.page.locator(playbackElements.progressBar);
    const progressBarInitialWidth = await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth);
    expect(progressBarInitialWidth, 'progress bar width should be 0 at the start').toEqual(0);
    await expect(this.playbackPage.page, 'placeholder BBB icon should be visible').toHaveScreenshot('placeholder.png', {
      mask: [titleLocator],
    });

    const playPauseButtonLocator = this.playbackPage.page.locator(playbackElements.playPauseButton);

    // Resume 500ms playback to display first slide
    await playPauseButtonLocator.click();
    await this.playbackPage.page.waitForTimeout(500);
    await playPauseButtonLocator.click();
    await expect(playPauseButtonLocator, 'play/pause button should display "Play" when paused').toHaveText(/Play/, {
      timeout: ELEMENT_WAIT_TIME,
    });
    await expect(this.playbackPage.page, 'first slide should be visible').toHaveScreenshot('first-slide.png', {
      mask: [titleLocator],
    });

    // Resume playback to the next slide
    await playPauseButtonLocator.click();
    await this.playbackPage.page.waitForTimeout(2000);
    const progressBarResumed = await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth);

    expect(progressBarResumed, 'progress bar width should not be 0 after resuming playback').not.toEqual(0);
    await expect(this.playbackPage.page, 'second slide should be visible').toHaveScreenshot('slide-changed.png', {
      mask: [titleLocator],
    });

    // Pause and wait 2 seconds and check paused playback
    await playPauseButtonLocator.click();
    await expect(playPauseButtonLocator, 'play/pause button should display "Play" when paused').toHaveText(/Play/, {
      timeout: ELEMENT_WAIT_TIME,
    });
    const progressBarPaused = await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth);
    await this.playbackPage.page.waitForTimeout(2000);
    expect(progressBarPaused, 'progress bar width should not change when playback is paused').toEqual(
      await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth),
    );
    await expect(this.playbackPage.page, 'should display the same slide when paused').toHaveScreenshot(
      'playback-paused.png',
      {
        mask: [titleLocator],
      },
    );
  }

  async seekBarForwardBackward() {
    await this.playbackPage.waitForSelector(playbackElements.title);
    const titleLocator = this.playbackPage.page.locator(playbackElements.title);

    // Assert that progress bar width is 0 at the start
    const progressBarLocator = this.playbackPage.page.locator(playbackElements.progressBar);
    const progressBarInitialWidth = await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth);
    expect(progressBarInitialWidth, 'progress bar width should be 0 at the start').toEqual(0);
    await expect(this.playbackPage.page, 'placeholder BBB icon should be visible').toHaveScreenshot('placeholder.png', {
      mask: [titleLocator],
    });

    // play video and seek forward
    await this.playbackPage.waitAndClick(playbackElements.playPauseButton);
    await this.playbackPage.page.waitForTimeout(500);
    await this.playbackPage.waitAndClick(playbackElements.seekForwardButton);
    await this.playbackPage.page.waitForTimeout(500); // wait for the seek action to be processed
    const progressBarFull = await progressBarLocator.evaluate((el) => el.style.width);
    await expect(progressBarFull, 'progress bar width should be 100% after seeking forward').toBe('100%');
    await expect(
      this.playbackPage.page,
      'second slide should be visible when seeking forward till the end',
    ).toHaveScreenshot('seek-forward.png', {
      mask: [titleLocator],
    });

    // seek backward
    await this.playbackPage.waitAndClick(playbackElements.seekBackButton);
    await this.playbackPage.page.waitForTimeout(500);
    const progressBarBackward = await progressBarLocator.evaluate((el: HTMLDivElement) => el.offsetWidth);
    expect(progressBarBackward, 'progress bar width should be 0 after seeking backward').toEqual(0);
    await expect(this.playbackPage.page, 'first slide should be visible when seeking backward').toHaveScreenshot(
      'seek-backward.png',
      {
        mask: [titleLocator],
      },
    );
  }
}
