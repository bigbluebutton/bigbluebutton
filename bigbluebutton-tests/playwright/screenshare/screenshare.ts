import { expect, test } from '@playwright/test';

import { connectMicrophone } from '../audio/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { dropLiveKitParticipant, getPrimaryRoomState } from '../core/livekit';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { viewerDrawsTwoStrokesAndErasesOne } from '../whiteboard/util';
import { startScreenshare } from './util';

export class ScreenShare extends MultiUsers {
  async startSharing() {
    const { screensharingEnabled } = this.modPage.settings || {};

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
      return;
    }
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }

  async startSharingMultiUser(testPage: Page) {
    const { screensharingEnabled } = this.modPage.settings || {};

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
      return;
    }
    await startScreenshare(testPage);
    await testPage.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }

  async testMobileDevice() {
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
  }

  async screenshareStopsExternalVideo() {
    const { screensharingEnabled } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
      return;
    }

    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.waitForSelector(e.closeModal);
    await this.modPage.fill(e.videoModalInput, e.youtubeLink);
    await this.modPage.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.modPage.getYoutubeFrame();
    await modFrame.hasElement('video', 'should display the video frame');

    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display the screenshare element');

    await this.modPage.hasElement(e.stopScreenSharing, 'should display the stop screenshare button');
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard');
  }

  // Regression: with no current presentation the layout observer closes the
  // presentation area but never recorded that as the last state, so ending a
  // share restored an open, empty media area the presenter could not close.
  async webcamsFillAreaAfterSharingWithoutPresentation() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.shareWebcam();
    await this.modPage.hasElement(e.webcamItem, 'should display the viewer webcam for the moderator');

    // remove the only presentation through the Media Sharing panel
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    await this.modPage.waitAndClick(e.removePresentation);
    await this.modPage.hasElementDisabled(
      e.sharePresentationButton,
      'should disable the share presentation button when there is no presentation',
    );
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard after removing the presentation');
    await this.modPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button without a presentation',
    );
    // the presentation manager stays open after the removal and would cover the actions bar
    await this.modPage.page.keyboard.press('Escape');
    await this.modPage.wasRemoved(e.sharePresentationButton, 'should close the presentation manager');

    await startScreenshare(this.modPage);
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');

    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.modPage.wasRemoved(
      e.presentationContainer,
      'should not display an empty presentation area after the share ends',
    );
    await this.modPage.wasRemoved(
      e.minimizePresentation,
      'should not display the minimize presentation button after the share ends',
    );
    await this.modPage.wasRemoved(
      e.restorePresentation,
      'should not display the restore presentation button after the share ends',
    );
    const webcamBox = await this.modPage.getElementBoundingBox(e.webcamItem);
    const viewport = this.modPage.page.viewportSize();
    if (!webcamBox || !viewport) throw new Error('webcam or viewport size not available');
    expect(webcamBox.height, 'the webcam should fill the media area again after the share ends').toBeGreaterThan(
      viewport.height * 0.4,
    );
  }

  // Regression: with restoreOnUpdate (default true) the presentation container
  // remounts when a share ends and its annotation-history stream replayed the
  // page history, which reopened a presentation the presenter had hidden.
  async presentationStaysHiddenAfterSharingWithAnnotations() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    await viewerDrawsTwoStrokesAndErasesOne(this.modPage, this.userPage);

    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.wasRemoved(e.presentationContainer, 'should hide the presentation');
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation button');

    await startScreenshare(this.modPage);
    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');

    // the reopen used to land about a second after the stop: keep watching
    await this.modPage.page.waitForTimeout(ELEMENT_WAIT_TIME);
    await this.modPage.hasElement(
      e.restorePresentation,
      'the presentation should still be hidden after the share ends',
    );
    await this.modPage.wasRemoved(e.presentationContainer, 'should not display the presentation after the share ends');
    await this.modPage.wasRemoved(e.minimizePresentation, 'should not display the minimize presentation button');
  }

  async stopSharing() {
    // Stop screenshare
    await this.modPage.waitAndClick(e.stopScreenSharing);
    // Verify screenshare is stopped
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.modPage.wasRemoved(e.stopScreenSharing, 'should not display the stop screenshare button after stopping');
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard after stopping screenshare');
  }

  async keepSharingAcrossLiveKitDrop() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
    await this.startSharing();
    await this.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should see the screen share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    const { sid: droppedSid } = await getPrimaryRoomState(this.modPage.page);

    // Observe the whole period. Media drops may always be transient.
    await this.userPage.page.evaluate((selector) => {
      const w = window as unknown as { screenshareVideoGone?: boolean };
      w.screenshareVideoGone = false;
      setInterval(() => {
        if (!document.querySelector(selector)) w.screenshareVideoGone = true;
      }, 100);
    }, e.screenShareVideo);

    await dropLiveKitParticipant(this.modPage.page);
    await this.modPage.hasElement(e.joinAudio, 'the server should have removed the presenter from voice');
    await expect
      .poll(async () => (await getPrimaryRoomState(this.modPage.page)).sid, {
        message: 'the presenter should reconnect to LiveKit as a new participant',
        timeout: 2 * ELEMENT_WAIT_EXTRA_LONG_TIME,
      })
      .not.toBe(droppedSid);
    await this.modPage.wasRemoved(e.joinAudio, 'the presenter should be back in voice', ELEMENT_WAIT_EXTRA_LONG_TIME);

    await this.modPage.hasElement(e.stopScreenSharing, 'the presenter should still be sharing');
    await this.userPage.hasElement(e.screenShareVideo, 'the viewer should still see the screen share');
    const videoGone = await this.userPage.page.evaluate(
      () => (window as unknown as { screenshareVideoGone?: boolean }).screenshareVideoGone,
    );
    expect(videoGone, 'the viewer should not lose the screen share across the drop').toBe(false);
  }

  async presenterLeaveStopsSharing() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await this.startSharing();
    await this.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should see the screen share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    await this.modPage.page.close();
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'the viewer should stop seeing the screen share once the presenter leaves',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.hasElement(e.whiteboard, 'the viewer should still be in the meeting');
  }

  // The former presenter's client stops its own share on losing the role, so
  // this holds even without akka's stop request on presenter assignment.
  async presenterChangeStopsSharing() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await this.startSharing();
    await this.userPage.hasElement(
      e.screenShareVideo,
      'the viewer should see the screen share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );

    await this.makePresenter();
    await this.modPage.wasRemoved(
      e.stopScreenSharing,
      'the former presenter should no longer be sharing',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'the new presenter should stop seeing the former presenter screen share',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }
}
