import { expect, test } from '@playwright/test';

import { connectMicrophone } from '../audio/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { dropLiveKitParticipant, getPrimaryRoomState } from '../core/livekit';
import { allowMedia } from '../core/mediaPermissions';
import { Page } from '../core/page';
import { expectVideoReceived } from '../core/rtcStatsProbe';
import { EXTERNAL_VIDEO_URL, routeExternalVideo } from '../presentation/util';
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

  async lateJoinerReceivesScreenshare() {
    await startScreenshare(this.modPage);
    await this.initUserPage(this.context);
    await this.userPage.hasElement(
      e.screenShareVideo,
      'should display the ongoing screenshare to a user who joins after it started',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expectVideoReceived(this.userPage.page, e.screenShareVideo, 'the late joiner should decode the screenshare');
  }

  // https://github.com/bigbluebutton/bigbluebutton/issues/26704
  // The attendee's screen share volume control used to appear only on mouse movement. Drives it with
  // the keyboard only. The control renders only when the stream carries audio (the fake capture does).
  async attendeeVolumeByKeyboard() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await startScreenshare(this.modPage);
    const { userPage } = this;
    await userPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare to the attendee',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await userPage.hasElement(
      e.screenshareFullscreenButton,
      'should display the screenshare fullscreen button to the attendee',
      ELEMENT_WAIT_LONGER_TIME,
    );
    // Park the pointer outside the screenshare and let the mouse-movement timeout expire: from here
    // on only the keyboard may reveal the volume control.
    await userPage.page.mouse.move(0, 0);
    await expect(
      userPage.page.locator(e.screenshareVolumeSlider),
      'the volume slider should stay hidden without mouse movement or focus',
    ).toBeHidden({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await userPage.page.locator(e.screenshareFullscreenButton).focus();
    await userPage.press('Tab');
    const muteButton = userPage.page.locator(e.screenshareMuteButton);
    await expect(muteButton, 'Tab from the fullscreen button should focus the mute button').toBeFocused();
    await expect(muteButton, 'the mute button should be visible while it has focus').toBeVisible();
    await expect(muteButton, 'the mute button should have its own accessible name').toHaveAttribute(
      'aria-label',
      'Mute screen share',
    );

    await userPage.press('Tab');
    const volumeSlider = userPage.page.locator(e.screenshareVolumeSlider);
    await expect(volumeSlider, 'Tab from the mute button should focus the volume slider').toBeFocused();
    await expect(volumeSlider, 'the volume slider should be visible while it has focus').toBeVisible();
  }

  // https://github.com/bigbluebutton/bigbluebutton/issues/26704
  // With fullscreen disabled (public.app.allowFullscreen: false) and no plugin buttons, the screenshare
  // has no other Tab stop, so the container itself takes focus and reveals the volume control.
  async attendeeVolumeByKeyboardWithoutFullscreen() {
    test.skip(!this.modPage.settings?.screensharingEnabled, 'Screen sharing is disabled');
    await startScreenshare(this.modPage);
    const { userPage } = this;
    await userPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare to the attendee',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await userPage.wasRemoved(
      e.screenshareFullscreenButton,
      'should not display the fullscreen button when fullscreen is disabled',
    );
    await userPage.page.mouse.move(0, 0);
    const volumeSlider = userPage.page.locator(e.screenshareVolumeSlider);
    await expect(volumeSlider, 'the volume slider should stay hidden without mouse movement or focus').toBeHidden({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });

    const container = userPage.page.locator(e.screenshareContainer);
    await expect(container, 'the screenshare should be a keyboard Tab stop').toHaveAttribute('tabindex', '0');
    await expect(container, 'the screenshare Tab stop should be exposed as a group').toHaveRole('group');
    await expect(container, 'the screenshare Tab stop should have an accessible name').toHaveAccessibleName(
      'Screen share',
    );

    await container.focus();
    await userPage.press('Tab');
    const muteButton = userPage.page.locator(e.screenshareMuteButton);
    await expect(muteButton, 'Tab from the screenshare should focus the mute button').toBeFocused();
    await expect(muteButton, 'the mute button should be visible while it has focus').toBeVisible();
    await userPage.press('Tab');
    await expect(volumeSlider, 'Tab from the mute button should focus the volume slider').toBeFocused();
    await expect(volumeSlider, 'the volume slider should be visible while it has focus').toBeVisible();
  }

  async attendeeScreenshareHasNoExtraTabStop() {
    await expect(
      this.userPage.page.locator(e.screenshareContainer),
      'the screenshare should not add a Tab stop while the fullscreen button provides one',
    ).not.toHaveAttribute('tabindex', /.*/);
  }

  async refusedScreenCapture() {
    await this.modPage.waitAndClick(e.startScreenSharing);
    await this.modPage.hasText(
      e.smallToastMsg,
      e.screenCapturePermissionErrorLabel,
      'should tell the presenter that the screen capture permission was refused',
    );
    await this.modPage.hasElement(e.helpLinkToastButton, 'should offer help with the refused screen capture');
    await this.modPage.wasRemoved(e.screenshareConnecting, 'should not stay connecting to a screenshare');
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not show the screen as shared');
    await this.modPage.hasElementEnabled(e.startScreenSharing, 'should keep the start screenshare button usable');
    // The same button shares the screen once the capture is allowed, so nothing was left half started.
    await allowMedia(this.modPage.page);
    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should share the screen once the capture is allowed');
  }

  async testMobileDevice() {
    await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the start screenshare button');
  }

  async mobilePresenterSharesToDesktopViewer() {
    await this.modPage.hasElement(e.startScreenSharing, 'should display screen sharing in the actions bar');
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.hasNElements(
      '[data-test="startScreenShare"]',
      2,
      'should display screen sharing in the Media Sharing panel',
    );
    await this.modPage.page.keyboard.press('Escape');

    await this.initUserPage(this.context);
    await startScreenshare(this.modPage);
    await this.userPage.hasElement(
      e.screenShareVideo,
      'should deliver the mobile presenter screen share to a desktop viewer',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await expectVideoReceived(
      this.userPage.page,
      e.screenShareVideo,
      'the desktop viewer should decode the mobile presenter screen share',
    );

    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(e.isSharingScreen, 'should not display the screenshare element after stopping');
    await this.modPage.wasRemoved(e.stopScreenSharing, 'should not display the stop screenshare button after stopping');
    await this.modPage.hasElement(e.startScreenSharing, 'should display the start screenshare button after stopping');
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'the desktop viewer should stop receiving the screen share once the mobile presenter stops it',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }

  async screenshareStopsExternalVideo() {
    const { screensharingEnabled } = this.modPage.settings || {};

    await this.modPage.waitForSelector(e.whiteboard);

    if (!screensharingEnabled) {
      await this.modPage.hasElement(e.joinVideo, 'should display the join video button');
      await this.modPage.wasRemoved(e.startScreenSharing, 'should not display the screenshare button');
      return;
    }

    await routeExternalVideo(this.context);
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.shareExternalVideoBtn);
    await this.modPage.fill(e.videoModalInput, EXTERNAL_VIDEO_URL);
    await this.modPage.waitAndClick(e.startShareVideoBtn);
    await this.modPage.press('Escape'); // close the media sharing menu

    await this.modPage.hasElement(e.externalVideo, 'should display the video frame');

    await startScreenshare(this.modPage);
    await this.modPage.hasElement(e.isSharingScreen, 'should display the screenshare element');
    await this.modPage.wasRemoved(e.externalVideo, 'should stop the external video when the screenshare starts');

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
