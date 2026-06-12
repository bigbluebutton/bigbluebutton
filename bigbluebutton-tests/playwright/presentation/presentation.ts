import { expect } from '@playwright/test';

import {
  CI,
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  UPLOAD_PDF_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { checkNotificationText } from '../notifications/util';
import { MultiUsers } from '../user/multiusers';
import {
  checkSvgIndex,
  expectSlidesEqualBetweenPages,
  getCurrentPresentationHeight,
  getSlideOuterHtml,
  uploadMultiplePresentations,
  uploadSinglePresentation,
} from './util';

const defaultZoomLevel = '100%';

export class Presentation extends MultiUsers {
  async skipSlide() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard when the moderator joins the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await checkSvgIndex(this.modPage, '/svg/1');

    await this.modPage.waitAndClick(e.nextSlide);
    await this.modPage.hasElement(e.whiteboard, 'should display the next slide on the whiteboard');
    await this.modPage.page.waitForTimeout(1000);

    await checkSvgIndex(this.modPage, '/svg/2');

    await this.modPage.waitAndClick(e.prevSlide);
    await this.modPage.hasElement(e.whiteboard, 'should display the previous slide on the whiteboard');
    await this.modPage.page.waitForTimeout(1000);

    await checkSvgIndex(this.modPage, '/svg/1');
  }

  async navigateSlidesWithKeys() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard when the moderator joins the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await checkSvgIndex(this.modPage, '/svg/1');

    // Blur any focused element so keydown events target document.body
    const blurActive = () => this.modPage.page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await blurActive();
    await this.modPage.press('ArrowRight');
    await this.modPage.page.waitForFunction(
       ([whiteboardSelector, expectedSvg]) => {
         const whiteboard = document.querySelector(whiteboardSelector);
         return whiteboard?.innerHTML.includes(expectedSvg) ?? false;
       },
       [e.whiteboard, '/svg/2'],
       { timeout: ELEMENT_WAIT_LONGER_TIME },
     );

    await blurActive();
    await this.modPage.press('ArrowLeft');
    await this.modPage.page.waitForFunction(
       ([whiteboardSelector, expectedSvg]) => {
         const whiteboard = document.querySelector(whiteboardSelector);
         return whiteboard?.innerHTML.includes(expectedSvg) ?? false;
       },
       [e.whiteboard, '/svg/1'],
       { timeout: ELEMENT_WAIT_LONGER_TIME },
     );

    await blurActive();
    await this.modPage.press('PageDown');
    await this.modPage.page.waitForFunction(
       ([whiteboardSelector, expectedSvg]) => {
         const whiteboard = document.querySelector(whiteboardSelector);
         return whiteboard?.innerHTML.includes(expectedSvg) ?? false;
       },
       [e.whiteboard, '/svg/2'],
       { timeout: ELEMENT_WAIT_LONGER_TIME },
     );

    await blurActive();
    await this.modPage.press('PageUp');
    await this.modPage.page.waitForFunction(
       ([whiteboardSelector, expectedSvg]) => {
         const whiteboard = document.querySelector(whiteboardSelector);
         return whiteboard?.innerHTML.includes(expectedSvg) ?? false;
       },
       [e.whiteboard, '/svg/1'],
       { timeout: ELEMENT_WAIT_LONGER_TIME },
     );
  }

  async shareCameraAsContent() {
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the whiteboard when the moderator joins the meeting',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareCameraAsContent);
    await this.modPage.hasElement(e.videoPreview, 'should display the camera preview when sharing camera as content');
    await this.modPage.waitAndClick(e.startCameraAsContent);
    await this.modPage.hasElement(e.screenShareVideo, 'should display the screen share video for the moderator');
    await this.modPage.waitAndClick(e.closeIcon);
    await this.modPage.closeAllToastNotifications();
    const modScreenShareVideo = this.modPage.page.locator(e.screenShareVideo);
    await expect(modScreenShareVideo, 'should display the same screenshot as taken before').toHaveScreenshot(
      'moderator-share-camera-as-content.png',
    );

    await this.userPage.wasRemoved(
      e.screenshareConnecting,
      'should stop displaying the connecting message for the viewer after sharing the camera as content',
    );
    await this.userPage.hasElement(e.screenShareVideo, 'should display the screen share video for the viewer');
    await this.modPage.closeAllToastNotifications();
    const viewerScreenShareVideo = this.userPage.page.locator(e.screenShareVideo);
    await expect(viewerScreenShareVideo).toHaveScreenshot('viewer-share-camera-as-content.png');
  }

  async hidePresentation() {
    const { presentationHidden } = this.modPage.settings || {};

    if (!presentationHidden) {
      await this.modPage.hasElement(
        e.whiteboard,
        'should display the whiteboard when the moderator joins the meeting',
        ELEMENT_WAIT_LONGER_TIME,
      );
      await this.modPage.waitAndClick(e.minimizePresentation);
    }
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'should not display the presentation container since the presentation is minimized',
    );
  }

  async hideAndRestorePresentation() {
    await this.hidePresentation();

    await this.modPage.waitAndClick(e.restorePresentation);
    await this.modPage.hasElement(
      e.presentationContainer,
      'should display the presentation container since the presentation was restored',
    );
  }

  async hideAndShareNewPresentation() {
    await this.hidePresentation();

    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME);

    await this.modPage.hasElement(
      e.presentationContainer,
      'should display the presentation container after a new presentation is shared',
    );
  }

  async shareNewPresentationAfterDelete() {
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'should not display the presentation container after the default presentation is removed',
    );
    await this.modPage.press('Escape');

    // because the previous presentation was removed, the one to be uploaded is expected to be the only one (index 0)
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME, 0);

    await this.modPage.hasElement(
      e.presentationContainer,
      'should display the presentation container for the moderator after the new presentation is shared',
    );
    await this.userPage.hasElement(
      e.presentationContainer,
      'should display the presentation container for the attendee after the new presentation is shared',
    );
  }

  async startExternalVideo() {
    const { externalVideoPlayer } = this.modPage.settings || {};

    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard when the moderator joins the meeting');
    await this.modPage.waitAndClick(e.mediaAreaButton);
    if (!externalVideoPlayer) {
      await this.modPage.hasElement(
        e.managePresentations,
        'should display the manage presentation options on the actions button',
      );
      await this.modPage.wasRemoved(
        e.shareExternalVideoBtn,
        'should not display the option to share an external video, since is deactivated',
      );
      return;
    }
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.hasElement(
      e.closeIcon,
      'should display the close modal button after the moderator opens the modal for sharing external video',
    );
    await this.modPage.fill(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.modPage.getYoutubeFrame();
    if (!modFrame) throw Error('Failed to get video frame element for moderator');
    const userFrame = await this.userPage.getYoutubeFrame();
    if (!userFrame) throw Error('Failed to get video frame element for attendee');

    await modFrame.hasElement(
      'video',
      'should display the element frame for the video that is being shared for the moderator',
    );
    await userFrame.hasElement(
      'video',
      'should display the element frame for the video that is being shared for the attendee',
    );
  }

  async checkVideoAfterUserJoins() {
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_LONGER_TIME);

    const user2Frame = await this.userPage2.getYoutubeFrame();
    if (!user2Frame) throw Error('Failed to get video frame element for attendee 2');
    await user2Frame.hasElement(
      'video',
      'should display the element frame for the video that is being shared for the attendee',
    );
  }

  async pauseExternalVideo() {
    const modFrame = await this.modPage.getYoutubeFrame();
    if (!modFrame) throw Error('Failed to get video frame element');

    await modFrame.hasElement('video', 'should display the video element before pausing');

    const playButton = modFrame.frame.locator('.ytp-play-button');
    await playButton.waitFor({ state: 'visible', timeout: 5000 });

    await expect(playButton).toHaveAttribute('data-title-no-tooltip', 'Pause');

    await playButton.click();
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);

    await expect(playButton).toHaveAttribute('data-title-no-tooltip', 'Play');
  }

  async changePresenterWhileVideoPlaying() {
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.closeAllToastNotifications();

    const userFrame = await this.userPage.getYoutubeFrame();
    if (!userFrame) throw Error('Failed to get video frame element');

    await userFrame.hasElement('video', 'should display the element frame for the video that is being shared');
    await this.modPage.wasRemoved(
      e.stopExternalVideoBtn,
      'should remove the stop external video button from the moderator when presenter change',
    );

    await this.userPage.hasElement(
      e.stopExternalVideoBtn,
      'should display the stop external video button for the new presenter',
    );
  }

  async endExternalVideo() {
    await this.modPage.waitAndClick(e.stopExternalVideoBtn);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard after stopping the external video');
  }

  async uploadSinglePresentationTest() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(
      e.smallToastMsg,
      'should not display any toast message for the moderator after closing all',
    );

    const imageURLFirstPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME);

    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    // also because the slide location is different and inconsistent
    // (it initially shakes to stabilize and then set incorrect location)
    if (!CI) {
      const modWhiteboardLocator = this.modPage.page.locator(e.whiteboard);
      await expect(modWhiteboardLocator).toHaveScreenshot('moderator-new-presentation-screenshot.png', {
        maxDiffPixels: 1000,
      });
    }
    const imageURLSecondPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await this.userPage.reloadPage();
    await this.userPage.closeAudioModal();
    await this.userPage.closeAllToastNotifications();
    const userWhiteboardLocator = this.userPage.page.locator(e.whiteboard);

    await expect(imageURLFirstPresentation).not.toBe(imageURLSecondPresentation);

    // Skip check for screenshot on ci, due to the ci and the local machine generating two different image sizes
    // also because the slide location is different and inconsistent
    // (it initially shakes to stabilize and then set incorrect location)
    if (!CI) {
      await this.modPage.page.waitForTimeout(1000);
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
    await this.modPage.wasRemoved(
      e.smallToastMsg,
      'should not display any toast message for the moderator after closing all',
    );

    const imageURLFirstPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
      return urlMatch ? urlMatch[1] : null;
    });

    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName, UPLOAD_PDF_WAIT_TIME);
    await this.modPage.closeAllToastNotifications();
    await this.userPage.closeAllToastNotifications();

    const modWhiteboardLocator = this.modPage.page.locator(e.whiteboard);
    const userWhiteboardLocator = this.userPage.page.locator(e.whiteboard);

    const imageURLSecondPresentation = await this.modPage.page.evaluate(() => {
      const element = document.querySelector('div[id="whiteboard-element"] div[class="tl-image"]');
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
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
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
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
      const style = element?.getAttribute('style');
      const urlMatch = style?.match(/background-image: url\("([^"]+)"\)/);
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
    await this.modPage.wasRemoved(
      e.smallToastMsg,
      'should not display any toast message for the moderator after closing all',
    );

    const modSlides0 = await getSlideOuterHtml(this.modPage);
    await expectSlidesEqualBetweenPages(
      this.modPage,
      this.userPage,
      'should the moderator slide and the attendee slide to be equal before upload',
    );

    await uploadMultiplePresentations(this.modPage, [e.questionSlideFileName, e.uploadPresentationFileName]);

    await expectSlidesEqualBetweenPages(
      this.modPage,
      this.userPage,
      'moderator slide 1 should be equal to the user slide 1',
    );
    const modSlides1 = await getSlideOuterHtml(this.modPage);
    await expect(modSlides0, 'moderator slide 0 should not be equal to moderator slide 1').not.toEqual(modSlides1);
  }

  async fitToWidthTest() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.hidePublicChat);
    const width1 = (await this.modPage.getElementBoundingBox(e.whiteboard))?.width;
    // check if its off
    const fitToWidthButtonLocator = this.modPage.page.locator(`${e.fitToWidthButton} > span>>nth=0`);
    const fitToWidthBorderColorOff = await fitToWidthButtonLocator.evaluate(
      (elem) => getComputedStyle(elem).borderColor,
    );
    await expect(fitToWidthBorderColorOff, 'should match the white color').toBe('rgba(0, 0, 0, 0)');

    await this.modPage.waitAndClick(e.fitToWidthButton);
    await this.modPage.page.waitForTimeout(500);

    // check if its on
    const fitToWidthBorderColorOn = await fitToWidthButtonLocator.evaluate(
      (elem) => getComputedStyle(elem).borderColor,
    );
    await expect(fitToWidthBorderColorOn, 'should match the color dark blue').toBe('rgb(6, 23, 42)');

    const width2 = (await this.modPage.getElementBoundingBox(e.whiteboard))?.width;
    await expect(Number(width2), 'should the last width be greater than the first one').toBeGreaterThan(Number(width1));
  }

  async enableAndDisablePresentationDownload() {
    const { originalPresentationDownloadable } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    // enable original presentation download
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    if (!originalPresentationDownloadable) {
      await this.modPage.hasElement(
        e.presentationOptionsDownloadBtn,
        'should display the option download button for the presentation',
      );
      await this.modPage.wasRemoved(
        e.enableOriginalPresentationDownloadBtn,
        'should the original presentation download presentation be removed',
      );
      return;
    }
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.enableOriginalPresentationDownloadBtn);
    await this.userPage.waitForSelector(e.whiteboard);
    // check for the download buttons displayed
    await checkNotificationText(this.userPage, e.presentationDownloadEnabledLabel);
    await this.userPage.hasElement(
      e.presentationDownloadBtn,
      'should display the presentation download button for the attendee',
    );
    await this.modPage.hasElement(
      e.presentationDownloadBtn,
      'should display the presentation download button for the moderator',
    );
    /**
     * the following steps throwing "Error: ENOENT: no such file or directory" at the end of execution
     * due to somehow it's trying to take the screenshot of the tab that opened for the file download
     */
    //! await this.modPage.handleDownload(this.modPage.page.locator(e.presentationDownloadBtn), testInfo);
    //! await this.userPage.handleDownload(this.userPage.page.locator(e.presentationDownloadBtn), testInfo);
    // disable original presentation download

    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    await this.modPage.waitAndClick(e.disableOriginalPresentationDownloadBtn);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.modPage.wasRemoved(
      e.presentationDownloadBtn,
      'should not display the presentation download button for the moderator',
    );
    await this.userPage.wasRemoved(
      e.presentationDownloadBtn,
      'should not display the presentation download button for the attendee',
    );
  }

  async sendPresentationToDownload() {
    const { presentationWithAnnotationsDownloadable } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.presentationOptionsDownloadBtn);
    if (!presentationWithAnnotationsDownloadable) {
      await this.modPage.hasElement(
        e.presentationOptionsDownloadBtn,
        'should display the option download button for the presentation',
      );
      await this.modPage.wasRemoved(
        e.sendPresentationInCurrentStateBtn,
        'should the send presentation in current state button be removed',
      );
      return;
    }
    await this.modPage.waitAndClick(e.sendPresentationInCurrentStateBtn);
    await this.modPage.hasElement(e.downloadPresentationToast, 'should display the download presentation toast');
    await this.userPage.hasElement(
      e.downloadPresentation,
      'should display the download presentation button for the attendee',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    const downloadPresentationLocator = this.userPage.page.locator(e.downloadPresentation);
    await this.userPage.handleDownload(downloadPresentationLocator);
  }

  async removeAllPresentation() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.hasElementDisabled(e.sharePresentationButton, 'should disable the share presentation button when there is no presentation');

    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.modPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button for the moderator',
    );
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button for the attendee',
    );
  }

  async presentationThumbnailLoads() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.hasElement(
      e.presentationItem,
      'should display the presentation item in the manage presentations list',
    );

    const thumbnail = this.modPage.page.locator(e.presentationThumbnails).first().locator('img');

    // The thumbnail request is authorized only when the client appends the session
    // token to the URL (the server returns 401 otherwise). Without the token the
    // image fails to load and naturalWidth stays 0.
    await expect(thumbnail, 'should append the session token to the thumbnail URL').toHaveAttribute(
      'src',
      /sessionToken=/,
      { timeout: ELEMENT_WAIT_TIME },
    );

    await expect
      .poll(
        async () =>
          thumbnail.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0),
        {
          message: 'should load the presentation thumbnail image (no 401 Unauthorized)',
          timeout: ELEMENT_WAIT_LONGER_TIME,
        },
      )
      .toBe(true);
  }

  async uploadAndRemoveAllPresentations() {
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await expectSlidesEqualBetweenPages(
      this.modPage,
      this.userPage,
      'should the moderator slide and the attendee slide to be equal',
    );

    // Remove
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.hasElementCount(
      e.presentationItem,
      2,
      'should display both default and uploaded presentation on the manage presentations modal',
    );
    await this.modPage.waitAndClick(e.removePresentation);  // remove first presentation
    await this.modPage.waitAndClick(e.removePresentation);  // remove second presentation

    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the moderator');
    await this.modPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button for the moderator',
    );
    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button for the attendee',
    );

    // Check removed presentations inside the Manage Presentations
    await this.modPage.wasRemoved(e.presentationItem, 'should not display the presentation list for the moderator');
    await this.modPage.press('Escape'); // close the media sharing menu

    // Making viewer a presenter
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.mediaAreaButton);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.wasRemoved(e.presentationsList, 'should not display the presentation list for the attendee');
  }

  async removePreviousPresentationFromPreviousPresenter() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.closeAllToastNotifications();
    await uploadSinglePresentation(this.modPage, e.uploadPresentationFileName);

    await expectSlidesEqualBetweenPages(
      this.modPage,
      this.userPage,
      'should the moderator slide and the attendee slide to be equal',
    );

    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
    await this.modPage.waitAndClick(e.makePresenter);

    await this.userPage.waitAndClick(e.mediaAreaButton);
    await this.userPage.waitAndClick(e.managePresentations);
    await this.userPage.waitAndClick(e.removePresentation);
    await this.userPage.waitAndClick(e.removePresentation);

    await this.userPage.wasRemoved(e.whiteboard, 'should not display the whiteboard for the attendee');
    await this.userPage.wasRemoved(e.presentationItem, 'should not display the presentation list for the attendee');
  }

  async presentationFullscreen() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    const presentationLocator = this.modPage.page.locator(e.presentationContainer);
    const height = parseInt(await getCurrentPresentationHeight(presentationLocator), 10);

    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    await this.modPage.waitAndClick(e.presentationFullscreen);

    // Gets fullscreen mode height
    const heightFullscreen = parseInt(await getCurrentPresentationHeight(presentationLocator), 10);

    await expect(
      heightFullscreen,
      'should the height of the presentation fullscreen to be greater than the normal presentation height',
    ).toBeGreaterThan(height);
  }

  async presentationSnapshot() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton);
    const presentationSnapshotLocator = this.modPage.page.locator(e.presentationSnapshot);
    await this.modPage.handleDownload(presentationSnapshotLocator);
  }

  async hidePresentationToolbar() {
    // wait for whiteboard to load and no notifications
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitForSelector(e.skipSlide);
    await this.modPage.closeAllToastNotifications();
    await this.modPage.wasRemoved(
      e.smallToastMsg,
      'should not display any toast message for the moderator after closing all',
    );
    // enabled multi-users whiteboard and hide toolbar
    await this.modPage.waitAndClick(e.multiUsersWhiteboardOn);
    await this.modPage.waitAndClick(e.whiteboardOptionsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.toolVisibility);
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };
    await this.modPage.wasRemoved(e.wbToolbar, 'should not display the whiteboard toolbar for the moderator');
    if (!CI)
      await expect(this.modPage.page, 'should not display the presentation toolbar').toHaveScreenshot(
        'mod-hide-toolbars.png',
        screenshotOptions,
      );
    await this.userPage.hasElement(
      e.wbToolbar,
      'should display the whiteboard toolbar for the viewer with whiteboard access',
    );
    if (!CI)
      await expect(this.userPage.page, 'should display the presentation toolbar').toHaveScreenshot(
        'user-toolbars.png',
        screenshotOptions,
      );
  }

  async zoom() {
    await this.modPage.waitForSelector(e.resetZoomButton, ELEMENT_WAIT_LONGER_TIME);

    const wbBox = this.modPage.page.locator(e.whiteboard);

    const zoomOutButtonLocator = this.modPage.page.locator(e.zoomOutButton);
    await expect(zoomOutButtonLocator, 'should hte zoom out button be disabled').toBeDisabled();
    const resetZoomButtonLocator = this.modPage.page.locator(e.resetZoomButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button contain the default value text').toContainText(
      defaultZoomLevel,
    );

    // Zoom In 150%
    await expect(wbBox).toHaveScreenshot('moderator1-no-zoom.png');
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(zoomOutButtonLocator, 'should the zoom out button to be enabled').toBeEnabled();
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 125%').toContainText(/125%/);
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 150%').toContainText(/150%/);
    await expect(wbBox).not.toHaveScreenshot('moderator1-no-zoom.png');

    // Zoom out 125%
    await this.modPage.waitAndClick(e.zoomOutButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 125%').toContainText(/125%/);
    await expect(wbBox).toHaveScreenshot('moderator1-zoom125.png');

    // Reset Zoom 100%
    await this.modPage.waitAndClick(e.zoomInButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 150%').toContainText(/150%/);
    await this.modPage.waitAndClick(e.resetZoomButton);
    await expect(resetZoomButtonLocator, 'should the reset zoom button to contain the text 100%').toContainText(/100%/);
    await expect(zoomOutButtonLocator, 'should the zoom out button to be disabled').toBeDisabled();
    await expect(wbBox).toHaveScreenshot('moderator1-no-zoom.png');
  }

  async selectSlide() {
    await this.modPage.waitForSelector(e.skipSlide);

    const wbBox = this.modPage.page.locator(e.whiteboard);

    await this.modPage.selectSlide('Slide 10');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide10.png');

    await this.modPage.selectSlide('Slide 5');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide5.png');

    await this.modPage.selectSlide('Slide 13');
    await expect(wbBox).toHaveScreenshot('moderator1-select-slide13.png');
  }
}
