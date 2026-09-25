import { expect, test } from '@playwright/test';

import { connectMicrophone } from '../audio/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { dropLiveKitParticipant, getPrimaryRoomState } from '../core/livekit';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
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
}
