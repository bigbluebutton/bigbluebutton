import { expect, Locator } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides, Page } from '../core/page';

// How long a toast that must not appear is watched for after the matching toast reached another page.
const TOAST_WATCH_TIME = 2000;

// Client settings overrides that deterministically reproduce issue 25242 regardless of the
// server config: the audio-only-tiles feature on, plus the equally-paginated branch
// (partitionPrivilegedStreams: false) that used to drop audio-only tiles for non-privileged
// (attendee) streams. Both are config-only settings (no per-meeting/userdata override), so
// they are injected via `clientSettingsOverrides` in initModPage/initUserPage.
export const AUDIO_ONLY_TILE_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: {
    kurento: {
      cameraSortingModes: {
        showAudioOnlyOnFirstPage: true,
        partitionPrivilegedStreams: false,
      },
    },
  },
};

// Selects LiveKit's client-side audio state instead of BBB's. The shipped default is false
// (settings.yml), and the two are served by different talking-indicator paths, so any test
// that cares which one is in use has to pin it rather than inherit the server's setting.
export const LIVEKIT_AUDIO_STATE_OVERRIDE: ClientSettingsOverrides = {
  public: {
    media: {
      livekit: {
        audio: {
          useLiveKitAudioState: true,
        },
      },
    },
  },
};

export function emojiRainSettingsOverride(enabled: boolean): ClientSettingsOverrides {
  return { public: { app: { emojiRain: { enabled, numberOfEmojis: 5 } } } };
}

// The server expires reactions, checking every 5 seconds, so only the meeting's clientSettingsOverride
// create module can shorten public.userReaction.expire (where bbb-web allows that module)
export const REACTION_EXPIRY_CHECK_INTERVAL = 5000;
export const SHORT_REACTION_EXPIRY_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({ public: { userReaction: { expire: 3 } } }),
  ']]></module></modules>',
].join('');

// Locator for audio-only tiles (camera-less users that hold the audio floor): a webcam
// grid item rendering the connecting/avatar placeholder instead of a <video> element.
export function audioOnlyTilesLocator(testPage: Page): Locator {
  return testPage.page
    .locator(`${e.webcamItem}, ${e.webcamItemTalkingUser}`)
    .filter({ has: testPage.page.locator(e.webcamConnecting) });
}

// a row of the participants list, by the whole user name
export const userListRowOf = (userName: string) => `${e.userListItem}[aria-label="${userName}"]`;
// the private chat option of that row
export const privateChatOptionOf = (userName: string) => `${userListRowOf(userName)} ${e.startPrivateChat}`;

export async function openLockViewers(testPage: Page) {
  const isLockViewersButtonVisible = await testPage.page
    .locator(e.lockViewersButton)
    .isVisible({ timeout: ELEMENT_WAIT_TIME })
    .catch(() => false);
  if (!isLockViewersButtonVisible) {
    await testPage.waitAndClick(e.usersListSidebarButton);
  }
  await testPage.waitAndClick(e.lockViewersButton);
}

// Turn on the "Hide user list" lock and dismiss the resulting toast.
export async function applyUserListLock(testPage: Page) {
  await openLockViewers(testPage);
  await testPage.waitAndClickElement(e.lockUserList);
  await testPage.waitAndClick(e.applyLockSettings);
  // the toast confirms the lock and renders after a short delay: closing the
  // toasts before it shows up leaves it on screen for the next assertions
  await testPage.hasText(e.smallToastMsg, 'User list is now hidden for viewers', 'should confirm the user list lock');
  await testPage.closeAllToastNotifications();
}

// Keep the text of every toast the page shows from now on, so that a toast that comes and goes
// while the test is still busy (a slow join, for example) can be checked afterwards.
export async function recordToasts(testPage: Page) {
  await testPage.page.evaluate((selector) => {
    const recorded: string[] = [];
    (window as unknown as { recordedToasts: string[] }).recordedToasts = recorded;
    new MutationObserver(() => {
      document.querySelectorAll(selector).forEach((toast) => {
        const text = toast.textContent ?? '';
        if (text && !recorded.includes(text)) recorded.push(text);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }, e.smallToastMsg);
}

async function wasToastRecorded(testPage: Page, text: string): Promise<boolean> {
  const recorded = await testPage.page.evaluate(
    () => (window as unknown as { recordedToasts?: string[] }).recordedToasts ?? [],
  );
  return recorded.some((toast) => toast.includes(text));
}

export async function hasRecordedToast(
  testPage: Page,
  text: string,
  description: string,
  timeout: number = ELEMENT_WAIT_TIME,
) {
  await expect.poll(() => wasToastRecorded(testPage, text), { message: description, timeout }).toBe(true);
}

export async function hasNoRecordedToast(testPage: Page, text: string, description: string) {
  const watchUntil = Date.now() + TOAST_WATCH_TIME;
  while (Date.now() < watchUntil) {
    expect(await wasToastRecorded(testPage, text), description).toBe(false);
    await testPage.page.waitForTimeout(250);
  }
}

// The talking indicator of one user, while that user is talking.
export function isTalkingLocator(testPage: Page, userName: string): Locator {
  return testPage.page.locator(e.isTalking).locator(`:text-is("${userName}")`);
}

// The talking indicator of one user in either state: talking, or shown a moment after.
export function talkingIndicatorLocator(testPage: Page, userName: string): Locator {
  return testPage.page.locator(`${e.isTalking}, ${e.wasTalking}`).filter({ hasText: userName });
}

// The away clock on one user's user list avatar.
export function awayIndicatorLocator(testPage: Page, userName: string): Locator {
  return testPage.page.locator(e.userListItem, { hasText: userName }).locator(e.awayIndicator);
}

// The names on the participant rows of the user list, the current user's row included.
export async function userListRowNames(testPage: Page): Promise<string[]> {
  return testPage.page
    .locator(`${e.userListItem}, ${e.currentUser}`)
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('aria-label') ?? ''));
}

// The title of the raised hands section, which carries the number of hands listed.
export function raisedHandsTitle(testPage: Page): Locator {
  return testPage.page.locator(e.userListPanel).getByText(/^Raised Hands \(\d+\)$/);
}

// Sets the user away through the status selector of the profile panel, then closes the panel.
export async function setAway(testPage: Page) {
  await testPage.waitAndClick(e.profileSidebarButton);
  await testPage.waitAndClick(e.userStatusSelector);
  await testPage.waitAndClick(e.awayStatusOption);
  await testPage.hasText(e.userStatusSelector, 'Away', 'should show the away status in the profile panel');
  await testPage.waitAndClick(e.profileSidebarButton);
}

// The microphone state a viewer is shown for another user on the user list.
export async function hasUserListMicState(
  testPage: Page,
  userName: string,
  state: 'unmuted' | 'muted',
  description: string,
  timeout: number = ELEMENT_WAIT_TIME,
) {
  const audioState = testPage.page
    .locator(e.userListItem, { hasText: userName })
    .locator(state === 'unmuted' ? e.audioStateUnmuted : e.audioStateMuted);
  await expect(audioState, description).toBeVisible({ timeout });
}

export async function setGuestPolicyOption(testPage: Page, option: string) {
  await openLockViewers(testPage);
  await testPage.waitAndClick(e.guestPolicyTab);
  await testPage.waitAndClick(e.guestPolicySelector);
  await testPage.waitAndClick(option);
  await testPage.waitAndClick(e.applyLockSettings);
}

export async function setPresentationPermission(testPage: Page, option: string) {
  await openLockViewers(testPage);
  await testPage.waitAndClick(e.presentationPermissionsTab);
  await testPage.waitAndClick(e.presentationPolicySelector);
  await testPage.waitAndClick(option);
  await testPage.waitAndClick(e.applyLockSettings);
}

export async function checkAvatarIcon(testPage: Page, checkModIcon = true) {
  await testPage.hasElement(
    `${e.currentUser} ${checkModIcon ? e.moderatorAvatar : e.viewerAvatar}`,
    'should display correct avatar',
  );
}

export async function checkIsPresenter(testPage: Page) {
  // 4.0 no longer emits the data-test-presenter avatar attribute to the DOM. The
  // current user's role is shown in the user-list item's "userNameSubs" sublabel
  // (e.g. "Presenter | Moderator"), so detect the presenter role from that text.
  return testPage.page.evaluate(
    ([currentUserSelector, userNameSubsSelector]) => {
      const subs = document.querySelector(`${currentUserSelector} ${userNameSubsSelector}`);
      return !!subs && (subs.textContent ?? '').includes('Presenter');
    },
    [e.currentUser, e.userNameSubs],
  );
}

export async function checkMutedUser(testPage: Page) {
  await testPage.wasRemoved(e.muteMicButton, 'should not display mute mic button when user is muted');
  await testPage.hasElement(e.unmuteMicButton, 'should display unmute mic button when user is muted');
}

export async function drawArrow(testPage: Page) {
  const modWbLocator = testPage.page.locator(e.whiteboard);
  const wbBox = await modWbLocator.boundingBox();

  await testPage.waitAndClick(e.wbArrowShape);
  if (!wbBox) throw new Error('whiteboard boundingBox is null');
  await testPage.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
  await testPage.page.mouse.down();
  await testPage.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
  await testPage.page.mouse.up();
}

export async function timeInSeconds(locator: Locator) {
  const text = await locator.innerText();
  const [minutes, seconds] = text.split(':').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  return totalSeconds;
}
