const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { checkSvgIndex, getSlideOuterHtml, uploadSinglePresentation, uploadMultiplePresentations, getCurrentPresentationHeight, hasCurrentPresentationToastElement } = require('./util.js');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME, UPLOAD_PDF_WAIT_TIME, CI } = require('../core/constants');
const { sleep } = require('../core/helpers');
const { getSettings } = require('../core/settings');
const { checkNotificationText } = require('../notifications/util.js');

const defaultZoomLevel = '100%';

class Presentation extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async skipSlide() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard when the moderator joins the meeting', ELEMENT_WAIT_LONGER_TIME);

    await checkSvgIndex(this.modPage, '/svg/1');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.hasElement(e.whiteboard, 'should display the next slide on the whiteboard');
    await sleep(1000);

    await checkSvgIndex(this.modPage, '/svg/2');

    await this.modPage.waitAndClick(e.prevSlide);
    await this.modPage.hasElement(e.whiteboard, 'should display the previous slide on the whiteboard');
    await sleep(1000);

    await checkSvgIndex(this.modPage, '/svg/1');
  }

  async shareCameraAsContent() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard whent then moderator joins the meeting', ELEMENT_WAIT_LONGER_TIME);

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.hasElement(e.webcamMirroredVideoPreview, 'should display the camera preview when sharing camera as content');
    await this.modPage.waitAndClick(e.startSharingWebcam);
    await this.modPage.hasElement(e.screenShareVideo);
    await this.modPage.closeAllToastNotifications();
    const modWhiteboardLocator = this.modPage.getLocator(e.screenShareVideo);
    await expect(modWhiteboardLocator, 'should display the same screenshot as taken before').toHaveScreenshot('moderator-share-camera-as-content.png', {
      maxDiffPixels: 1000,
    });

    await this.userPage.wasRemoved(e.screenshareConnecting);
    await this.userPage.hasElement(e.screenShareVideo);
    await this.modPage.closeAllToastNotifications();
    const viewerWhiteboardLocator = this.userPage.getLocator(e.screenShareVideo);
    await expect(viewerWhiteboardLocator).toHaveScreenshot('viewer-share-camera-as-content.png', {
      maxDiffPixels: 1000,
    });
  }

  async hideAndRestorePresentation() {
    const { presentationHidden } = getSettings();
    if (!presentationHidden) {
      await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard when the moderator joins the meeting', ELEMENT_WAIT_LONGER_TIME);
      await this.modPage.waitAndClick(e.minimizePresentation);
    }
    await this.modPage.wasRemoved(e.presentationContainer, 'should not display the presentation container since the presentation is minimized');

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.hasElement(e.presentationContainer, 'should display the presentation container since the presentation was restored');
  }

  async startExternalVideo() {
    const { externalVideoPlayer } = getSettings();

    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard when the moderator joins the meeting');
    await this.modPage.waitAndClick(e.actions);
    if(!externalVideoPlayer) {
      await this.modPage.hasElement(e.managePresentations, 'should display the manage presentation options on the actions button');
      return this.modPage.wasRemoved(e.shareExternalVideoBtn, 'should not display the option to share an external video, since is deactivated');
    }
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.hasElement(e.closeModal, 'should display the close modal button after the moderator opens the modal for sharing external video');
    await this.modPage.type(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.modPage.getYoutubeFrame();
    const userFrame = await this.userPage.getYoutubeFrame();

    await modFrame.hasElement('video', 'should display the element frame for the video that is being shared for the moderator');
    await userFrame.hasElement('video', 'should display the element frame for the video that is being shared for the attendee');
  }

  async uploadSinglePresentationTest() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.smallToastMsg);

    const imageURLFirstPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await uploadSinglePresentation(this.modPage, e.pdfFileName, UPLOAD_PDF_WAIT_TIME);

    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    // also because the slide location is different and inconsistent (it initially shakes to stabilize and then set incorrect location)
    if (!CI) {
      const modWhiteboardLocator = this.modPage.getLocator(e.whiteboard);
      await expect(modWhiteboardLocator).toHaveScreenshot('moderator-new-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }
    const imageURLSecondPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await this.userPage.reloadPage();
    await this.userPage.closeAudioModal();
    await this.userPage.closeAllToastNotifications();
    const userWhiteboardLocator = this.userPage.getLocator(e.whiteboard);

    await expect(imageURLFirstPresentation).not.toBe(imageURLSecondPresentation);

    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    // also because the slide location is different and inconsistent (it initially shakes to stabilize and then set incorrect location)
    if (!CI) {
      await expect(userWhiteboardLocator).toHaveScreenshot('viewer-new-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }
  }

  async uploadOtherPresentationsFormat() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.smallToastMsg);

    const imageURLFirstPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    const modWhiteboardLocator = this.modPage.getLocator(e.whiteboard);
    const userWhiteboardLocator = this.userPage.getLocator(e.whiteboard);


    const imageURLSecondPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await expect(imageURLFirstPresentation).not.toBe(imageURLSecondPresentation);

    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    if (!CI) {
      await expect(modWhiteboardLocator).toHaveScreenshot('moderator-png-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
      await expect(userWhiteboardLocator).toHaveScreenshot('viewer-png-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }

    await uploadSinglePresentation(this.modPage, e.presentationPPTX, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();
    const imageURLThirdPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await expect(imageURLSecondPresentation).not.toBe(imageURLThirdPresentation);


    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    if (!CI) {
      await expect(modWhiteboardLocator).toHaveScreenshot('moderator-pptx-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
      await expect(userWhiteboardLocator).toHaveScreenshot('viewer-pptx-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }

    await uploadSinglePresentation(this.modPage, e.presentationTXT, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    const imageURLForthPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element.getAttribute('style')
      const urlMatch = style.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await expect(imageURLThirdPresentation).not.toBe(imageURLForthPresentation);


    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    if (!CI) {
      await expect(modWhiteboardLocator).toHaveScreenshot('moderator-txt-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
      await expect(userWhiteboardLocator).toHaveScreenshot('viewer-txt-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }
  }

  async uploadMultiplePresentationsTest() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.smallToastMsg);

    const modSlides0 = await getSlideOuterHtml(this.modPage);
    const userSlides0 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides0).toEqual(userSlides0);

    await uploadMultiplePresentations(this.modPage, [e.questionSlideFileName, e.uploadPresentationFileName]);

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1, 'moderator slide 1 should be equal to the user slide 1').toEqual(userSlides1);
    await expect(modSlides0, 'moderator slide 0 should not be equal to moderator slide 1').not.toEqual(modSlides1);
    await expect(userSlides0, 'user slide 0 should not be equal to the user slide 1').not.toEqual(userSlides1);
  }

  async fitToWidthTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.userListToggleBtn);
    const width1 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    // check if its off
    const fitToWidthButtonLocator = this.modPage.getLocator(`${e.fitToWidthButton} > span>>nth=0`);
    const fitToWidthBorderColorOff = await fitToWidthButtonLocator.evaluate((elem) => getComputedStyle(elem).borderColor);
    await expect(fitToWidthBorderColorOff, 'should match the white color').toBe('rgba(0, 0, 0, 0)');

    await this.modPage.waitAndClick(e.fitToWidthButton);
    await sleep(500);

    //check if its on
    const fitToWidthBorderColorOn = await fitToWidthButtonLocator.evaluate((elem) => getComputedStyle(elem).borderColor);
    await expect(fitToWidthBorderColorOn, 'should match the color dark blue').toBe('rgb(6, 23, 42)');

    const width2 = (await this.modPage.getElementBoundingBox(e.whiteboard)).width;
    await expect(Number(width2), 'should the last width be greater than the first one').toBeGreaterThan(Number(width1));
  }

  async enableAndDisablePresentationDownload() {
    const { originalPresentationDownloadable } = getSettings();

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    // enable original presentation download
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    if (!originalPresentationDownloadable) {
      await this.modPage.hasElement(e.presentationOptionsDownloadBtn, 'should display the option download button for the presentation');
      return this.modPage.wasRemoved(e.enableOriginalPresentationDownloadBtn, 'should the original presentation download presentation be removed');
    }
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.enableOriginalPresentationDownloadBtn);
    await this.userPage.waitForSelector(e.whiteboard);
    // check for the download buttons displayed
    await checkNotificationText(this.userPage, e.presentationDownloadEnabledLabel);
    await this.userPage.hasElement(e.presentationDownloadBtn, 'should display the presentation download button for the attendee');
    await this.modPage.hasElement(e.presentationDownloadBtn, 'should display the presentation download button for the moderator');
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
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.wasRemoved(e.presentationDownloadBtn, 'should not display the presentation download button for the moderator');
    await this.userPage.wasRemoved(e.presentationDownloadBtn, 'should not display the presentation download button for the attendee');
  }

  async sendPresentationToDownload(testInfo) {
    const { presentationWithAnnotationsDownloadable } = getSettings();

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    if (!presentationWithAnnotationsDownloadable) {
      await this.modPage.hasElement(e.presentationOptionsDownloadBtn);
      return this.modPage.wasRemoved(e.sendPresentationInCurrentStateBtn);
    }
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.hasElement(e.downloadPresentationToast);
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

    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button for the moderator');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button for the attendee');
  }

  async uploadAndRemoveAllPresentations() {
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await sleep(1000);  // timeout to avoid trying to get the slide data before it's ready

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1, 'should the moderator slide and the attendee slide to be equal').toEqual(userSlides1);

    // Remove
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.hasElementCount(e.presentationItem, 2, 'should display both default and uploaded presentation on the manage presentations modal');
    await this.modPage.waitAndClick(e.removePresentation);  // remove first presentation
    await this.modPage.waitAndClick(e.removePresentation);  // remove second presentation
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button for the moderator');
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button for the attendee');

    // Check removed presentations inside the Manage Presentations
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.wasRemoved(e.presentationsList, 'should not display the presentation list for the moderator');
    await this.modPage.waitAndClick(e.confirmManagePresentation);

    // Making viewer a presenter
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.wasRemoved(e.presentationsList, 'should not display the presentation list for the attendee');
  }

  async removePreviousPresentationFromPreviousPresenter() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.closeAllToastNotifications();
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);

    const modSlides1 = await getSlideOuterHtml(this.modPage);
    const userSlides1 = await getSlideOuterHtml(this.userPage);
    await expect(modSlides1, 'should the moderator slide and the attendee slide to be equal').toEqual(userSlides1);

    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.waitAndClick(e.removePresentation);
    await this.userPage.waitAndClick(e.removePresentation);
    await this.userPage.waitAndClick(e.confirmManagePresentation);

    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.waitAndClick(e.actions);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.wasRemoved(e.presentationsList, 'should not display the presentation list for the attendee');
  }

  async presentationFullscreen() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    const presentationLocator = this.modPage.getLocator(e.presentationContainer);
    const height = parseInt(await getCurrentPresentationHeight(presentationLocator));

    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.waitAndClick(e.presentationFullscreen);

    // Gets fullscreen mode height
    const heightFullscreen = parseInt(await getCurrentPresentationHeight(presentationLocator));

    await expect(heightFullscreen, 'should the height of the presentation fullscreen to be greater than the normal presentation height').toBeGreaterThan(height);
  }

  async presentationSnapshot() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    const presentationSnapshotLocator = this.modPage.getLocator(e.presentationSnapshot);
    await this.modPage.handleDownload(presentationSnapshotLocator, this.modPage.testInfo);
  }

  async hidePresentationToolbar() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(e.smallToastMsg);
    // enabled multi-users whiteboard and hide toolbar
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.waitAndClick(e.toolVisibility);
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };
    await this.modPage.wasRemoved(e.wbToolbar, 'should not display the whiteboard toolbar for the moderator');
    if (!CI) await expect(this.modPage.page, 'should not display the presentation toolbar').toHaveScreenshot('mod-hide-toolbars.png', screenshotOptions);
    await this.userPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar for the viewer with whiteboard access');
    if (!CI) await expect(this.userPage.page, 'should display the presentation toolbar').toHaveScreenshot('user-toolbars.png', screenshotOptions);
  }

  async zoom() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = await this.modPage.getLocator(e.whiteboard);

    const zoomOutButtonLocator = this.modPage.getLocator(e.zoomOutButton);
    await expect(zoomOutButtonLocator, 'should hte zoom out button be disabled').toBeDisabled();
    const resetZoomButtonLocator = this.modPage.getLocator(e.resetZoomButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button contain the default value text').toContainText(defaultZoomLevel);

    //Zoom In 150%
    await expect(wbBox).toHaveScreenshot('moderator1-no-zoom.png');
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator, 'should the zoom out button to be enabled').toBeEnabled();
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 125%').toContainText(/125%/);
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 150%').toContainText(/150%/);
    await expect(wbBox).not.toHaveScreenshot('moderator1-no-zoom.png');

    //Zoom out 125%
    await this.modPage.waitAndClick(e.zoomOutButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 125%').toContainText(/125%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom125.png');

    //Reset Zoom 100%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 150%').toContainText(/150%/);
    await this.modPage.waitAndClick(e.resetZoomButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 100%').toContainText(/100%/);
    await expect(zoomOutButtonLocator, 'should the zoom out button to be disabled').toBeDisabled();
    await expect(wbBox).toHaveScreenshot('moderator1-no-zoom.png');
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
