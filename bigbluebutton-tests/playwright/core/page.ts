/* eslint-disable max-classes-per-file */
import {
  Browser,
  BrowserContext,
  Download,
  expect,
  Frame as PlaywrightFrame,
  Locator,
  Page as PlaywrightPage,
  test,
  TestInfo,
} from '@playwright/test';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  VIDEO_LOADING_WAIT_TIME,
} from './constants';
import { elements as e } from './elements';
import * as helpers from './helpers';
import Logger from './logger';
import { parameters } from './parameters';
import { generateSettingsData, Settings } from './settings';

dotenv.config();

export interface InitOptionsProps {
  shouldCloseAudioModal?: boolean;
  fullName?: string;
  meetingId?: string;
  createParameter?: string;
  joinParameter?: string;
  customMeetingId?: string;
  isRecording?: boolean;
  skipSessionDetailsModal?: boolean;
  shouldCheckAllInitialSteps?: boolean;
  shouldAvoidLayoutCheck?: boolean;
  forceErrorLogFailure?: boolean;
  testInfo?: TestInfo | null;
}

interface JoinMicrophoneOptions {
  shouldUnmute?: boolean;
}

interface ShareWebcamOptions {
  shouldConfirmSharing?: boolean;
  videoPreviewTimeout?: number;
}

interface HandleDownloadResult {
  download: Download;
  content: string;
}

export class Page {
  public browser: Browser;

  public page: PlaywrightPage;

  public logger: Logger;

  public testInfo: TestInfo | null;

  public context?: BrowserContext;

  public username: string;

  public isModerator: boolean;

  public meetingId: string;

  public settings?: Settings;

  constructor(browser: Browser, page: PlaywrightPage, testInfo: TestInfo | null = null) {
    this.browser = browser;
    this.page = page;
    this.logger = new Logger(this);
    this.testInfo = testInfo || null;
    this.username = '';
    this.isModerator = false;
    this.meetingId = '';

    if (testInfo) {
      this.logger.setTestInfo(testInfo);
    }

    if ('context' in page) {
      this.context = page.context();
    }
  }

  async getLastTargetPage(context: BrowserContext): Promise<Page> {
    const contextPages = await context.pages();
    return new Page(this.browser, contextPages[contextPages.length - 1], this.testInfo);
  }

  async init(isModerator: boolean, initOptions?: InitOptionsProps): Promise<void> {
    const {
      shouldCloseAudioModal = true,
      fullName,
      meetingId,
      createParameter,
      joinParameter,
      customMeetingId,
      isRecording,
      skipSessionDetailsModal = true,
      shouldCheckAllInitialSteps,
      shouldAvoidLayoutCheck,
      forceErrorLogFailure,
      testInfo,
    } = initOptions || {};

    if (!this.testInfo && testInfo) this.testInfo = testInfo;

    this.username = fullName ?? parameters.fullName;
    this.isModerator = isModerator;

    await helpers.setBrowserLogs(this, forceErrorLogFailure);

    this.meetingId = meetingId || (await helpers.createMeeting(createParameter, customMeetingId));
    const joinUrl = helpers.getJoinURL({
      meetingID: this.meetingId,
      fullName: this.username,
      options: { isModerator, joinParameter, skipSessionDetailsModal },
    });
    const response = await this.page.goto(joinUrl);
    await expect(response!.ok()).toBeTruthy();
    const hasErrorLabel = await this.checkElement(e.errorMessageLabel);
    await expect(
      hasErrorLabel,
      'should pass the authentication and the layout element should be displayed',
    ).toBeFalsy();
    if (shouldCheckAllInitialSteps !== undefined ? shouldCheckAllInitialSteps : true) {
      if (!shouldAvoidLayoutCheck) await this.waitForSelector('div#layout', ELEMENT_WAIT_EXTRA_LONG_TIME);
      this.settings = await generateSettingsData(this.page);
      const { autoJoinAudioModal } = this.settings || {};
      if (isRecording && !isModerator) await this.closeRecordingModal();
      if (shouldCloseAudioModal && autoJoinAudioModal) await this.closeAudioModal();
    }
    // overwrite for font used in CI
    await this.page.addStyleTag({
      content: `
        body {
          font-family: 'Liberation Sans', Arial, sans-serif;
        }`,
    });
  }

  async handleDownload(
    locator: Locator,
    testInfo?: TestInfo,
    timeout: number = ELEMENT_WAIT_TIME,
  ): Promise<HandleDownloadResult> {
    const [download] = await Promise.all([this.page.waitForEvent('download', { timeout }), locator.click({ timeout })]);
    await expect(download).toBeTruthy();
    const filePath = await download.path();
    const content = await readFileSync(filePath!, 'utf8');

    const currentTestInfo = testInfo ?? this.testInfo;
    if (currentTestInfo) {
      await currentTestInfo.attach('downloaded', { path: filePath! });
    }

    return {
      download,
      content,
    };
  }

  async handleNewTab(selector: string, context: BrowserContext): Promise<PlaywrightPage> {
    const [newPage] = await Promise.all([context.waitForEvent('page'), this.waitAndClick(selector)]);
    return newPage;
  }

  async joinMicrophone(options: JoinMicrophoneOptions = {}): Promise<void> {
    const { shouldUnmute = true } = options;
    await this.waitForSelector(e.audioModal);
    await this.waitAndClick(e.microphoneButton);
    await this.waitForSelector(e.stopHearingButton);
    await this.waitAndClick(e.joinEchoTestButton);
    await this.wasRemoved(
      e.establishingAudioLabel,
      'should have the establish audio label element removed when established',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.hasElement(e.unmuteMicButton, 'should display the unmute mic button after joining microphone');
    if (shouldUnmute) {
      await this.waitAndClick(e.unmuteMicButton);
      await this.hasElement(e.muteMicButton, 'should display the mute mic button after clicking to unmute');
      await this.checkUserTalkingIndicator();
    }
  }

  async leaveAudio(): Promise<void> {
    await this.waitAndClick(e.audioDropdownMenu);
    await this.waitAndClick(e.leaveAudio);
    await this.hasElement(e.joinAudio, 'should display the join audio button');
  }

  async logoutFromMeeting(): Promise<void> {
    const { directLeaveButton } = this.settings || {};

    if (directLeaveButton) {
      await this.waitAndClick(e.leaveMeetingDropdown);
      await this.waitAndClick(e.directLogoutButton);
    } else {
      await this.waitAndClick(e.optionsButton);
      await this.waitAndClick(e.optionsLogoutButton);
    }
  }

  async shareWebcam(options: ShareWebcamOptions = {}): Promise<void> {
    const { shouldConfirmSharing = true, videoPreviewTimeout = ELEMENT_WAIT_TIME } = options;
    const { webcamSharingEnabled } = this.settings || (await generateSettingsData(this.page)) || {};

    test.fail(!webcamSharingEnabled, 'Webcam sharing is disabled');

    if (!webcamSharingEnabled) {
      await this.wasRemoved(e.joinVideo, 'should not display the join video button');
      return;
    }
    await this.waitAndClick(e.joinVideo);
    if (shouldConfirmSharing) {
      await this.page.bringToFront();
      await this.hasElement(
        e.webcamMirroredVideoPreview,
        'should display the video preview when sharing webcam ',
        videoPreviewTimeout,
      );
      await this.waitAndClick(e.startSharingWebcam);
    }
    await this.waitForSelector(e.webcamMirroredVideoContainer, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.wasRemoved(
      e.webcamConnecting,
      'should stop showing the webcam sharing element after full connection',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  getVisibleLocator(selector: string): Locator {
    return this.page.locator(`${selector}:visible`);
  }

  getLocatorByIndex(selector: string, index: number): Locator {
    return this.page.locator(selector).nth(index);
  }

  async getSelectorCount(selector: string): Promise<number> {
    const locator = this.page.locator(selector);
    return locator.count();
  }

  async grantClipboardPermissions(): Promise<void> {
    console.log('==> Granting clipboard permissions');
    await this.context!.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_URL });
  }

  async getCopiedText(): Promise<string> {
    return this.page.evaluate(async () => navigator.clipboard.readText());
  }

  async closeAudioModal(): Promise<void> {
    await this.hasElement(e.audioModal, 'should display the audio modal', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.waitAndClick(e.closeModal);
  }

  async closeRecordingModal(): Promise<void> {
    await this.waitForSelector(e.simpleModal, ELEMENT_WAIT_LONGER_TIME);
    await this.waitAndClick(e.confirmRecording);
  }

  async waitForSelector(selector: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForSelectorDetached(selector: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'detached', timeout });
  }

  async getElementBoundingBox(selector: string) {
    const element = await this.page.$(selector);
    return element!.boundingBox();
  }

  async waitUntilHaveCountSelector(
    selector: string,
    count: number,
    timeout: number = ELEMENT_WAIT_TIME,
  ): Promise<void> {
    await this.page.waitForFunction(
      ([selector, count]) => document.querySelectorAll(selector as string).length === count,
      [selector, count],
      { timeout },
    );
  }

  async type(selector: string, text: string): Promise<void> {
    const handle = this.page.locator(selector);
    await handle.pressSequentially(text, { timeout: ELEMENT_WAIT_TIME });
  }

  async fill(selector: string, text: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.fill(text);
  }

  async waitAndClickElement(element: string, index: number = 0, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.waitForSelector(element, timeout);
    await this.page.evaluate(
      ([element, index]) => {
        const elements = document.querySelectorAll(element as string);
        if (elements.length > Number(index) && elements[Number(index)]) {
          (elements[Number(index)] as HTMLElement).click();
        }
      },
      [element, index],
    );
  }

  async waitAndClick(selector: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.waitForSelector(selector, timeout);
    await this.page.focus(selector);
    await this.page.click(selector, { timeout });
  }

  async getByLabelAndClick(label: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.page.getByLabel(label).first().click({ timeout });
  }

  async checkUserTalkingIndicator(): Promise<void> {
    const isTalkingLocator = this.page.locator(e.isTalking).locator(`:text-is("${this.username}")`);
    await expect(
      isTalkingLocator,
      `should display the "${this.username}" user's talking indicator to himself`,
    ).toBeVisible();
  }

  async checkElement(selector: string, index: number = 0): Promise<boolean> {
    return this.page.evaluate(
      ([selector, index]) => {
        const elements = document.querySelectorAll(selector as string);
        return elements.length > Number(index) && elements[Number(index)] !== null;
      },
      [selector, index],
    );
  }

  async wasRemoved(selector: string, description: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator, description).not.toBeVisible({ timeout });
  }

  async wasNthElementRemoved(selector: string, count: number, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.page.locator(`:nth-match(${selector},${count})`);
    await expect(locator).not.toBeVisible({ timeout });
  }

  async hasElement(selector: string, description: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator, description).toBeVisible({ timeout });
  }

  async hasNElements(
    selector: string,
    count: number,
    description: string,
    timeout: number = ELEMENT_WAIT_TIME,
  ): Promise<void> {
    const locator = this.page.locator(`:nth-match(${selector},${count})`);
    await expect(locator, description).toBeVisible({ timeout });
  }

  async hasElementDisabled(selector: string, description: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator, description).toBeDisabled({ timeout });
  }

  async hasElementEnabled(selector: string, description: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.page.locator(`${selector}:not([disabled])`);
    await expect(locator, description).toBeEnabled({ timeout });
  }

  async hasText(
    selector: string,
    text: string | RegExp | ReadonlyArray<string | RegExp>,
    description: string,
    timeout: number = ELEMENT_WAIT_TIME,
  ): Promise<void> {
    const locator = this.page.locator(selector).first();
    await expect(locator, description).toContainText(text, { timeout });
  }

  async haveTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async down(key: string): Promise<void> {
    await this.page.keyboard.down(key);
  }

  async up(key: string): Promise<void> {
    await this.page.keyboard.up(key);
  }

  async mouseDoubleClick(x: number, y: number): Promise<void> {
    await this.page.mouse.dblclick(x, y);
  }

  async dragDropSelector(selector: string, position: string): Promise<void> {
    await this.page.locator(selector).dragTo(this.page.locator(position), { timeout: ELEMENT_WAIT_TIME });
  }

  async hoverElement(selector: string): Promise<void> {
    await this.page.locator(selector).hover();
  }

  async dragAndDropWebcams(position: string): Promise<void> {
    await this.page.locator(e.webcamContainer).first().hover({ timeout: 5000 });
    await this.page.mouse.down();
    await this.page.locator(e.whiteboard).hover({ timeout: 5000 }); // action for dispatching isDragging event
    await this.page.locator(position).hover({ timeout: 5000 });
    await this.page.mouse.up();
  }

  async hasElementCount(selector: string, count: number, description: string): Promise<void> {
    const locator = await this.getVisibleLocator(selector);
    await expect(locator, description).toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
  }

  async hasHiddenElementCount(selector: string, count: number, description: string): Promise<void> {
    const locator = await this.page.locator(selector);
    await expect(locator, description).toHaveCount(count, { timeout: ELEMENT_WAIT_TIME });
  }

  async hasElementChecked(selector: string, description: string) {
    const locator = await this.page.locator(selector);
    await expect(locator, description).toBeChecked();
  }

  async hasElementNotChecked(selector: string, description: string) {
    const locator = await this.page.locator(selector);
    await expect(locator, description).not.toBeChecked();
  }

  async hasValue(selector: string, value: string, description: string): Promise<void> {
    const locator = await this.page.locator(selector);
    await expect(locator, description).toHaveValue(value);
  }

  async backgroundColorTest(selector: string, color: string): Promise<void> {
    await expect(await this.page.$eval(selector, (e) => getComputedStyle(e).backgroundColor)).toBe(color);
  }

  async textColorTest(selector: string, color: string): Promise<void> {
    await expect(await this.page.$eval(selector, (e) => getComputedStyle(e).color)).toBe(color);
  }

  async fontSizeCheck(selector: string, size: string): Promise<void> {
    await expect(await this.page.$eval(selector, (e) => getComputedStyle(e).fontSize)).toBe(size);
  }

  async comparingSelectorsBackgroundColor(selector1: string, selector2: string): Promise<void> {
    const getBackgroundColorComputed = (locator: Locator) =>
      locator.evaluate((elem) => getComputedStyle(elem).backgroundColor);
    const avatarInToastElementColor = this.page.locator(selector1);
    const avatarInUserListColor = this.page.locator(selector2);
    await expect(await getBackgroundColorComputed(avatarInToastElementColor)).toStrictEqual(
      await getBackgroundColorComputed(avatarInUserListColor),
    );
  }

  async reloadPage(): Promise<void> {
    await this.page.reload();
  }

  async selectSlide(slideOption: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    await this.page.locator(e.skipSlide).selectOption({ label: slideOption }, { timeout });
  }

  async closeAllToastNotifications(): Promise<void> {
    const toastNotificationElement = this.page.locator(e.toastContainer);
    const deadline = Date.now() + ELEMENT_WAIT_LONGER_TIME;
    while ((await toastNotificationElement.count()) > 0 && Date.now() < deadline) {
      try {
        await toastNotificationElement.first().click({ timeout: ELEMENT_WAIT_TIME });
        await expect(toastNotificationElement.first()).toBeHidden({ timeout: ELEMENT_WAIT_TIME });
      } catch {
        // ignore and retry until deadline
      }
    }
    await this.hasElementCount(e.toastContainer, 0, 'should not display any toast notification after closing all');
  }

  async getYoutubeFrame(): Promise<Frame> {
    await this.waitForSelector(e.youtubeFrame);
    const iframeElement = await this.page.locator(`${e.youtubeFrame} iframe`).elementHandle();
    const frame = await iframeElement?.contentFrame();
    if (!frame) throw new Error('Failed to get YouTube frame');
    await frame.waitForURL(/youtube/, { timeout: ELEMENT_WAIT_TIME });
    const ytFrame = new Frame(frame);
    return ytFrame;
  }
}

class Frame {
  public frame: PlaywrightFrame;

  constructor(frame: PlaywrightFrame) {
    this.frame = frame;
  }

  async hasElement(selector: string, description?: string, timeout: number = ELEMENT_WAIT_TIME): Promise<void> {
    const locator = this.frame.locator(selector);
    await expect(locator, description).toBeVisible({ timeout });
  }
}
