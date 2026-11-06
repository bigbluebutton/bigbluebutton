import { expect, Page as PlaywrightPage, WebSocketRoute } from '@playwright/test';

import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  VIDEO_LOADING_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { InitOptionsProps, Page } from '../core/page';
import { getLocaleValues } from '../options/util';
import { InitExtraPageOptionsProps, MultiUsers } from '../user/multiusers';
import { openLockViewers, setGuestPolicyOption } from '../user/util';
import {
  DeviceKind,
  NO_LISTEN_ONLY_JOIN_PARAMETER,
  NO_PRE_FLIGHT_INIT_OPTIONS,
  PRE_FLIGHT_CREATE_PARAMETER,
  PRE_FLIGHT_INIT_OPTIONS,
  refuseDevices,
} from './util';

const GUEST_DENY_REDIRECT_TIMEOUT = 15000;

const GUEST_DENIED_LOGOUT_URL = /reasonCode=guest_deny_reason/;

// The client's own timings (connection-manager's retryWait, presenceManager's
// JOIN_RETRY_TIMEOUT), plus the usual budget for the screen to follow.
const GRAPHQL_RETRY_WAIT = 10000 + ELEMENT_WAIT_LONGER_TIME;
const JOIN_RETRY_TIMEOUT = 20000 + ELEMENT_WAIT_LONGER_TIME;

const USER_JOIN_OPERATION = '"operationName":"UserJoin"';

// 1012 (service restart): graphql-ws reconnects on it, where most 1xxx codes,
// 1011 included, are fatal to it and end the retries.
const DROPPED_SOCKET = { code: 1012, reason: 'Connection dropped by the test' };

export class PreFlight extends MultiUsers {
  private graphqlSockets: { client: WebSocketRoute; server: WebSocketRoute }[] = [];

  private graphqlDown = false;

  private graphqlRefused = 0;

  private holdUserJoin = false;

  private heldUserJoins = 0;

  // The attendee is the one held by the pre-flight; the moderator goes through
  // the regular flow and observes the server side of the join.
  async initModPage(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await super.initModPage(page, {
      createParameter: PRE_FLIGHT_CREATE_PARAMETER,
      ...NO_PRE_FLIGHT_INIT_OPTIONS,
      ...options,
    });
  }

  // prepare runs on the attendee's page before it loads, so a fault injected
  // there is in place for the first getUserMedia and the first socket.
  async initUserPageWithPreFlight(
    prepare?: (page: PlaywrightPage) => Promise<unknown>,
    options: InitOptionsProps = {},
  ) {
    const page = await this.context.newPage();
    if (prepare) await prepare(page);
    this.userPage = new Page(this.browser, page, this.modPage.testInfo);
    await this.userPage.init(false, {
      fullName: 'Attendee',
      meetingId: this.modPage.meetingId,
      ...PRE_FLIGHT_INIT_OPTIONS,
      ...options,
    });
    // Same first-paint budget as init()'s layout wait, which is skipped here.
    await this.userPage.hasElement(
      e.preFlight,
      'should display the pre-flight screen before joining',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }

  // The toggle starts in autoShareWebcam's state, off by default.
  async enableCamera() {
    await this.userPage.waitAndClick(e.preFlightCameraToggle);
    await this.userPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the camera preview once the camera is toggled on',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async confirmJoin() {
    await this.userPage.waitAndClick(e.preFlightJoinButton);
    await this.userPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.userPage.wasRemoved(e.preFlight, 'should remove the pre-flight screen after joining');
  }

  async joinsOnlyAfterConfirmation() {
    await this.initUserPageWithPreFlight();

    // Both absences are read after settled positive signals (the pre-flight is
    // rendered, the moderator's own list item is up), so a join in flight would
    // already have landed.
    await this.userPage.hasElement(e.preFlightJoinButton, 'should display the join button in the pre-flight');
    // Opened so the attendee's absence is asserted over a rendered list.
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(e.currentUser, "should display the moderator's own user list item");
    expect(
      await this.userPage.checkElement(e.layoutContainer),
      'should not render the meeting layout before the join is confirmed',
    ).toBeFalsy();
    expect(
      await this.modPage.checkElement(e.viewerAvatar),
      'should not display the attendee in the user list before the join is confirmed',
    ).toBeFalsy();

    await this.confirmJoin();
    await this.modPage.hasElement(
      e.viewerAvatar,
      'should display the attendee in the user list after the join is confirmed',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async joinsAudioWithoutModal() {
    await this.initUserPageWithPreFlight();
    await this.confirmJoin();

    await this.userPage.hasElement(
      e.muteMicButton,
      'should join the audio unmuted with the pre-flight microphone selection',
      ELEMENT_WAIT_LONGER_TIME,
    );
    // Only meaningful once the audio has settled: before that the modal simply
    // hasn't had the chance to open.
    expect(
      await this.userPage.checkElement(e.audioModal),
      'should not display the audio modal after the pre-flight',
    ).toBeFalsy();
  }

  async joinsMutedWhenMicToggledOff() {
    await this.initUserPageWithPreFlight();
    await this.userPage.waitAndClick(e.preFlightMuteToggle);
    await this.confirmJoin();

    await this.userPage.hasElement(
      e.unmuteMicButton,
      'should join the audio muted when the microphone is toggled off in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.audioModal),
      'should not display the audio modal after the pre-flight',
    ).toBeFalsy();
  }

  async sharesCameraWithoutPreviewModal() {
    await this.initUserPageWithPreFlight();
    await this.enableCamera();

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.leaveVideo,
      'should share the camera picked in the pre-flight right after joining',
      VIDEO_LOADING_WAIT_TIME,
    );
    expect(
      await this.userPage.checkElement(e.startSharingWebcam),
      'should not display the video preview modal after joining',
    ).toBeFalsy();
    await this.modPage.hasElement(
      e.webcamContainer,
      "should display the attendee's camera for the moderator",
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async keepsCameraOffWhenToggled() {
    await this.initUserPageWithPreFlight();
    await this.enableCamera();
    await this.userPage.waitAndClick(e.preFlightCameraToggle);
    await this.userPage.wasRemoved(
      e.webcamMirroredVideoPreview,
      'should stop the camera preview when the camera is toggled off',
    );

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.joinVideo,
      'should not share the camera when it is toggled off in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.webcamMirroredVideoContainer),
      'should not display the own camera when it is toggled off in the pre-flight',
    ).toBeFalsy();
  }

  async picksDevicesInTheSetupPanel() {
    await this.initUserPageWithPreFlight();
    // The camera and quality selectors are disabled while the camera is off.
    await this.enableCamera();

    const selectors = [
      e.preFlightOutputDevice,
      e.preFlightInputDevice,
      e.preFlightCameraDevice,
      e.preFlightCameraQuality,
    ];

    for (const selector of selectors) {
      await this.userPage.waitAndClick(selector);
      // nth=0: an unscoped locator over a multi-entry list trips strict mode.
      await this.userPage.hasElement(`${e.selectMenuItem} >> nth=0`, `should list the devices of ${selector}`);
      await this.userPage.waitAndClick(`${e.selectMenuItem} >> nth=0`);
      await this.userPage.wasRemoved(`${e.selectMenuItem} >> nth=0`, `should close the dropdown of ${selector}`);
    }

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.muteMicButton,
      'should connect the audio with the device picked in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async changesSettingsBeforeJoining() {
    const locale = 'pt-BR';
    const translated = await getLocaleValues(
      {
        [e.preFlightSettingsButton]: 'app.userList.settingsTitle',
        [e.chatTitle]: 'app.userList.messagesTitle',
      },
      locale,
    );
    const htmlFontSize = () => this.userPage.page.evaluate(() => document.documentElement.style.fontSize);
    const htmlTheme = () => this.userPage.page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    await this.initUserPageWithPreFlight();
    const initialFontSize = await htmlFontSize();
    expect(initialFontSize, 'should size the document before the join').not.toBe('');

    await this.userPage.waitAndClick(e.preFlightSettingsButton);
    await this.userPage.waitForSelector(e.languageSelector, ELEMENT_WAIT_TIME);
    expect(
      await this.userPage.page.locator(e.languageSelector).inputValue(),
      'should open the language dropdown on the language the pre-flight is in',
    ).toMatch(/^en/);
    await this.userPage.page.locator(e.languageSelector).selectOption({ value: locale });
    await this.userPage.waitAndClick(e.increaseFontSize);
    await this.userPage.waitAndClick(e.darkModeToggleBtn);
    await this.userPage.waitAndClick(e.saveSettingsButton);
    await this.userPage.wasRemoved(e.saveSettingsButton, 'should close the settings modal on save');

    await this.userPage.hasText(
      e.preFlightSettingsButton,
      translated[e.preFlightSettingsButton],
      'should translate the pre-flight into the language picked in its settings',
    );
    const pickedFontSize = await htmlFontSize();
    expect(pickedFontSize, 'should apply the font size picked in the pre-flight').not.toBe(initialFontSize);
    expect(await htmlTheme(), 'should apply the dark theme picked in the pre-flight').toBe('dark');
    expect(
      await this.userPage.page.evaluate(() => document.documentElement.lang),
      'should set the document language to the one picked in the pre-flight',
    ).toBe(locale);

    await this.confirmJoin();
    await this.userPage.hasText(
      e.chatTitle,
      translated[e.chatTitle],
      'should keep the language picked in the pre-flight after joining',
    );
    expect(await htmlFontSize(), 'should keep the font size picked in the pre-flight after joining').toBe(
      pickedFontSize,
    );
    expect(await htmlTheme(), 'should keep the dark theme picked in the pre-flight after joining').toBe('dark');
  }

  async holdAttendeeInGuestLobby() {
    await setGuestPolicyOption(this.modPage, e.askModerator);
    // The policy has to reach the server before the guest joins, or they walk
    // in. The modal seeds its selector once, on open, so it is reopened until
    // the new policy shows.
    await expect(async () => {
      await openLockViewers(this.modPage);
      await this.modPage.waitAndClick(e.guestPolicyTab);
      const policy = await this.modPage.page.locator(e.guestPolicySelector).first().textContent();
      await this.modPage.waitAndClick(e.closeModal);
      expect(policy).toMatch(/Ask moderator/);
    }, 'should have the ask-moderator guest policy applied before the guest joins').toPass({
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    await this.initUserPageWithPreFlight();

    await this.userPage.hasText(
      e.guestMessage,
      /wait/,
      'should display the waiting message in the pre-flight guest lobby',
    );
  }

  async guestLobbyWithinPreFlight() {
    await this.holdAttendeeInGuestLobby();

    await this.userPage.hasText(
      e.positionInWaitingQueue,
      /first/,
      'should display the position in the waiting queue in the pre-flight guest lobby',
    );
    expect(
      await this.userPage.checkElement(e.preFlightJoinButton),
      'should not display the join button while the guest waits for approval',
    ).toBeFalsy();

    // The attendee joins without guest=true, so they queue as authenticated.
    // setGuestPolicyOption already left the user list open, and the queue's
    // action buttons only render once its section is expanded.
    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.allowAllAuthenticatedWaiting);
    await this.userPage.hasElement(
      e.preFlightJoinButton,
      'should display the join button once the guest is approved',
      ELEMENT_WAIT_LONGER_TIME,
    );

    await this.confirmJoin();
    await this.modPage.hasElement(
      e.viewerAvatar,
      'should display the approved guest in the user list after they join',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async guestDenialWithinPreFlight() {
    await this.holdAttendeeInGuestLobby();

    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.denyAllAuthenticatedWaiting);

    await this.userPage.hasElement(
      e.preFlightGuestDenied,
      'should display the denial screen once the guest is denied',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(
      e.preFlightSessionInfo,
      'should name the session the denial is about, which the heading no longer carries',
    );
    await this.userPage.hasText(
      e.preFlightSessionAge,
      /Session started/,
      'should say how long ago the session started',
    );
    await this.userPage.hasElement(e.preFlightLeaveButton, 'should offer the denied guest a way out of the session');
    await this.userPage.hasElement(
      e.preFlightCameraToggle,
      'should keep the setup panel the guest was already looking at',
    );
    expect(
      await this.userPage.checkElement(e.preFlightJoinButton),
      'should not display the join button to a denied guest',
    ).toBeFalsy();

    await this.userPage.hasElement(
      e.preFlightErrorNotice,
      'should say the screen is about to take the guest out, rather than doing it unannounced',
    );

    const secondsLeft = async () =>
      Number((await this.userPage.page.locator(e.preFlightErrorNotice).textContent())?.match(/\d+/)?.[0]);
    // A restarted countdown reads the full count again, so the reading taken
    // before the layout change has to be below it for the check to catch one.
    const fullCount = GUEST_DENY_REDIRECT_TIMEOUT / 1000;
    await expect.poll(secondsLeft, { timeout: ELEMENT_WAIT_TIME }).toBeLessThan(fullCount - 1);
    const before = await secondsLeft();
    const viewport = this.userPage.page.viewportSize();
    await this.userPage.page.setViewportSize({ width: 400, height: 800 });
    await this.userPage.hasElement(
      e.preFlightErrorDialog,
      'should open the denial as a dialog over the guest lobby on the phone layout',
    );
    await this.userPage.hasElement(e.guestMessage, 'should keep the guest lobby behind the dialog');
    await this.userPage.hasElement(e.preFlightErrorNotice, 'should keep the countdown on the phone layout');
    expect(await secondsLeft(), 'should not restart the countdown on a layout change').toBeLessThanOrEqual(before);
    if (viewport) await this.userPage.page.setViewportSize(viewport);

    await expect(this.userPage.page, 'should take the denied guest to the logout URL on its own').toHaveURL(
      GUEST_DENIED_LOGOUT_URL,
      { timeout: GUEST_DENY_REDIRECT_TIMEOUT + ELEMENT_WAIT_TIME },
    );
  }

  async guestDenialLeaveButton() {
    await this.holdAttendeeInGuestLobby();

    await this.modPage.waitAndClick(e.authenticatedWaitingUsers);
    await this.modPage.waitAndClick(e.denyAllAuthenticatedWaiting);
    await this.userPage.hasElement(
      e.preFlightGuestDenied,
      'should display the denial screen once the guest is denied',
      ELEMENT_WAIT_LONGER_TIME,
    );

    // A tab that loads into the denial never had the setup panel, so it gets
    // none, and no device prompt with it.
    await this.userPage.page.reload();
    await this.userPage.hasElement(
      e.preFlightGuestDenied,
      'should display the denial screen again after a reload',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.preFlightCameraToggle),
      'should not display the setup panel to a guest who loads into the denial',
    ).toBeFalsy();

    await this.userPage.waitAndClick(e.preFlightLeaveButton);

    await expect(this.userPage.page, 'should take the denied guest to the logout URL when they ask').toHaveURL(
      GUEST_DENIED_LOGOUT_URL,
      { timeout: ELEMENT_WAIT_TIME },
    );
  }

  async initUserPageRefusing(refused: Record<DeviceKind, boolean>, options: InitOptionsProps = {}) {
    await this.initUserPageWithPreFlight((page) => page.addInitScript(refuseDevices, refused), options);
  }

  async refusals(kind: DeviceKind) {
    return this.userPage.page.evaluate((deviceKind) => window.preFlightPermissions.refusals[deviceKind], kind);
  }

  async grantDevice(kind: DeviceKind, { notify }: { notify: boolean }) {
    await this.userPage.page.evaluate(
      ([deviceKind, notifyChange]) => window.preFlightPermissions.grant(deviceKind, notifyChange),
      [kind, notify] as [DeviceKind, boolean],
    );
  }

  async hasDevicePermissionScreen(kind: DeviceKind) {
    expect(await this.refusals(kind), `should have refused the ${kind} device to the client`).toBeGreaterThan(0);
    await this.userPage.hasElement(
      e.preFlightDevicePermission,
      `should display the device permission screen while the ${kind} device is refused`,
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.hasElement(
      kind === 'audio' ? e.preFlightInputDeviceError : e.preFlightCameraDeviceError,
      `should flag the refused ${kind} selector`,
    );
    expect(
      await this.userPage.checkElement(e.preFlightJoinButton),
      'should not offer the join while a device the user picked is refused',
    ).toBeFalsy();
  }

  async clearsDevicePermissionScreen(description: string) {
    await this.userPage.wasRemoved(e.preFlightDevicePermission, description, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(e.preFlightJoinButton, 'should bring back the join button');
  }

  // A camera toggled on that the browser refuses gets no preview, so
  // enableCamera's wait does not apply.
  async turnOnRefusedCamera() {
    await this.userPage.waitAndClick(e.preFlightCameraToggle);
    await this.hasDevicePermissionScreen('video');
  }

  async holdsJoinWhileMicrophoneDenied() {
    await this.initUserPageRefusing({ audio: true, video: false }, { joinParameter: NO_LISTEN_ONLY_JOIN_PARAMETER });
    await this.hasDevicePermissionScreen('audio');

    // Read over a rendered list, after the screen settled: a join dispatched
    // with the screen up would already have landed.
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElement(e.currentUser, "should display the moderator's own user list item");
    expect(
      await this.modPage.checkElement(e.viewerAvatar),
      'should not join the attendee while the microphone is refused',
    ).toBeFalsy();

    await this.userPage.waitAndClick(e.preFlightWithoutMicrophoneButton);
    await this.clearsDevicePermissionScreen('should clear the screen once the user goes on without the microphone');
    await this.userPage.hasElement(e.preFlightJoiningWithoutAudio, 'should say the join carries no audio');
    await this.userPage.hasElementDisabled(
      e.preFlightMuteToggle,
      'should disable the microphone toggle when there is no microphone to join with',
    );

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.joinAudio,
      'should land without audio, free to join it from the session',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.userPage.checkElement(e.audioModal),
      'should not display the audio modal after the pre-flight',
    ).toBeFalsy();
  }

  async clearsMicrophoneDenialOnGrant() {
    await this.initUserPageRefusing({ audio: true, video: false });
    await this.hasDevicePermissionScreen('audio');

    await this.grantDevice('audio', { notify: true });
    await this.clearsDevicePermissionScreen(
      'should clear the screen on a grant made in the site settings, without a retry',
    );
    await this.userPage.wasRemoved(e.preFlightInputDeviceError, 'should clear the microphone selector flag');

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.muteMicButton,
      'should join the audio with the microphone granted in the pre-flight',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async retriesDeniedCamera() {
    await this.initUserPageRefusing({ audio: false, video: true });
    await this.turnOnRefusedCamera();
    await this.userPage.hasElement(
      e.preFlightWithoutCameraButton,
      'should offer to go on without the camera when only the camera is refused',
    );

    // Still refused: the retry asks again, and the screen stays.
    const refusalsBefore = await this.refusals('video');
    await this.userPage.waitAndClick(e.preFlightRetryButton);
    await expect
      .poll(() => this.refusals('video'), { message: 'should ask the browser for the camera again on a retry' })
      .toBeGreaterThan(refusalsBefore);
    await this.userPage.hasElement(e.preFlightDevicePermission, 'should keep the screen while the camera is refused');

    await this.grantDevice('video', { notify: false });
    await this.userPage.waitAndClick(e.preFlightRetryButton);
    await this.clearsDevicePermissionScreen('should clear the screen once a retry gets the camera');
    await this.userPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the camera preview once a retry gets the camera',
      VIDEO_LOADING_WAIT_TIME,
    );

    await this.confirmJoin();
    await this.userPage.hasElement(
      e.leaveVideo,
      'should share the camera a retry got in the pre-flight',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async continuesWithoutDeniedCamera() {
    await this.initUserPageRefusing({ audio: false, video: true });
    await this.turnOnRefusedCamera();

    await this.userPage.waitAndClick(e.preFlightWithoutCameraButton);
    await this.clearsDevicePermissionScreen('should clear the screen once the user goes on without the camera');

    await this.confirmJoin();
    await this.userPage.hasElement(e.joinVideo, 'should not share the refused camera', ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.hasElement(
      e.muteMicButton,
      'should still join the audio with the microphone',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async listenOnlyPastDeniedDevices() {
    await this.initUserPageRefusing({ audio: true, video: true });
    await this.hasDevicePermissionScreen('audio');
    await this.turnOnRefusedCamera();
    expect(
      await this.userPage.checkElement(e.preFlightWithoutCameraButton),
      'should offer the microphone way past, which drops the camera too, rather than one per device',
    ).toBeFalsy();

    await this.userPage.waitAndClick(e.preFlightListenOnlyButton);
    await this.clearsDevicePermissionScreen('should clear the screen for both devices with listen only');
    // Read off the panel rather than after the join: the legacy bridge's
    // listen only is not what this covers.
    await expect(
      this.userPage.page.locator(`${e.preFlightAudioMode} input`),
      'should switch the audio mode to listen only',
    ).toHaveValue('listenOnly');
    await this.userPage.hasElementDisabled(e.preFlightMuteToggle, 'should leave no microphone to toggle');
    await this.userPage.wasRemoved(e.preFlightCameraDeviceError, 'should turn the refused camera off as well');
  }

  // Every graphql socket of the attendee goes through here: forwarded as is
  // until the test drops the connection or holds the join. The moderator's
  // page is not routed.
  async routeGraphql(page: PlaywrightPage) {
    await page.routeWebSocket('**/graphql**', (client) => {
      if (this.graphqlDown) {
        this.graphqlRefused += 1;
        client.close(DROPPED_SOCKET);
        return;
      }
      const server = client.connectToServer();
      this.graphqlSockets.push({ client, server });
      client.onMessage((message) => {
        if (this.holdUserJoin && message.toString().includes(USER_JOIN_OPERATION)) {
          this.heldUserJoins += 1;
          return;
        }
        server.send(message);
      });
      server.onMessage((message) => client.send(message));
    });
  }

  async dropGraphql() {
    this.graphqlDown = true;
    const sockets = this.graphqlSockets.splice(0);
    expect(sockets.length, 'should have a graphql socket to drop').toBeGreaterThan(0);
    await Promise.all(
      sockets.map(async ({ client, server }) => {
        await server.close();
        await client.close(DROPPED_SOCKET);
      }),
    );
    await this.userPage.hasElement(
      e.preFlightConnectionLost,
      'should display the connection screen once the socket drops',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async recoversConnectionOnItsOwn() {
    await this.initUserPageWithPreFlight((page) => this.routeGraphql(page));
    await this.dropGraphql();
    await this.userPage.hasElement(e.preFlightCameraToggle, 'should keep the setup panel under the connection screen');
    expect(
      await this.userPage.checkElement(e.preFlightJoinButton),
      'should not offer the join while the connection is down',
    ).toBeFalsy();
    await expect
      .poll(() => this.graphqlRefused, {
        message: 'should have kept the reconnection down for a while',
        timeout: GRAPHQL_RETRY_WAIT,
      })
      .toBeGreaterThan(0);

    this.graphqlDown = false;
    await this.userPage.wasRemoved(
      e.preFlightConnectionLost,
      'should clear the connection screen on its own once the socket reconnects',
      GRAPHQL_RETRY_WAIT,
    );
    await this.confirmJoin();
  }

  async reloadsOnRetryWhileDisconnected() {
    await this.initUserPageWithPreFlight((page) => this.routeGraphql(page));
    await this.dropGraphql();

    const reloaded = this.userPage.page.waitForEvent('load');
    await this.userPage.waitAndClick(e.preFlightRetryButton);
    await reloaded;

    this.graphqlDown = false;
    await this.userPage.hasElement(
      e.preFlight,
      'should load the pre-flight again once the reloaded page connects',
      GRAPHQL_RETRY_WAIT + ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    expect(
      await this.userPage.checkElement(e.preFlightConnectionLost),
      'should not carry the connection screen over the reload',
    ).toBeFalsy();
  }

  async recommitsSetupOnStalledJoinRetry() {
    await this.initUserPageWithPreFlight((page) => this.routeGraphql(page));
    this.holdUserJoin = true;
    await this.userPage.waitAndClick(e.preFlightJoinButton);
    await this.userPage.hasElement(
      e.preFlightConnectionLost,
      'should display the connection screen once the join stalls',
      JOIN_RETRY_TIMEOUT,
    );
    expect(this.heldUserJoins, 'should have held the join request back').toBeGreaterThan(0);

    // Committed unmuted by the first click: only a recommit joins muted.
    await this.userPage.waitAndClick(e.preFlightMuteToggle);
    this.holdUserJoin = false;
    await this.userPage.waitAndClick(e.preFlightRetryButton);
    await this.userPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.userPage.hasElement(
      e.unmuteMicButton,
      'should join with the microphone setting changed under the connection screen',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  // With the setting off the client keeps the previous flow.
  async disabledByDefault() {
    await this.initUserPage(this.context, NO_PRE_FLIGHT_INIT_OPTIONS);
    expect(
      await this.userPage.checkElement(e.preFlight),
      'should not display the pre-flight screen when the setting is off',
    ).toBeFalsy();
    await this.userPage.hasElement(e.layoutContainer, 'should join the meeting without any confirmation');
  }
}
