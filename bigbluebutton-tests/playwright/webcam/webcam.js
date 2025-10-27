const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { checkVideoUploadData, uploadBackgroundVideoImage, webcamContentCheck } = require('./util');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

class Webcam extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async share() {
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
    await this.hasElement('video', 'should display the element video');
    await this.hasElement(e.videoDropdownMenu, 'should display the video dropdown menu');
    await this.waitAndClick(e.leaveVideo);
    await this.hasElement(e.joinVideo, 'should display the join video button');
    await this.wasRemoved('video', 'should not display the video element');
  }

  async checksContent() {
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
    await this.waitForSelector(e.webcamVideoItem);
    await this.wasRemoved(e.webcamConnecting, 'should not display the webcam connecting element', ELEMENT_WAIT_LONGER_TIME);
    const respUser = await webcamContentCheck(this);
    await expect(respUser, 'should display the user webcam').toBeTruthy();
  }

  async talkingIndicator() {
    await this.webcamLayoutStart();
    await this.waitForSelector(e.currentUserLocalStreamVideo, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.isTalking);
    await this.hasElement(e.webcamItemTalkingUser, 'should display the webcam item talking user');
  }

  async mirrorWebcam() {
    await this.waitForSelector(e.whiteboard);
    await this.waitAndClick(e.joinVideo);
    await this.hasElement(e.webcamMirroredVideoPreview, 'should display the preview of the webcam video, starts mirrored for self');
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.hasElement(e.webcamMirroredVideoContainer, 'should display the webcam mirrored video container after the camera is shared');

    const mirroredWebcamLocator = await this.getLocator(e.webcamMirroredVideoContainer);
    await expect(mirroredWebcamLocator).toHaveScreenshot('webcam-mirrored-view.png');

    const dropdownWebcamButton = await this.getLocator(e.dropdownWebcamButton).filter({ hasText: this.username })

    await dropdownWebcamButton.click();
    await this.hasElement(e.mirrorWebcamBtn, 'should display the webcam mirror button');
    await this.hasText(e.mirrorWebcamBtn, 'Disable webcam mirroring', 'should display the text to disable webcam mirroring');

    await this.getVisibleLocator(e.mirrorWebcamBtn).click();
    await this.hasElement(e.webcamContainer, 'should display the video container after disabling webcam mirroring');

    const webcamLocator = await this.getLocator(e.webcamContainer);
    await expect(webcamLocator).toHaveScreenshot('webcam-view.png');

    await dropdownWebcamButton.click();
    await this.hasElement(e.mirrorWebcamBtn, 'should display the webcam mirror button');
    await this.hasText(e.mirrorWebcamBtn, 'Enable webcam mirroring', 'should display the text to enable webcam mirroring');

    await this.getVisibleLocator(e.mirrorWebcamBtn).click();
    await this.hasElement(e.webcamMirroredVideoContainer, 'should display the video container after enabling webcam mirroring');
  }

  async changeVideoQuality() {
    const { videoPreviewTimeout } = this.settings;

    const joinWebcamSettingQuality = async (value) => {
      await this.waitAndClick(e.joinVideo);
      await this.waitForSelector(e.videoQualitySelector);
      const langDropdown = await this.page.$(e.videoQualitySelector);
      await langDropdown.selectOption({ value });
      await this.waitForSelector(e.currentUserLocalStreamVideo, videoPreviewTimeout);
      await this.waitAndClick(e.startSharingWebcam);
      await this.waitForSelector(e.webcamConnecting);
      await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    }

    await joinWebcamSettingQuality('low');
    await this.waitAndClick(e.connectionStatusBtn);
    const lowValue = await checkVideoUploadData(this, 0);
    await this.waitAndClick(e.closeModal);
    await this.waitAndClick(e.leaveVideo);
    await joinWebcamSettingQuality('high');
    await this.waitAndClick(e.connectionStatusBtn);
    await checkVideoUploadData(this, lowValue);
  }

  async applyBackground() {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);
    await this.waitAndClick(`${e.selectDefaultBackground}[aria-label="Home"]`);
    await sleep(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);
    const webcamVideoLocator = await this.getLocator(e.currentUserLocalStreamVideo);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-home-background.png');
  }

  async webcamFullscreen() {
    await this.shareWebcam();
    // get default viewport sizes
    const { windowWidth, windowHeight } = await this.page.evaluate(() => {
      return {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }
    });
    await this.waitAndClick(e.dropdownWebcamButton);
    await this.waitAndClick(e.webcamsFullscreenButton);
    await sleep(1000);  // timeout to ensure the video is in fullscreen
    // get fullscreen webcam size
    const { width, height } = await this.getLocator('video').boundingBox();
    await expect(width + 1, 'should the width to be the same as window width').toBe(windowWidth);  // not sure why there is a difference of 1 pixel
    await expect(height, 'should the height to be the same as window height').toBe(windowHeight);
  }

  async disableSelfView() {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);

    await uploadBackgroundVideoImage(this);
    await this.waitAndClick(e.selectCustomBackground);
    await sleep(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);

    await this.waitAndClick(e.dropdownWebcamButton);
    await this.waitAndClick(e.selfViewDisableBtn);

    const webcamVideoLocator = await this.getLocator(e.webcamConnecting);
    await expect(webcamVideoLocator).toHaveScreenshot('disable-self-view.png');
  }

  async managingNewBackground() {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);

    // Upload
    await uploadBackgroundVideoImage(this);

    // Apply
    await this.waitAndClick(e.selectCustomBackground);
    await sleep(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);
    const webcamVideoLocator = await this.getLocator(e.currentUserLocalStreamVideo);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-new-background.png');

    // Remove
    await this.waitAndClick(e.videoDropdownMenu);
    await this.waitAndClick(e.advancedVideoSettingsBtn);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitAndClick(e.removeCustomBackground);
    await this.wasRemoved(e.selectCustomBackground, 'should not display the select custom background');
  }

  async keepBackgroundWhenRejoin(context) {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);
    await uploadBackgroundVideoImage(this);
    // Create a new page before closing the previous to not close the current context
    await context.newPage();
    await this.page.close();
    const openedPage = await this.getLastTargetPage(context);
    await openedPage.init(true, true, { meetingId: this.meetingId });
    await openedPage.waitAndClick(e.joinVideo);
    await openedPage.waitAndClick(e.backgroundSettingsTitle);
    await openedPage.hasElement(e.selectCustomBackground, 'should display the select custom background');
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
  }

  // TODO: improve this test to check when the sidebar is expanded or collapsed
  async dragAndDropWebcamInDifferentAreas() {
    await this.waitForSelector(e.whiteboard);
    await this.shareWebcam();
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after shared');

    await this.getLocator(e.currentUserLocalStreamVideo).hover({ timeout: 5000 });
    await this.page.mouse.down(); // click on the webcam container
    await this.hasElement(e.dropAreaRight, 'should display the docking element on the Right area after clicking to drag webcam element');
    await this.hasElement(e.dropAreaBottom, 'should display the docking element on the Bottom area after clicking to drag webcam element');
    await this.hasElement(e.dropAreaLeft, 'should display the docking element on the Left area after clicking to drag webcam element');
    await this.hasElement(e.dropAreaTop, 'should display the docking element on the Top area after clicking to drag webcam element');
    await this.hasElement(e.dropAreaSidebarBottom, 'should display the docking element on the Sidebar Bottom area after clicking to drag webcam element');
    await expect(this.page).toHaveScreenshot('drag-drop-areas.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
    await this.page.mouse.up(); // release the webcam container without dragging

    // (mod) click on the webcam container and drag to one of the four possible areas for droping the container
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaRight);
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after dragging and releasing, docking the element on the Right area');
    await expect(this.page).toHaveScreenshot('drag-drop-right.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
    
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaBottom);
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after dragging and releasing, docking the element on the Bottom area');
    await expect(this.page).toHaveScreenshot('drag-drop-bottom.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
    
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaLeft);
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after dragging and releasing, docking the element on the Left area');
    await expect(this.page).toHaveScreenshot('drag-drop-left.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
    
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaTop);
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after dragging and releasing, docking the element on the Top area');
    await expect(this.page).toHaveScreenshot('drag-drop-top.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
    
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaSidebarBottom);
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after dragging and releasing, docking the element on the Sidebar Bottom area');
    await expect(this.page).toHaveScreenshot('drag-drop-sidebar-bottom.png', { mask: [this.getLocator(e.currentUserLocalStreamVideo)] });
  }
}

exports.Webcam = Webcam;
