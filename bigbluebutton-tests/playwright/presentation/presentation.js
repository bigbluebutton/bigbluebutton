const { expect, default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const Page = require('../core/page');
const e = require('../core/elements');
const { checkSvgIndex, getSlideOuterHtml, uploadSinglePresentation, uploadMultiplePresentations, getCurrentPresentationHeight } = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME, UPLOAD_PDF_WAIT_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');
const { getSettings } = require('../core/settings');
const { waitAndClearNotification } = require('../notifications/util.js');

const defaultZoomLevel = '100%';

class Presentation extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async skipSlide() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await checkSvgIndex(this.modPage, '/svg/1');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.waitForSelector(e.whiteboard);
    await sleep(1000);

    await checkSvgIndex(this.modPage, '/svg/2');

    await this.modPage.waitAndClick(e.prevSlide);
    await this.modPage.waitForSelector(e.whiteboard);
    await sleep(1000);

    await checkSvgIndex(this.modPage, '/svg/1');
  }

  async shareCameraAsContent() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.waitForSelector(e.videoPreview);
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.hasElement(e.screenshareConnecting);

    await this.modPage.wasRemoved(e.screenshareConnecting);
    await this.modPage.hasElement(e.screenShareVideo);
    // close all notifications displayed before comparing screenshots
    for (const closeButton of await this.modPage.getLocator(e.closeToastBtn).all()) {
      await closeButton.click();
    }
    const modWhiteboardLocator = this.modPage.getLocator(e.screenShareVideo);
    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-share-camera-as-content.png', {
      maxDiffPixels: 1000,
    });

    await this.userPage.wasRemoved(e.screenshareConnecting);
    await this.userPage.hasElement(e.screenShareVideo);
    // close all notifications displayed before comparing screenshots
    for (const closeButton of await this.userPage.getLocator(e.closeToastBtn).all()) {
      await closeButton.click();
    }
    const viewerWhiteboardLocator = this.userPage.getLocator(e.screenShareVideo);
    await expect(viewerWhiteboardLocator).toHaveScreenshot('viewer-share-camera-as-content.png', {
      maxDiffPixels: 1000,
    });
  }

  async hideAndRestorePresentation() {
    const { presentationHidden } = getSettings();
    if (!presentationHidden) {
      await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitAndClick(e.minimizePresentation);
    }
    await this.modPage.wasRemoved(e.presentationContainer);

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.hasElement(e.presentationContainer);
  }

  async startExternalVideo() {
    const { externalVideoPlayer } = getSettings();

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    if(!externalVideoPlayer) {
      await this.modPage.hasElement(e.managePresentations);
      return this.modPage.wasRemoved(e.shareExternalVideoBtn);
    }
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.waitForSelector(e.closeModal);
    await this.modPage.type(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.modPage.getYoutubeFrame();
    const userFrame = await this.userPage.getYoutubeFrame();

    await modFrame.hasElement('video');
    await userFrame.hasElement('video');
  }

  async uploadSinglePresentationTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await uploadSinglePresentation(this.modPage, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);

    // wait until the notifications disappear
    await this.modPage.waitAndClick(e.smallToastMsg);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.presentationStatusInfo);
    await this.userPage.wasRemoved(e.smallToastMsg);
    
    await this.modPage.reloadPage();
    await this.modPage.closeAudioModal();
    await this.modPage.closeAllToastNotifications();
    const modWhiteboardLocator = this.modPage.getLocator(e.whiteboard);
    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-new-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
    
    await this.userPage.reloadPage();
    await this.userPage.closeAudioModal();
    await this.userPage.closeAllToastNotifications();
    const userWhiteboardLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWhiteboardLocator).toHaveScreenshot('viewer-new-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
  }

  async uploadOtherPresentationsFormat() {
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.waitAndClick(e.smallToastMsg);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.presentationStatusInfo);
    await this.userPage.wasRemoved(e.smallToastMsg);

    const modWhiteboardLocator = this.modPage.getLocator(e.whiteboard);
    const userWhiteboardLocator = this.userPage.getLocator(e.whiteboard);

    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-png-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
    await expect(userWhiteboardLocator).toHaveScreenshot('viewer-png-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });

    await uploadSinglePresentation(this.modPage, e.presentationPPTX, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.waitAndClick(e.smallToastMsg);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.presentationStatusInfo);
    await this.userPage.wasRemoved(e.smallToastMsg);

    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-pptx-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
    await expect(userWhiteboardLocator).toHaveScreenshot('viewer-pptx-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });

    await uploadSinglePresentation(this.modPage, e.presentationTXT, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.waitAndClick(e.smallToastMsg);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.presentationStatusInfo);
    await this.userPage.wasRemoved(e.smallToastMsg);

    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-txt-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
    await expect(userWhiteboardLocator).toHaveScreenshot('viewer-txt-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
  }

  async uploadMultiplePresentationsTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const modSlides0 = await getSlideOuterHtml(this.modPage);
    const userSlides0 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides0).toEqual(userSlides0);

    await uploadMultiplePresentations(this.modPage, [e.uploadPresentationFileName, e.questionSlideFileName]);

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1).toEqual(userSlides1);
    await expect(modSlides0).not.toEqual(modSlides1);
    await expect(userSlides0).not.toEqual(userSlides1);
  }

  async fitToWidthTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.userListToggleBtn);
    const width1 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    // check if its off
    const fitToWidthButtonLocator = this.modPage.getLocator(`${e.fitToWidthButton} > span>>nth=0`);
    const fitToWidthBorderColorOff = await fitToWidthButtonLocator.evaluate((elem) => getComputedStyle(elem).borderColor);
    await expect(fitToWidthBorderColorOff).toBe('rgba(0, 0, 0, 0)');

    await this.modPage.waitAndClick(e.fitToWidthButton);
    await sleep(500);

    //check if its on
    const fitToWidthBorderColorOn = await fitToWidthButtonLocator.evaluate((elem) => getComputedStyle(elem).borderColor);
    await expect(fitToWidthBorderColorOn).toBe('rgb(6, 23, 42)');

    const width2 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    await expect(Number(width2)).toBeGreaterThan(Number(width1));
  }

  async enableAndDisablePresentationDownload(testInfo) {
    const { originalPresentationDownloadable } = getSettings();

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    // enable original presentation download
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    if(!originalPresentationDownloadable) {
      await this.modPage.hasElement(e.presentationOptionsDownloadBtn);
      return this.modPage.wasRemoved(e.enableOriginalPresentationDownloadBtn);
    }
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.enableOriginalPresentationDownloadBtn);
    await this.userPage.hasElement(e.smallToastMsg);
    await this.userPage.hasElement(e.presentationDownloadBtn);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.userPage.hasElement(e.presentationDownloadBtn);
    /**
     * the following steps throwing "Error: ENOENT: no such file or directory" at the end of execution
     * due to somehow it's trying to take the screenshot of the tab that opened for the file download
     */
    //! await this.modPage.handleDownload(this.modPage.getLocator(e.presentationDownloadBtn), testInfo);
    //! await this.userPage.handleDownload(this.userPage.getLocator(e.presentationDownloadBtn), testInfo);
    // disable original presentation download
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.disableOriginalPresentationDownloadBtn);
    await this.modPage.hasElement(e.whiteboard);
    await this.modPage.wasRemoved(e.presentationDownloadBtn);
    await this.userPage.wasRemoved(e.presentationDownloadBtn);
  }

  async sendPresentationToDownload(testInfo, browserName) {
    const { presentationWithAnnotationsDownloadable } = getSettings();

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    if(!presentationWithAnnotationsDownloadable) {
      await this.modPage.hasElement(e.presentationOptionsDownloadBtn);
      return this.modPage.wasRemoved(e.sendPresentationInCurrentStateBtn);
    }
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.hasElement(e.downloadPresentationToast);
    await this.modPage.hasText(e.chatMessages, /Download/, 20000);
    await this.userPage.hasElement(e.downloadPresentation, ELEMENT_WAIT_EXTRA_LONG_TIME);
    const downloadPresentationLocator = this.userPage.getLocator(e.downloadPresentation);
    await this.userPage.handleDownload(downloadPresentationLocator, testInfo);
  }

  async removeAllPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    await this.modPage.wasRemoved(e.whiteboard);
    await this.modPage.wasRemoved(e.minimizePresentation);
    await this.userPage.wasRemoved(e.whiteboard);
    await this.userPage.wasRemoved(e.minimizePresentation);
  }

  async uploadAndRemoveAllPresentations() {
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1).toEqual(userSlides1);

    // Remove
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    await this.modPage.wasRemoved(e.whiteboard);
    await this.modPage.wasRemoved(e.minimizePresentation);
    await this.userPage.wasRemoved(e.whiteboard);
    await this.userPage.wasRemoved(e.minimizePresentation);

    // Check removed presentations inside the Manage Presentations
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.wasRemoved(e.presentationsList);
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    // Making viewer a presenter
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.wasRemoved(e.presentationsList);
  }

  async removePreviousPresentationFromPreviousPresenter() {
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1).toEqual(userSlides1);

    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.waitAndClick(e.removePresentation);
    await this.userPage.waitAndClick(e.removePresentation);
    await this.userPage.waitAndClick(e.confirmManagePresentation);

    await this.userPage.wasRemoved(e.whiteboard);
    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.wasRemoved(e.presentationsList);
  }

  async presentationFullscreen() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    const presentationLocator = this.modPage.getLocator(e.presentationContainer);
    const height = parseInt(await getCurrentPresentationHeight(presentationLocator));

    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.waitAndClick(e.presentationFullscreen);

    // Gets fullscreen mode height
    const heightFullscreen = parseInt(await getCurrentPresentationHeight(presentationLocator));

    await expect(heightFullscreen).toBeGreaterThan(height);
  }

  async presentationSnapshot(testInfo) {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    const presentationSnapshotLocator = this.modPage.getLocator(e.presentationSnapshot);
    await this.modPage.handleDownload(presentationSnapshotLocator, testInfo);
  }

  async hidePresentationToolbar() {
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.waitAndClick(e.toolVisibility);
    await this.modPage.wasRemoved(e.wbToolbar);
    await this.modPage.wasRemoved(e.wbStyles);
    await this.modPage.wasRemoved(e.wbUndo);
    await this.modPage.wasRemoved(e.wbRedo);
  }

  async zoom() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getLocator(e.whiteboard);

    const zoomOutButtonLocator = this.modPage.getLocator(e.zoomOutButton);
    await expect(zoomOutButtonLocator).toBeDisabled();
    const resetZoomButtonLocator = this.modPage.getLocator(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(defaultZoomLevel);

    //Zoom In 150%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator).toBeEnabled();
    await expect(resetZoomButtonLocator).toContainText(/125%/);
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator).toContainText(/150%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom150.png');

    //Zoom out 125%
    await this.modPage.waitAndClick(e.zoomOutButton);
    await expect(resetZoomButtonLocator).toContainText(/125%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom125.png');

    //Reset Zoom 100%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator).toContainText(/150%/);
    await this.modPage.waitAndClick(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(/100%/);
    await expect(zoomOutButtonLocator).toBeDisabled();
    await expect(wbBox).toHaveScreenshot('moderator1-zoom100.png');
  }

  async selectSlide() {
    await this.modPage.waitForSelector(e.skipSlide);

    const wbBox = await this.modPage.getLocator(e.whiteboard);

    await this.modPage.selectSlide('Slide 10');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide10.png');

    await this.modPage.selectSlide('Slide 5');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide5.png');

    await this.modPage.selectSlide('Slide 13');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide13.png');
  }
}

exports.Presentation = Presentation;
