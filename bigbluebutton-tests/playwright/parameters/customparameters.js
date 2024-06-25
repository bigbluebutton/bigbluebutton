const { expect, default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const c = require('./constants');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const util = require('./util');
const { getSettings } = require('../core/settings');

class CustomParameters extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async showPublicChatOnLogin() {
    await this.modPage.hasElement(e.actions, 'should display the actions button');
    await this.modPage.wasRemoved(e.hidePublicChat, 'should display the hide public chat element when the public chat is open');
  }

  async recordMeeting() {
    await this.modPage.hasElement(e.recordingIndicator, 'should display the recording indicator');
  }

  async showParticipantsOnLogin() {
    await this.modPage.wasRemoved(e.usersList, 'should not display the users list');
  }

  async clientTitle() {
    const pageTitle = await this.modPage.page.title();
    expect(pageTitle, 'should display the changed name of the client title').toContain(`${c.docTitle} - `);
  }

  async askForFeedbackOnLogout() {
    await this.modPage.logoutFromMeeting();
    await this.modPage.hasElement(e.meetingEndedModal, 'should display the meeting ended modal, when the user leaves the meeting');
    await this.modPage.hasElement(e.rating, 'should display the question for feedback after the user leaves');
  }

  async displayBrandingArea() {
    await this.modPage.hasElement(e.userListContent, 'should display the user list on the meeting');
    await this.modPage.hasElement(e.brandingAreaLogo, 'should display the logo on the branding area');
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
    await this.modPage.hasElement(e.hidePrivateChat, 'should display the hide private chat element when the user has the private chat open');
    // Check the later shortcuts that can be used after joining audio and opening private chat
    await util.checkShortcutsArray(this.modPage, c.laterShortcuts);
  }

  async customStyle() {
    await this.modPage.hasElement(e.chatButton, 'should display the chat button');
    const resp = await this.modPage.page.evaluate((elem) => {
      return document.querySelectorAll(elem)[0].offsetHeight == 0;
    }, e.presentationTitle);
    expect(resp, 'should display the different style on the meeting').toBeTruthy();
  }

  async autoSwapLayout() {
    await this.modPage.hasElement(e.actions, 'should display the actions button');
    await this.modPage.waitAndClick(e.minimizePresentation);
    const resp = await this.modPage.page.evaluate((elem) => {
      return document.querySelectorAll(elem)[0].offsetHeight !== 0;
    }, e.restorePresentation);
    expect(resp, 'should display the auto swap layout').toBeTruthy();
  }

  async autoJoin() {
    await this.modPage.hasElement(e.chatMessages, 'should display the chat messages', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.audioModal, 'should not display the audio modal');
  }

  async listenOnlyMode() {
    await this.modPage.hasElement(e.audioSettingsModal, 'should display the audio settings modal when joining', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.waitAndClick(e.joinEchoTestButton);
    await this.modPage.hasElement(e.establishingAudioLabel, 'should display the audio being established');
    await this.modPage.hasElement(e.isTalking, 'should display the is talking indicator, after the audio being established');
    await this.modPage.leaveAudio();
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.hasElement(e.audioSettingsModal, 'should display the audio settings modal after clicked on the join audio button');
  }

  async forceListenOnly() {
    await this.userPage.wasRemoved(e.audioModal, 'should not display the audio modal, should join without microphone');
    await this.userPage.hasElement(e.toastContainer, 'should display the toast container for the attendee', ELEMENT_WAIT_LONGER_TIME);
    await util.forceListenOnly(this.userPage);
  }

  async skipCheck() {
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.hasElement(e.establishingAudioLabel, 'should establish audio');
    await this.modPage.wasRemoved(e.establishingAudioLabel, 'should not display the audio being established label', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.isTalking);
  }

  async skipCheckOnFirstJoin() {
    await this.modPage.waitAndClick(e.microphoneButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.establishingAudioLabel, 'should establish audio');
    await this.modPage.hasElement(e.smallToastMsg, 'should display the small toast message');
    await this.modPage.hasElement(e.isTalking, 'should display the is talking element');
    await this.modPage.leaveAudio();
    await this.modPage.waitAndClick(e.joinAudio);
    await this.modPage.waitAndClick(e.microphoneButton);
    await this.modPage.hasElement(e.audioSettingsModal, 'should display the audio settings modal');
  }

  async bannerText() {
    await this.modPage.hasElemnt(e.actions, 'should display the actions button');
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the notification banner bar with a text');
  }

  async bannerColor(colorToRGB) {
    await this.modPage.hasElement(e.notificationBannerBar, 'should display the notifications banner bar');
    const notificationLocator = this.modPage.getLocator(e.notificationBannerBar);
    const notificationBarColor = await notificationLocator.evaluate((elem) => {
      return getComputedStyle(elem).backgroundColor;
    }, e.notificationBannerBar);
    expect(notificationBarColor, 'should display the banner bar with the choosen color').toBe(colorToRGB);
  }

  async hidePresentationOnJoin() {
    await this.modPage.hasElement(e.actions, 'should display the actions button');
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation button for the moderator');
    await this.userPage.hasElement(e.restorePresentation, 'should display the restore presentation button for the attendee');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
  }

  async forceRestorePresentationOnNewEvents(joinParameter) {
    await this.initUserPage(true, this.context, { useModMeetingId: true, joinParameter });
    const { presentationHidden, pollEnabled } = getSettings();
    if (!presentationHidden) await this.userPage.waitAndClick(e.minimizePresentation);
    const zoomInCase = await util.zoomIn(this.modPage);
    expect(zoomInCase, 'should the presentation be zoomed').toBeTruthy();
    const zoomOutCase = await util.zoomOut(this.modPage);
    expect(zoomOutCase, 'should the presentation be unzoomed').toBeTruthy();
    if (pollEnabled) await util.poll(this.modPage, this.userPage);
    await util.nextSlide(this.modPage);
    await util.previousSlide(this.modPage);
    await util.annotation(this.modPage);
    await this.userPage.checkElement(e.restorePresentation);
  }

  async forceRestorePresentationOnNewPollResult(joinParameter) {
    await this.initUserPage(true, this.context, { useModMeetingId: true, joinParameter })
    const { presentationHidden,pollEnabled } = getSettings();
    if (!presentationHidden) await this.userPage.waitAndClick(e.minimizePresentation);
    if (pollEnabled) await util.poll(this.modPage, this.userPage);
    await this.userPage.hasElement(e.smallToastMsg, 'should display the small toast message');
    await this.userPage.checkElement(e.restorePresentation);
  }

  async enableVideo() {
    await this.modPage.wasRemoved(e.joinVideo, 'should not display the join video');
  }

  async skipVideoPreview() {
    await this.modPage.shareWebcam(false);
  }

  async skipVideoPreviewOnFirstJoin() {
    await this.modPage.shareWebcam(false);
    await this.modPage.waitAndClick(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
    const { videoPreviewTimeout } = this.modPage.settings;
    await this.modPage.shareWebcam(true, videoPreviewTimeout);
  }

  async mirrorOwnWebcam() {
    await this.modPage.waitAndClick(e.joinVideo);
    await this.modPage.hasElement(e.webcamMirroredVideoPreview, 'should display the preview of the webcam video being mirroed');
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.hasElement(e.webcamMirroredVideoContainer, 'should display the webcam mirroed video container after the camera is shared');
  }

  async multiUserPenOnly() {
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.hasElement(e.wbToolbar);
    const toolsCount = await this.userPage.getSelectorCount(`${e.wbToolbar} button:visible`);
    await expect(toolsCount, 'should display only 1 tool (pen)').toBe(1);
  }

  async presenterTools() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.wbToolbar);
    const toolsCount = await this.modPage.getSelectorCount(`${e.wbToolbar} button:visible`);
    await expect(toolsCount, 'should display only the 3 elements passed in the parameter (select, draw and arrow)').toBe(3);
  }

  async multiUserTools() {
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.userPage.hasElement(e.wbToolbar);
    const toolsCount = await this.userPage.getSelectorCount(`${e.wbToolbar} button:visible`);
    await expect(toolsCount, 'should display only the 2 elements passed in the parameter (arrow and text)').toBe(2);
  }

  async autoShareWebcam() {
    await this.modPage.hasElement(e.webcamSettingsModal, 'should display the webcam settings modal when auto sharing the webcam ');
  }

  async hideActionsBarTest() {
    await this.modPage.wasRemoved(e.actions, 'should not display the actions button');
    await this.modPage.wasRemoved(e.joinAudio, 'should not display the join audio button');
    await this.modPage.wasRemoved(e.joinVideo, 'should not display the join video button');
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screensharing');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button');
    await this.modPage.wasRemoved(e.reactionsButton, 'should not display the reactions button');
  }

  async overrideDefaultLocaleTest() {
    await this.modPage.hasText(e.chatButton, 'Bate-papo público','should display the new overrided default locale');
  }

  async hideNavBarTest() {
    await this.modPage.wasRemoved(e.navbarBackground, 'should not display the navbar');
  }

  async preferredCameraProfileTest() {
    await this.modPage.waitAndClick(e.joinVideo);
    expect(await this.modPage.getLocator(e.selectCameraQualityId).inputValue(), 'should display the selector to choose the camera quality').toBe('low');
    await this.modPage.waitAndClick(e.startSharingWebcam);
  }
}

exports.CustomParameters = CustomParameters;
