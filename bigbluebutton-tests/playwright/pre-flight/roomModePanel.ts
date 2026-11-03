import { expect, Page as PlaywrightPage, ViewportSize } from '@playwright/test';

import { Create } from '../breakout/create';
import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  VIDEO_LOADING_WAIT_TIME,
} from '../core/constants';
import { elements as e } from '../core/elements';
import { installClientSettingsOverrides, Page } from '../core/page';
import { InitExtraPageOptionsProps } from '../user/multiusers';
import { USER_JOIN_OPERATION } from './preFlight';
import { ensureProbe, expectRoomMode, expectRoomModeStable, RoomMode } from './roomMode';
import {
  NO_LISTEN_ONLY_JOIN_PARAMETER,
  NO_PRE_FLIGHT_INIT_OPTIONS,
  NO_ROOM_MODE_PANEL_INIT_OPTIONS,
  PHONE_VIEWPORT,
  refuseDevices,
  ROOM_MODE_PANEL_INIT_OPTIONS,
  ROOM_MODE_PANEL_SETTINGS_OVERRIDE,
} from './util';

type RoomModeCard = typeof e.preFlightRoomModeClass | typeof e.preFlightRoomModeMeeting;

const ROOM_MODE_CARDS: RoomModeCard[] = [e.preFlightRoomModeClass, e.preFlightRoomModeMeeting];

const readRoomModePanelSetting = (page: PlaywrightPage) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          meetingClientSettings?: { public?: { app?: { preFlight?: { roomModes?: { enabled?: boolean } } } } };
        }
      ).meetingClientSettings?.public?.app?.preFlight?.roomModes?.enabled,
  );

// The panel only comes up once the room mode has been read, so the wait covers
// that read.
export const hasPanel = async (page: Page) => {
  await page.hasElement(
    e.preFlightRoomModePanel,
    'should display the room mode panel to a moderator entering a room with no mode',
    ELEMENT_WAIT_LONGER_TIME,
  );
};

// Asserted over a settled positive signal: the join button only replaces the
// loading state once the room mode is known, so a panel still on its way would
// already be up.
export const hasNoPanel = async (page: Page, description: string) => {
  await page.hasElement(e.preFlightJoinButton, 'should display the join button', ELEMENT_WAIT_LONGER_TIME);
  expect(await page.checkElement(e.preFlightRoomModePanel), description).toBeFalsy();
};

const expectSelected = async (page: Page, selected: RoomModeCard | null) => {
  for (const card of ROOM_MODE_CARDS) {
    await expect(
      page.page.locator(card),
      card === selected ? 'should mark the picked room mode as selected' : 'should leave the other modes unselected',
    ).toHaveAttribute('aria-checked', card === selected ? 'true' : 'false');
  }
};

export const startsRoom = async (page: Page) => {
  await page.waitAndClick(e.preFlightJoinButton);
  await page.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
  await page.wasRemoved(e.preFlight, 'should remove the pre-flight screen after starting the room');
};

// The way the moderator picks an option: open the select, then click the option.
export const pickOption = async (page: Page, selector: string, value: string) => {
  await page.waitAndClick(selector);
  await page.waitAndClick(`${e.selectMenuItem}[data-value="${value}"]`);
  await expect(page.page.locator(selector), `should pick ${value}`).toHaveAttribute('data-value', value);
};

// Whether the element itself is what a tap at its centre would hit: a notice
// drawn under a pinned bar is in the page, but nobody can see it.
const isUncovered = (page: Page, selector: string) =>
  page.page.locator(selector).evaluate((element) => {
    const box = element.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return !!hit && element.contains(hit);
  });

// A desktop width above the tablet breakpoint, wide enough for both panels.
const DESKTOP_VIEWPORT = { width: 1366, height: 900 };

// A tablet in portrait: above the phone breakpoint, but too narrow for the two
// panels side by side.
const TABLET_VIEWPORT = { width: 768, height: 1024 };

declare global {
  interface Window {
    getUserMediaCalls: number;
    preFlightSeen: boolean;
  }
}

// Init script: flags the pre-flight if it is ever attached to the page, so its
// absence holds for the whole load and not only for the moment it is read.
const watchForPreFlight = () => {
  window.preFlightSeen = false;
  const selector = '[data-test="preFlight"]';
  // Reads the added nodes rather than the document, so a pre-flight attached
  // and dropped before the callback runs is still caught.
  new MutationObserver((mutations) => {
    const attached = mutations.some(({ addedNodes }) =>
      Array.from(addedNodes).some(
        (node) => node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null),
      ),
    );
    if (attached) window.preFlightSeen = true;
  }).observe(document, { childList: true, subtree: true });
};

// Init script: counts the getUserMedia calls, the cost of a remounted setup
// panel (its camera preview and audio selectors ask again).
const countGetUserMedia = () => {
  window.getUserMediaCalls = 0;
  const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = (constraints) => {
    window.getUserMediaCalls += 1;
    return original(constraints);
  };
};

export class RoomModePanel extends RoomMode {
  // Most cases only drive the panel, so they run on any server; the ones that
  // read or write the room mode require the probe themselves.
  async initModPage(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithProbeModule(page, options);
  }

  // The moderator under test creates the meeting through the pre-flight, so the
  // room starts with no mode.
  async initModPageWithPanel(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPage(page, { ...ROOM_MODE_PANEL_INIT_OPTIONS, ...options });
    await this.modPage.hasElement(
      e.preFlight,
      'should display the pre-flight screen before joining',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
  }

  async showsPanelInUnconfiguredRoom() {
    await hasPanel(this.modPage);
    await this.modPage.hasElement(e.preFlightRoomModeClass, 'should offer the class mode');
    await this.modPage.hasElement(e.preFlightRoomModeMeeting, 'should offer the meeting mode');
    await this.modPage.hasElement(e.preFlightRoomModeEmptyState, 'should show the empty state until a mode is picked');
    await this.modPage.hasElement(e.preFlightRoomModeIllustration, 'should illustrate the empty state');
    await expectSelected(this.modPage, null);
    // Starting without a mode is allowed: the button never waits on a pick.
    await this.modPage.hasElementEnabled(e.preFlightJoinButton, 'should let the moderator start without a mode');
    expect(
      await this.modPage.checkElement(e.preFlightRoomModeCancelButton),
      'should not offer to cancel a selection before there is one',
    ).toBeFalsy();
  }

  async picksAndClearsMode() {
    await hasPanel(this.modPage);

    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectSelected(this.modPage, e.preFlightRoomModeClass);
    await this.modPage.hasElement(e.preFlightRoomModeSelected, 'should show the picked mode beside the cards');
    await this.modPage.wasRemoved(e.preFlightRoomModeEmptyState, 'should replace the empty state with the picked mode');
    await this.modPage.wasRemoved(
      e.preFlightRoomModeIllustration,
      'should drop the illustration once a mode is picked',
    );

    await this.modPage.waitAndClick(e.preFlightRoomModeMeeting);
    await expectSelected(this.modPage, e.preFlightRoomModeMeeting);

    await this.modPage.waitAndClick(e.preFlightRoomModeCancelButton);
    await expectSelected(this.modPage, null);
    // Cancel goes away with the selection: focus lands on the cards' tab stop,
    // not on the page.
    await expect(
      this.modPage.page.locator(e.preFlightRoomModeClass),
      'should move the focus to the first mode once the selection is cleared',
    ).toBeFocused();
    await this.modPage.hasElement(e.preFlightRoomModeEmptyState, 'should go back to the empty state on cancel');
    await this.modPage.wasRemoved(
      e.preFlightRoomModeCancelButton,
      'should drop the cancel button once nothing is selected',
    );
    await this.modPage.hasElement(e.preFlightRoomModePanel, 'should keep the moderator on the panel after cancelling');
  }

  async viewerNeverSeesPanel() {
    await this.initUserPage(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
    await this.userPage.hasElement(
      e.preFlight,
      'should display the pre-flight screen to the viewer',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await hasNoPanel(this.userPage, 'should never display the room mode panel to a viewer');
  }

  // On a tablet only the panel turns the screen into tabs: a viewer keeps the
  // setup beside the join, as on a desktop.
  async viewerKeepsDesktopLayoutOnTablet() {
    await this.initUserPage(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
    await this.userPage.page.setViewportSize(TABLET_VIEWPORT);
    await this.userPage.hasElement(
      e.preFlight,
      'should display the pre-flight screen to the viewer',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    // A viewer has a single panel, so no tabs either way: the layout itself is
    // what the tablet rule must leave alone.
    await expect(
      this.userPage.page.locator(e.preFlight),
      'should keep the desktop layout for a viewer on a tablet',
    ).not.toHaveAttribute('data-phone-layout');
    await expect(
      this.userPage.page.locator(e.preFlightCameraToggle),
      'should display the device setup beside the join',
    ).toBeVisible();
    await expect(
      this.userPage.page.locator(e.preFlightJoinButton),
      'should display the join button beside the device setup',
    ).toBeVisible();
  }

  async noPanelInConfiguredRoom() {
    await ensureProbe(this.modPage);
    await this.setByModerator('class');
    await expectRoomMode(this.modPage, 'class', 'should store the room mode set by the first moderator');

    await this.initModPage2(this.context, ROOM_MODE_PANEL_INIT_OPTIONS);
    await this.modPage2.hasElement(
      e.preFlight,
      'should display the pre-flight screen to the second moderator',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    expect(
      await readRoomModePanelSetting(this.modPage2.page),
      'should have the room mode panel turned on for the second moderator',
    ).toBe(true);
    await hasNoPanel(this.modPage2, 'should not display the room mode panel in a room that already has a mode');
  }

  async startsWithoutMode() {
    await ensureProbe(this.modPage);
    await hasPanel(this.modPage);
    await startsRoom(this.modPage);
    // Nothing is expected to write the mode, so its absence is sampled across a
    // window rather than read once.
    await expectRoomModeStable(this.modPage, '', 'should leave the room unconfigured when started without a mode');
  }

  async panelsBecomeTabsOnPhone(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.panelsBecomeTabs(page, PHONE_VIEWPORT, 'a phone', options);
  }

  // A tablet has no room for the panels side by side: with the panel up, the
  // pre-flight lays out as on a phone.
  async panelsBecomeTabsOnTablet(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.panelsBecomeTabs(page, TABLET_VIEWPORT, 'a tablet', options);
  }

  private async panelsBecomeTabs(
    page: PlaywrightPage,
    viewport: ViewportSize,
    device: 'a phone' | 'a tablet',
    options: InitExtraPageOptionsProps,
  ) {
    await page.setViewportSize(viewport);
    await this.initModPageWithPanel(page, options);

    await this.modPage.hasElement(e.preFlightDevicesTab, `should display the devices tab on ${device}`);
    await this.modPage.hasElement(e.preFlightRoomModeTab, `should display the room mode tab on ${device}`);

    await this.modPage.waitAndClick(e.preFlightRoomModeTab);
    await expect(
      this.modPage.page.locator(e.preFlightRoomModeClass),
      'should display the mode cards in the room mode tab',
    ).toBeVisible();
    await expect(
      this.modPage.page.locator(e.preFlightCameraToggle),
      'should hide the device setup while the room mode tab is open',
    ).toBeHidden();
    await expect(
      this.modPage.page.locator(e.preFlightJoinButton),
      'should keep the start button reachable from the room mode tab',
    ).toBeVisible();

    await this.modPage.waitAndClick(e.preFlightDevicesTab);
    await expect(
      this.modPage.page.locator(e.preFlightCameraToggle),
      'should display the device setup in the devices tab',
    ).toBeVisible();
    await expect(
      this.modPage.page.locator(e.preFlightRoomModeClass),
      'should hide the mode cards while the devices tab is open',
    ).toBeHidden();
    await expect(
      this.modPage.page.locator(e.preFlightJoinButton),
      'should keep the start button reachable from the devices tab',
    ).toBeVisible();
  }

  async noPanelWhenDisabled(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await this.initModPageWithPanel(page, { ...NO_ROOM_MODE_PANEL_INIT_OPTIONS, ...options });
    await hasNoPanel(this.modPage, 'should not display the room mode panel with its setting off');
  }

  // The pick lives in the pre-flight's state, so the permission screen taking the
  // panel's place does not lose it.
  async keepsModeUnderDevicePermissionScreen(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.addInitScript(refuseDevices, { audio: false, video: true });
    await this.initModPageWithPanel(page, options);
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await expectSelected(this.modPage, e.preFlightRoomModeClass);

    await this.modPage.waitAndClick(e.preFlightCameraToggle);
    await this.modPage.hasElement(
      e.preFlightDevicePermission,
      'should display the device permission screen for the refused camera',
      ELEMENT_WAIT_LONGER_TIME,
    );
    expect(
      await this.modPage.page.evaluate(() => window.preFlightPermissions.refusals.video),
      'should have refused the camera to the client',
    ).toBeGreaterThan(0);
    expect(
      await this.modPage.checkElement(e.preFlightRoomModePanel),
      'should let the device permission screen take the room mode panel place',
    ).toBeFalsy();

    await this.modPage.waitAndClick(e.preFlightWithoutCameraButton);
    await this.modPage.wasRemoved(
      e.preFlightDevicePermission,
      'should clear the screen once the moderator goes on without the camera',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await hasPanel(this.modPage);
    await expectSelected(this.modPage, e.preFlightRoomModeClass);
  }

  // Breakouts carry no pre-flight at all. The overrides go on the whole context,
  // the only way they reach the tab the client opens for the room; the attendee
  // gets a context of its own, without them.
  async noPanelInBreakout(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.context().addInitScript(installClientSettingsOverrides, ROOM_MODE_PANEL_SETTINGS_OVERRIDE);
    await page.context().addInitScript(watchForPreFlight);
    await this.initModPageWithPanel(page, { ...options, clientSettingsOverrides: undefined });
    await hasPanel(this.modPage);
    expect(
      await page.evaluate(() => window.preFlightSeen),
      'should flag the pre-flight where it does show (positive control)',
    ).toBe(true);
    await startsRoom(this.modPage);

    await this.initUserPage(await this.browser.newContext(), NO_PRE_FLIGHT_INIT_OPTIONS);

    const breakout = new Create(this.browser, this.context);
    breakout.modPage = this.modPage;
    breakout.userPage = this.userPage;
    const breakoutTab = await breakout.joinAssignedBreakoutAsModerator();

    expect(
      await readRoomModePanelSetting(breakoutTab),
      'should carry the room mode panel setting into the breakout room tab',
    ).toBe(true);
    expect(
      await breakoutTab.evaluate(() => window.preFlightSeen),
      'should never display the pre-flight, nor its room mode panel, in a breakout room',
    ).toBe(false);
  }

  // The cards are one radio group: the arrows move between the modes and wrap
  // around.
  async movesBetweenModesWithArrows() {
    await hasPanel(this.modPage);
    await this.modPage.page.locator(e.preFlightRoomModeClass).focus();

    await this.modPage.page.keyboard.press('ArrowDown');
    await expectSelected(this.modPage, e.preFlightRoomModeMeeting);
    await expect(
      this.modPage.page.locator(e.preFlightRoomModeMeeting),
      'should move the focus with the selection',
    ).toBeFocused();

    await this.modPage.page.keyboard.press('ArrowDown');
    await expectSelected(this.modPage, e.preFlightRoomModeClass);
    await expect(
      this.modPage.page.locator(e.preFlightRoomModeClass),
      'should wrap around to the first mode',
    ).toBeFocused();

    await this.modPage.page.keyboard.press('ArrowUp');
    await expectSelected(this.modPage, e.preFlightRoomModeMeeting);
  }

  // Crossing the tabs' breakpoints, as a rotation can, only turns the tabs on or
  // off: the setup panel stays mounted, so its camera preview is the same
  // element and nothing asks for the devices again.
  async keepsSetupAcrossTabsBreakpoints(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.addInitScript(countGetUserMedia);
    await this.initModPageWithPanel(page, options);
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightCameraToggle);
    await this.modPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the camera preview once the camera is toggled on',
      VIDEO_LOADING_WAIT_TIME,
    );
    const preview = this.modPage.page.locator(e.webcamMirroredVideoPreview);
    await preview.evaluate((element) => element.setAttribute('data-test-original', 'true'));
    // The audio selectors may still ask after the preview is up, so the count
    // is taken once the setup has settled.
    await page.waitForTimeout(ELEMENT_WAIT_TIME);
    const callsBefore = await page.evaluate(() => window.getUserMediaCalls);

    await page.setViewportSize(PHONE_VIEWPORT);
    await this.modPage.hasElement(e.preFlightRoomModeTab, 'should turn the panels into tabs on a phone');
    await page.setViewportSize(TABLET_VIEWPORT);
    await this.modPage.hasElement(e.preFlightRoomModeTab, 'should keep the tabs on a tablet');
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await this.modPage.wasRemoved(e.preFlightRoomModeTab, 'should drop the tabs above the tablet breakpoint');

    await expect(preview, 'should keep the same camera preview across the breakpoint').toHaveAttribute(
      'data-test-original',
      'true',
    );
    // Nothing is expected to happen, so the count is read after a quiet spell
    // long enough for a remounted preview to have asked again.
    await page.waitForTimeout(ELEMENT_WAIT_TIME);
    expect(
      await page.evaluate(() => window.getUserMediaCalls),
      'should not ask for the devices again after crossing the breakpoint',
    ).toBe(callsBefore);
  }

  // Once Start room is pressed the pick is final. The join is held back, so the
  // joining state lasts long enough to check.
  async locksCardsWhileJoining(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    let heldJoins = 0;
    await page.routeWebSocket('**/graphql**', (client) => {
      const server = client.connectToServer();
      client.onMessage((message) => {
        if (message.toString().includes(USER_JOIN_OPERATION)) {
          heldJoins += 1;
          return;
        }
        server.send(message);
      });
      server.onMessage((message) => client.send(message));
    });
    await this.initModPageWithPanel(page, options);
    await hasPanel(this.modPage);
    await this.modPage.waitAndClick(e.preFlightRoomModeClass);
    await this.modPage.waitAndClick(e.preFlightJoinButton);

    // The held join is never released: the page closes with the test.
    await expect
      .poll(() => heldJoins, {
        message: 'should have held the join back',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
    for (const card of ROOM_MODE_CARDS) {
      await this.modPage.hasElementDisabled(card, 'should stop taking picks once the room is starting');
    }
    // The cards stay focusable, so the lock is the handlers': neither a click
    // (forced past the disabled state) nor the arrow keys change the pick.
    await this.modPage.page.locator(e.preFlightRoomModeMeeting).click({ force: true });
    await this.modPage.page.keyboard.press('ArrowDown');
    await expectSelected(this.modPage, e.preFlightRoomModeClass);

    // The summary of the pick follows the same lock: a forced click leaves the
    // switch as the class preset set it, and the select does not open.
    const joinMuted = this.modPage.page.locator(e.preFlightRoomModeJoinMuted);
    await expect(joinMuted, 'should lock the summary once the room is starting').toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await joinMuted.click({ force: true });
    await expect(joinMuted, 'should keep the summary as it was while the room is starting').toBeChecked();
    await this.modPage.page.locator(e.preFlightRoomModePresenterPolicy).click({ force: true });
    await expect(
      this.modPage.page.locator(e.selectMenuItem),
      'should not open a select once the room is starting',
    ).toHaveCount(0);
  }

  // A phone pins the actions to the bottom of the screen, so the join's notices
  // belong to the header there.
  async showsJoinNoticesOnPhone(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.setViewportSize(PHONE_VIEWPORT);
    await page.addInitScript(refuseDevices, { audio: true, video: false });
    await this.initModPageWithPanel(page, { joinParameter: NO_LISTEN_ONLY_JOIN_PARAMETER, ...options });

    await this.modPage.hasElement(
      e.preFlightDevicePermission,
      'should display the device permission screen for the refused microphone',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.preFlightWithoutMicrophoneButton);
    // The case only holds with the panel up: without it the notices are in the
    // header anyway.
    await this.modPage.hasElement(e.preFlightRoomModeTab, 'should display the room mode panel as a tab on a phone');
    await this.modPage.hasElement(e.preFlightJoiningWithoutAudio, 'should say the join carries no audio');
    await this.modPage.page.locator(e.preFlightJoiningWithoutAudio).scrollIntoViewIfNeeded();
    expect(
      await isUncovered(this.modPage, e.preFlightJoiningWithoutAudio),
      'should keep the notice clear of the pinned start button',
    ).toBe(true);
    expect(await this.modPage.getSelectorCount(e.preFlightJoiningWithoutAudio), 'should show the notice once').toBe(1);
  }

  // On a desktop the panel takes the join step's place, so the join's notices
  // move to the panel's footer, beside the start button.
  async showsJoinNoticesInPanelFooter(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.addInitScript(refuseDevices, { audio: true, video: false });
    await this.initModPageWithPanel(page, { joinParameter: NO_LISTEN_ONLY_JOIN_PARAMETER, ...options });

    await this.modPage.hasElement(
      e.preFlightDevicePermission,
      'should display the device permission screen for the refused microphone',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.waitAndClick(e.preFlightWithoutMicrophoneButton);
    await hasPanel(this.modPage);
    await this.modPage.hasElement(e.preFlightJoiningWithoutAudio, 'should say the join carries no audio');
    expect(
      await isUncovered(this.modPage, e.preFlightJoiningWithoutAudio),
      'should show the notice where it can be seen',
    ).toBe(true);
    expect(await this.modPage.getSelectorCount(e.preFlightJoiningWithoutAudio), 'should show the notice once').toBe(1);
  }

  // Bots never get the pre-flight, so they never get the panel either.
  async noPanelForBot(page: PlaywrightPage, options: InitExtraPageOptionsProps = {}) {
    await page.addInitScript(watchForPreFlight);
    await this.initModPage(page, { ...ROOM_MODE_PANEL_INIT_OPTIONS, joinParameter: 'bot=true', ...options });
    await this.modPage.waitForSelector(e.layoutContainer, ELEMENT_WAIT_EXTRA_LONG_TIME);
    expect(await readRoomModePanelSetting(page), 'should have the room mode panel turned on for the bot').toBe(true);
    expect(
      await page.evaluate(() => window.preFlightSeen),
      'should send a bot moderator straight into the meeting',
    ).toBe(false);
  }
}
