const { expect, default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const Page = require('../core/page');
const e = require('../core/elements');
const { checkSvgIndex, getSlideOuterHtml, uploadSinglePresentation, uploadMultiplePresentations, getCurrentPresentationHeight } = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME, UPLOAD_PDF_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');
const { getSettings } = require('../core/settings');
const { waitAndClearDefaultPresentationNotification, waitAndClearNotification } = require('../notifications/util');

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
    test.fail(!externalVideoPlayer, 'External video is disabled');

    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.waitForSelector(e.closeModal);
    await this.modPage.type(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.getFrame(this.modPage, e.youtubeFrame);
    const userFrame = await this.getFrame(this.userPage, e.youtubeFrame);

    await modFrame.hasElement('video');
    await userFrame.hasElement('video');
  }

  async uploadSinglePresentationTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await uploadSinglePresentation(this.modPage, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);

    // wait until the notifications disappear
    await this.modPage.wasRemoved(e.presentationStatusInfo, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.smallToastMsg, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.presentationStatusInfo);
    await this.userPage.wasRemoved(e.smallToastMsg);
    
    const modWhiteboardLocator = this.modPage.getLocator(e.whiteboard);
    await expect(modWhiteboardLocator).toHaveScreenshot('moderator-new-presentation-screenshot.png', {
      maxDiffPixels: 1000,
    });
    
    const userWhiteboardLocator = this.userPage.getLocator(e.whiteboard);
    await expect(userWhiteboardLocator).toHaveScreenshot('viewer-new-presentation-screenshot.png', {
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
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);
    const width1 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    await this.modPage.waitAndClick(e.fitToWidthButton);
    const width2 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    await expect(Number(width2) > Number(width1)).toBeTruthy();
  }

  async downloadPresentation(testInfo) {
    const { presentationDownloadable } = getSettings();
    test.fail(!presentationDownloadable, 'Presentation download is disable');

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.exportPresentationToPublicChat);
    await this.userPage.hasElement(e.smallToastMsg);
    await this.userPage.hasElement(e.toastDownload);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
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
    await waitAndClearDefaultPresentationNotification(this.modPage);
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

  async getFrame(page, frameSelector) {
    await page.waitForSelector(frameSelector);
    await sleep(1000);
    const handleFrame = await page.page.frame({ url: /youtube/ });
    const frame = new Page(page.browser, handleFrame);
    await frame.waitForSelector(e.ytFrameTitle);
    return frame;
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
    await waitAndClearNotification(this.modPage);
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
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    const zoomOutButtonLocator = this.modPage.getLocator(e.zoomOutButton);
    await expect(zoomOutButtonLocator).toBeDisabled();
    const resetZoomButtonLocator = this.modPage.getLocator(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(defaultZoomLevel);

    //Zoom In 150%
    await this.modPage.waitAndClick(e.zoomInButton);
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator).toBeEnabled();
    await expect(resetZoomButtonLocator).toContainText(/150%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom150.png', screenshotOptions);

    //Zoom out 125%
    await this.modPage.waitAndClick(e.zoomOutButton);
    await expect(resetZoomButtonLocator).toContainText(/125%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom125.png', screenshotOptions);

    //Reset Zoom 100%
    await this.modPage.waitAndClick(e.resetZoomButton);
    await expect(resetZoomButtonLocator).toContainText(/100%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom100.png', screenshotOptions);
  }

  async selectSlide() {
    await this.modPage.waitForSelector(e.skipSlide);

    const wbBox = await this.modPage.getLocator(e.whiteboard);
    const screenshotOptions = {
      maxDiffPixelRatio: 0.05,
    };

    await this.modPage.selectSlide('Slide 10');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide10.png', screenshotOptions);

    await this.modPage.selectSlide('Slide 5');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide5.png', screenshotOptions);

    await this.modPage.selectSlide('Slide 13');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide13.png', screenshotOptions);
  }
}

exports.Presentation = Presentation;
