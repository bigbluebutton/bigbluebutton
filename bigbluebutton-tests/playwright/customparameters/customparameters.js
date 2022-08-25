const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const c = require('./constants');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const util = require('./util');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification } = require('../notifications/util');

class CustomParameters extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async showPublicChatOnLogin() {
    await this.modPage.waitForSelector(e.actions);
    await this.modPage.wasRemoved(e.publicChat);
  }

  async recordMeeting() {
    await this.modPage.hasElement(e.recordingIndicator);
  }

  async showParticipantsOnLogin() {
    await this.modPage.wasRemoved(e.userslist);
  }

  async clientTitle() {
    const pageTitle = await this.modPage.page.title();
    await expect(pageTitle).toContain(`${c.docTitle} - `);
  }

  async askForFeedbackOnLogout() {
    await this.modPage.logoutFromMeeting();
    await this.modPage.waitForSelector(e.meetingEndedModal);
    await this.modPage.hasElement(e.rating);
  }

  async displayBrandingArea() {
    await this.modPage.waitForSelector(e.userListContent);
    await this.modPage.hasElement(e.brandingAreaLogo);
  }

  async shortcuts() {
    // Check the initial shortcuts that can be used right after joining the meeting
    await util.checkShortcutsArray(this.modPage, c.initialShortcuts);
    // Join audio
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.joinMicrophone();
    // Open private chat
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.startPrivateChat);
    await this.modPage.waitForSelector(e.hidePrivateChat);
    // Check the later shortcuts that can be used after joining audio and opening private chat
    await util.checkShortcutsArray(this.modPage, c.laterShortcuts);
  }

  async customStyle() {
    await this.modPage.waitForSelector(e.chatButton);
    const resp = await this.modPage.page.evaluate((elem) => {
      return document.querySelectorAll(elem)[0].offsetHeight == 0;
    }, e.presentationTitle);
    await expect(resp).toBeTruthy();
  }

  async autoSwapLayout() {
    await this.modPage.waitForSelector(e.actions);
    const resp = await this.modPage.page.evaluate((elem) => {
      return document.querySelectorAll(elem)[0].offsetHeight !== 0;
    }, e.restorePresentation);
    await expect(resp).toBeTruthy();
  }

  async autoJoin() {
    await this.modPage.waitForSelector(e.chatMessages);
    await this.modPage.wasRemoved(e.audioModal);
  }

  async listenOnlyMode() {
    await this.modPage.waitForSelector(e.audioModal);
    await this.modPage.waitForSelector(e.connectingToEchoTest);
    await this.modPage.wasRemoved(e.connecting);
    await this.modPage.waitForSelector(e.echoYesButton);
    await this.modPage.waitAndClick(e.closeModal);
    await this.modPage.waitAndClick(e.joinAudio);
    const audioOptionsCount = await this.modPage.getSelectorCount(e.audioOptionsButtons);
    await expect(audioOptionsCount).toBe(1);
  }

  async forceListenOnly() {
    await this.userPage.wasRemoved(e.audioModal);
    await this.userPage.waitForSelector(e.toastContainer);
    await util.forceListenOnly(this.userPage);
  }

  async skipCheck() {
    await waitAndClearDefaultPresentationNotification(this.modPage);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.waitForSelector(e.connecting);
    await this.modPage.wasRemoved(e.connecting, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.echoYesButton);
    await this.modPage.hasElement(e.smallToastMsg);
    await this.modPage.hasElement(e.isTalking);
  }

  async skipCheckOnFirstJoin() {
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.hasElement(e.connecting);
    await this.modPage.leaveAudio();
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.hasElement(e.connectingToEchoTest);
  }

  async bannerText() {
    await this.modPage.waitForSelector(e.actions);
    await this.modPage.hasElement(e.notificationBannerBar);
  }

  async bannerColor(colorToRGB) {
    await this.modPage.waitForSelector(e.notificationBannerBar);
    const notificationLocator = this.modPage.getLocator(e.notificationBannerBar);
    const notificationBarColor = await notificationLocator.evaluate((elem) => {
      return getComputedStyle(elem).backgroundColor;
    }, e.notificationBannerBar);
    await expect(notificationBarColor).toBe(colorToRGB);
  }

  async disableScreensharing() {
    await this.modPage.wasRemoved(e.startScreenSharing);
  }

  async hidePresentation() {
    await this.modPage.waitForSelector(e.actions);
    const checkPresentationButton = await this.modPage.checkElement(e.restorePresentation);
    await expect(checkPresentationButton).toBeTruthy();
    await this.modPage.wasRemoved(e.presentationPlaceholder);
  }

  async forceRestorePresentationOnNewEvents(customParameter) {
    await this.initUserPage(true, this.context, { useModMeetingId: true, customParameter });
    const { presentationHidden, pollEnabled } = getSettings();
    if (!presentationHidden) await this.userPage.waitAndClick(e.minimizePresentation);
    const zoomInCase = await util.zoomIn(this.modPage);
    await expect(zoomInCase).toBeTruthy();
    const zoomOutCase = await util.zoomOut(this.modPage);
    await expect(zoomOutCase).toBeTruthy();
    if (pollEnabled) await util.poll(this.modPage, this.userPage);
    await util.nextSlide(this.modPage);
    await util.previousSlide(this.modPage);
    await util.annotation(this.modPage);
    await this.userPage.checkElement(e.restorePresentation);
  }

  async forceRestorePresentationOnNewPollResult(customParameter) {
    await this.initUserPage(true, this.context, { useModMeetingId: true, customParameter })
    const { presentationHidden,pollEnabled } = getSettings();
    if (!presentationHidden) await this.userPage.waitAndClick(e.minimizePresentation);
    if (pollEnabled) await util.poll(this.modPage, this.userPage);
    await this.userPage.waitForSelector(e.smallToastMsg);
    await this.userPage.checkElement(e.restorePresentation);
  }

  async enableVideo() {
    await this.modPage.wasRemoved(e.joinVideo);
  }

  async skipVideoPreview() {
    await this.modPage.shareWebcam(false);
  }

  async skipVideoPreviewOnFirstJoin() {
    await this.modPage.shareWebcam(false);
    await this.modPage.waitAndClick(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.modPage.waitForSelector(e.joinVideo);
    const { videoPreviewTimeout } = this.modPage.settings;
    await this.modPage.shareWebcam(true, videoPreviewTimeout);
  }

  async mirrorOwnWebcam() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.waitForSelector(e.webcamMirroredVideoPreview);
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.hasElement(e.webcamMirroredVideoContainer);
  }

  async multiUserPenOnly() {
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.waitAndClick(e.toolsButton);
    const resp = await this.userPage.page.evaluate((toolsElement) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.childElementCount === 1;
    }, e.toolsButton);
    await expect(resp).toBeTruthy();
  }

  async presenterTools() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.toolsButton);
    const resp = await this.modPage.page.evaluate(([toolsElement, toolbarListSelector]) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.querySelector(toolbarListSelector).childElementCount === 2;
    }, [e.toolsButton, e.toolbarToolsList]);
    await expect(resp).toBeTruthy();
  }

  async multiUserTools() {
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.waitAndClick(e.toolsButton);
    const resp = await this.userPage.page.evaluate(([toolsElement, toolbarListSelector]) => {
      return document.querySelectorAll(toolsElement)[0].parentElement.querySelector(toolbarListSelector).childElementCount === 2;
    }, [e.toolsButton, e.toolbarToolsList]);
    await expect(resp).toBeTruthy();
  }

  async autoShareWebcam() {
    await this.modPage.hasElement(e.webcamSettingsModal);
  }
}

exports.CustomParameters = CustomParameters;
