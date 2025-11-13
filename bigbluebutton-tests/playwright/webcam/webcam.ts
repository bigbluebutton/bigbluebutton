import { BrowserContext, expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { checkVideoUploadData, uploadBackgroundVideoImage, webcamContentCheck } from './util';

export class Webcam extends Page {
  async share() {
    const { skipVideoPreview, skipVideoPreviewOnFirstJoin, videoPreviewTimeout } = this.settings || {};

    await this.shareWebcam({
      shouldConfirmSharing: !(skipVideoPreview || skipVideoPreviewOnFirstJoin),
      videoPreviewTimeout,
    });
    await this.hasElement('video', 'should display the element video');
    await this.hasElement(e.videoDropdownMenu, 'should display the video dropdown menu');
    await this.waitAndClick(e.leaveVideo);
    await this.hasElement(e.joinVideo, 'should display the join video button');
    await this.wasRemoved('video', 'should not display the video element');
  }

  async checksContent() {
    const { skipVideoPreview, skipVideoPreviewOnFirstJoin, videoPreviewTimeout } = this.settings || {};

    await this.shareWebcam({
      shouldConfirmSharing: !(skipVideoPreview || skipVideoPreviewOnFirstJoin),
      videoPreviewTimeout,
    });
    await this.waitForSelector(e.webcamVideoItem);
    await this.wasRemoved(
      e.webcamConnecting,
      'should not display the webcam connecting element',
      ELEMENT_WAIT_LONGER_TIME,
    );
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
    await this.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the preview of the webcam video, starts mirrored for self',
    );
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.hasElement(
      e.webcamMirroredVideoContainer,
      'should display the webcam mirrored video container after the camera is shared',
    );

    const mirroredWebcamLocator = await this.page.locator(e.webcamMirroredVideoContainer);
    await expect(mirroredWebcamLocator).toHaveScreenshot('webcam-mirrored-view.png');

    const dropdownWebcamButton = await this.page.locator(e.dropdownWebcamButton).filter({ hasText: this.username });

    await dropdownWebcamButton.click();
    await this.hasElement(e.mirrorWebcamBtn, 'should display the webcam mirror button');
    await this.hasText(
      e.mirrorWebcamBtn,
      'Disable webcam mirroring',
      'should display the text to disable webcam mirroring',
    );

    await this.getVisibleLocator(e.mirrorWebcamBtn).click();
    await this.hasElement(e.webcamContainer, 'should display the video container after disabling webcam mirroring');

    const webcamLocator = await this.page.locator(e.webcamContainer);
    await expect(webcamLocator).toHaveScreenshot('webcam-view.png');

    await dropdownWebcamButton.click();
    await this.hasElement(e.mirrorWebcamBtn, 'should display the webcam mirror button');
    await this.hasText(
      e.mirrorWebcamBtn,
      'Enable webcam mirroring',
      'should display the text to enable webcam mirroring',
    );

    await this.getVisibleLocator(e.mirrorWebcamBtn).click();
    await this.hasElement(
      e.webcamMirroredVideoContainer,
      'should display the video container after enabling webcam mirroring',
    );
  }

  async changeVideoQuality() {
    const { videoPreviewTimeout } = this.settings || {};

    const joinWebcamSettingQuality = async (value: string) => {
      await this.waitAndClick(e.joinVideo);
      await this.waitForSelector(e.videoQualitySelector);
      const langDropdown = await this.page.$(e.videoQualitySelector);
      await langDropdown?.selectOption({ value });
      await this.waitForSelector(e.currentUserLocalStreamVideo, videoPreviewTimeout);
      await this.waitAndClick(e.startSharingWebcam);
      await this.waitForSelector(e.webcamConnecting);
      await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    };

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
    await this.page.waitForTimeout(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);
    const webcamVideoLocator = await this.page.locator(e.currentUserLocalStreamVideo);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-home-background.png');
  }

  async webcamFullscreen() {
    await this.shareWebcam();
    // get default viewport sizes
    const { windowWidth, windowHeight } = await this.page.evaluate(() => ({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    }));
    await this.waitAndClick(e.dropdownWebcamButton);
    await this.waitAndClick(e.webcamsFullscreenButton);
    await this.page.waitForTimeout(1000); // timeout to ensure the video is in fullscreen
    // get fullscreen webcam size
    const boundingBox = await this.page.locator('video').boundingBox();
    if (!boundingBox) throw new Error('video boundingBox is null');
    const { width, height } = boundingBox;
    await expect(width + 1, 'should the width to be the same as window width').toBe(windowWidth); // not sure why there is a difference of 1 pixel
    await expect(height, 'should the height to be the same as window height').toBe(windowHeight);
  }

  async disableSelfView() {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);

    await uploadBackgroundVideoImage(this);
    await this.waitAndClick(e.selectCustomBackground);
    await this.page.waitForTimeout(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);

    await this.waitAndClick(e.dropdownWebcamButton);
    await this.waitAndClick(e.selfViewDisableBtn);

    const webcamVideoLocator = await this.page.locator(e.webcamConnecting);
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
    await this.page.waitForTimeout(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.currentUserLocalStreamVideo);
    const webcamVideoLocator = await this.page.locator(e.currentUserLocalStreamVideo);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-new-background.png');

    // Remove
    await this.waitAndClick(e.videoDropdownMenu);
    await this.waitAndClick(e.advancedVideoSettingsBtn);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitAndClick(e.removeCustomBackground);
    await this.wasRemoved(e.selectCustomBackground, 'should not display the select custom background');
  }

  async keepBackgroundWhenRejoin(context: BrowserContext) {
    await this.waitAndClick(e.joinVideo);
    await this.waitAndClick(e.backgroundSettingsTitle);
    await this.waitForSelector(e.noneBackgroundButton);
    await uploadBackgroundVideoImage(this);
    // Create a new page before closing the previous to not close the current context
    await context.newPage();
    await this.page.close();
    const openedPage = await this.getLastTargetPage(context);
    await openedPage.init(true, { meetingId: this.meetingId });
    await openedPage.waitAndClick(e.joinVideo);
    await openedPage.waitAndClick(e.backgroundSettingsTitle);
    await openedPage.hasElement(e.selectCustomBackground, 'should display the select custom background');
  }

  async webcamLayoutStart() {
    const { skipVideoPreview, skipVideoPreviewOnFirstJoin, videoPreviewTimeout } = this.settings || {};

    await this.joinMicrophone();
    await this.shareWebcam({
      shouldConfirmSharing: !(skipVideoPreview || skipVideoPreviewOnFirstJoin),
      videoPreviewTimeout,
    });
  }

  async resizeWebcamArea() {
    await this.waitForSelector(e.whiteboard);
    await this.shareWebcam();
    await this.closeAllToastNotifications();
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after shared');

    const initialVideoBox = await this.page.locator(e.currentUserLocalStreamVideo).boundingBox();
    if (!initialVideoBox) throw new Error('currentUserLocalStreamVideo boundingBox is null');
    const { height: initialVideoHeight } = initialVideoBox;

    const initialVideoContainerBox = await this.page.locator(e.webcamMirroredVideoContainer).boundingBox();
    if (!initialVideoContainerBox) throw new Error('webcamMirroredVideoContainer boundingBox is null');
    const { height: initialVideoContainerHeight } = initialVideoContainerBox;

    await this.waitForSelector(e.resizeWebcamHandler);
    const handle = await this.page.locator(e.resizeWebcamHandler);
    await expect(handle).toHaveCount(1);

    const handleBox = await handle.boundingBox();
    if (!handleBox) throw new Error('resizeWebcamHandler boundingBox is null');
    const { x: hx, y: hy, width: hw, height: hh } = handleBox;
    // Start drag at handle center and move down by 200px
    await this.page.mouse.move(hx + hw / 2, hy + hh / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(hx + hw / 2, hy + hh / 2 + 200, { steps: 10 });
    await this.page.mouse.up();

    const resizedVideoBox = await this.page.locator(e.currentUserLocalStreamVideo).boundingBox();
    if (!resizedVideoBox) throw new Error('currentUserLocalStreamVideo boundingBox is null after resize');
    const { height: resizedVideoHeight } = resizedVideoBox;

    const resizedVideoContainerBox = await this.page.locator(e.webcamMirroredVideoContainer).boundingBox();
    if (!resizedVideoContainerBox) throw new Error('webcamMirroredVideoContainer boundingBox is null after resize');
    const { height: resizedVideoContainerHeight } = resizedVideoContainerBox;

    expect(resizedVideoHeight).toBeGreaterThan(initialVideoHeight);
    expect(resizedVideoContainerHeight).toBeGreaterThan(initialVideoContainerHeight);

    const webcamLocator = await this.page.locator(e.currentUserLocalStreamVideo);
    await expect(webcamLocator).toHaveScreenshot('resize-webcam.png');

    await this.waitAndClick(e.minimizePresentation);
    await this.waitForSelector(e.restorePresentation);

    const fullMainContentBox = await this.page.locator(e.currentUserLocalStreamVideo).boundingBox();
    if (!fullMainContentBox) throw new Error('currentUserLocalStreamVideo boundingBox is null after minimize');
    const { height: fullMainContentHeight } = fullMainContentBox;

    expect(fullMainContentHeight).toBeGreaterThan(resizedVideoHeight);

    await this.waitAndClick(e.restorePresentation);
    await this.waitForSelector(e.minimizePresentation);

    const restoredBox = await this.page.locator(e.currentUserLocalStreamVideo).boundingBox();
    if (!restoredBox) throw new Error('currentUserLocalStreamVideo boundingBox is null after restore');
    const { height: resizedHeightAfterRestore } = restoredBox;

    expect(Math.abs(resizedHeightAfterRestore - resizedVideoHeight)).toBeLessThanOrEqual(1);
  }

  // TODO: improve this test to check when the sidebar is expanded or collapsed
  async dragAndDropWebcamInDifferentAreas() {
    await this.waitForSelector(e.whiteboard);
    await this.shareWebcam();
    await this.hasElement(e.currentUserLocalStreamVideo, 'should display the webcam video after shared');

    await this.page.locator(e.currentUserLocalStreamVideo).hover({ timeout: 5000 });
    await this.page.mouse.down(); // click on the webcam container
    await this.hasElement(
      e.dropAreaRight,
      'should display the docking element on the Right area after clicking to drag webcam element',
    );
    await this.hasElement(
      e.dropAreaBottom,
      'should display the docking element on the Bottom area after clicking to drag webcam element',
    );
    await this.hasElement(
      e.dropAreaLeft,
      'should display the docking element on the Left area after clicking to drag webcam element',
    );
    await this.hasElement(
      e.dropAreaTop,
      'should display the docking element on the Top area after clicking to drag webcam element',
    );
    await this.hasElement(
      e.dropAreaSidebarBottom,
      'should display the docking element on the Sidebar Bottom area after clicking to drag webcam element',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-areas.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });
    await this.page.mouse.up(); // release the webcam container without dragging

    // (mod) click on the webcam container and drag to one of the four possible areas for dropping the container
    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaRight);
    await this.hasElement(
      e.currentUserLocalStreamVideo,
      'should display the webcam video after dragging and releasing, docking the element on the Right area',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-right.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });

    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaBottom);
    await this.hasElement(
      e.currentUserLocalStreamVideo,
      'should display the webcam video after dragging and releasing, docking the element on the Bottom area',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-bottom.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });

    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaLeft);
    await this.hasElement(
      e.currentUserLocalStreamVideo,
      'should display the webcam video after dragging and releasing, docking the element on the Left area',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-left.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });

    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaTop);
    await this.hasElement(
      e.currentUserLocalStreamVideo,
      'should display the webcam video after dragging and releasing, docking the element on the Top area',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-top.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });

    await this.dragDropSelector(e.currentUserLocalStreamVideo, e.dropAreaSidebarBottom);
    await this.hasElement(
      e.currentUserLocalStreamVideo,
      'should display the webcam video after dragging and releasing, docking the element on the Sidebar Bottom area',
    );
    await expect(this.page).toHaveScreenshot('drag-drop-sidebar-bottom.png', {
      mask: [this.page.locator(e.currentUserLocalStreamVideo)],
    });
  }
}
