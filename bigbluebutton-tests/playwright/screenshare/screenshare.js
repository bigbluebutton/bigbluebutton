import { Page } from '../core/page.ts';
import { MultiUsers } from '../user/multiusers';
import { startScreenshare } from './util';
import { elements as e } from '../core/elements.ts';
import { getSettings } from '../core/settings.ts';

export class ScreenShare extends Page {
  async startSharing() {
    const { screensharingEnabled } = getSettings();

    if (!screensharingEnabled) {
      await this.hasElement(e.joinVideo, 'should display the join video button');
      return this.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
    }
    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
  }

  async screenshareStopsExternalVideo() {
    const { screensharingEnabled } = getSettings();

    await this.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.hasElement(e.joinVideo, 'should display the join video button');
      return this.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
    }

    await this.waitAndClick(e.actions);
    await this.waitAndClick(e.shareExternalVideoBtn);
    await this.waitForSelector(e.closeModal);
    await this.type(e.videoModalInput, e.youtubeLink);
    await this.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.getYoutubeFrame();
    await modFrame.hasElement('video', 'should display the video frame');

    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen, 'should display the screenshare element');

    await this.hasElement(e.stopScreenSharing, 'should display the stop screenshare button');
    await this.waitAndClick(e.stopScreenSharing);
    await this.hasElement(e.whiteboard, 'should display the whiteboard');
  }

  async stopSharing() {
    // Stop screenshare
    await this.waitAndClick(e.stopScreenSharing);

    // Verify screenshare is stopped
    await this.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.wasRemoved(e.stopScreenSharing, 'should not display the stop screenshare button after stopping');
    await this.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');
    await this.hasElement(e.whiteboard, 'should display the whiteboard after stopping screenshare');
  }
}

export class MultiUserScreenShare extends MultiUsers {
  async startSharing(page) {
    const { screensharingEnabled } = getSettings();

    if (!screensharingEnabled) {
      await this.hasElement(e.joinVideo, 'should display the join video button');
      return this.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
    }
    await startScreenshare(page);
    await page.hasElement(e.isSharingScreen, 'should display the screenshare element');
  }
}
