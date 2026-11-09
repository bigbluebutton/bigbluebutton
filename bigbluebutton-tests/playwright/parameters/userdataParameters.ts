import { BrowserContext, expect } from '@playwright/test';
import path from 'path';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, VIDEO_LOADING_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { openSettings } from '../options/util';
import { MultiUsers } from '../user/multiusers';

// Selectors core/elements.ts does not have.
// The client writes the layout it is in on this element, as data-layout (layoutEngine.jsx).
const layoutContainer = 'div#layout';
const animationsToggleBtn = 'input[data-test="animationsToggleBtn"]';
const avatarImage = `${e.moderatorAvatar} img`;

// en.json: app.statusNotifier.raisedHandDescOneUser, app.userList.userOptions.sorted*Name.heading
const raisedHandToast = (userName: string) => `${userName} raised hand`;
const SORTED_BY_FIRST_NAME_HEADING = 'Sorted by first name:';
const SORTED_BY_LAST_NAME_HEADING = 'Sorted by last name:';

// Never fetched from example.org: routeAvatarImage serves a core/media image for it.
export const AVATAR_URL = 'https://example.org/bbb-test-avatar.png';

// The display names sort the other way round from firstName and lastName, so the user names
// export comes out in the expected order only when it sorts by the two parameters.
export const NAMED_ATTENDEES = {
  zaraAbbott: { fullName: 'Alpha Zulu', firstName: 'Zara', lastName: 'Abbott' },
  adamZeller: { fullName: 'Zulu Alpha', firstName: 'Adam', lastName: 'Zeller' },
};

export const JOIN_PARAMETERS = {
  directLeaveButtonOff: 'userdata-bbb_direct_leave_button=false',
  hideControls: 'userdata-bbb_hide_controls=true',
  hideNotifications: 'userdata-bbb_hide_notifications=true',
  preferDarkTheme: 'userdata-bbb_prefer_dark_theme=true',
  animationsOff: 'userdata-bbb_show_animations_default=false',
  defaultLayoutCamerasOnly: 'userdata-bbb_default_layout=CAMERAS_ONLY',
  avatarURL: `avatarURL=${encodeURIComponent(AVATAR_URL)}`,
  firstAndLastName: ({ firstName, lastName }: { firstName: string; lastName: string }) =>
    `firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`,
};

export async function routeAvatarImage(context: BrowserContext) {
  await context.route(AVATAR_URL, (route) =>
    route.fulfill({ path: path.join(__dirname, '../core/media/uploadTest.png') }),
  );
}

export class UserdataParameters extends MultiUsers {
  async autoShareWebcam() {
    await this.modPage.hasElement(e.audioModal, 'should display the audio modal on join', ELEMENT_WAIT_EXTRA_LONG_TIME);
    await this.modPage.waitAndClick(`${e.audioModal} ${e.closeModal}`);
    await this.modPage.hasElement(
      e.webcamSettingsModal,
      'should open the webcam settings modal by itself once the audio modal is closed',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.webcamMirroredVideoPreview,
      'should display the webcam preview in the webcam settings modal',
      VIDEO_LOADING_WAIT_TIME,
    );
  }

  async directLeaveButtonOff() {
    await this.modPage.waitAndClick(e.optionsButton);
    // the menu offers to leave only once the client is connected, which is also when the leave
    // button would be displayed: from here on its absence is final
    await this.modPage.hasElement(e.optionsLogoutButton, 'should offer to leave the meeting from the options menu');
    await this.modPage.wasRemoved(e.leaveMeetingDropdown, 'should not display the leave button in the navigation bar');
    await this.modPage.waitAndClick(e.optionsLogoutButton);
    await this.modPage.hasText(
      e.meetingEndedModal,
      e.loggedOutMessage,
      'should log the user out from the options menu',
      ELEMENT_WAIT_LONGER_TIME,
    );
  }

  async hideControls() {
    // only the top row of the navigation bar goes: the bar stays for the talking indicator
    await this.modPage.hasElement(e.navbarBackground, 'should keep the navigation bar');
    await this.modPage.wasRemoved(e.presentationTitle, 'should not display the meeting title');
    await this.modPage.wasRemoved(e.connectionStatusBtn, 'should not display the connection status button');
    await this.modPage.wasRemoved(e.leaveMeetingDropdown, 'should not display the leave button');
    await this.modPage.wasRemoved(e.optionsButton, 'should not display the options button');
    await this.modPage.wasRemoved(e.actionsBarBackground, 'should not display the actions bar');
  }

  async hideNotifications() {
    // its participants panel shows the raised hand reached the moderator with the parameter too
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.userPage.waitAndClick(e.raiseHandBtn);
    await this.modPage2.hasText(
      e.toastContainer,
      raisedHandToast(this.userPage.username),
      'should notify the moderator without the parameter of the raised hand',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.modPage.hasElement(
      e.raisedHandsListItem,
      'should list the raised hand for the moderator who joined with the parameter',
    );
    await this.modPage.hasElementCount(
      e.toastContainer,
      0,
      'should not display any toast to the moderator who joined with the parameter',
    );
  }

  async preferDarkTheme() {
    // DarkReader adds its style elements while the dark theme is on (see options/systemTheme.ts)
    await expect
      .poll(() => this.modPage.page.evaluate(() => document.querySelectorAll('style.darkreader').length > 0), {
        message: 'should apply the dark theme on load',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(true);
    await openSettings(this.modPage);
    await this.modPage.hasElementChecked(e.darkModeToggleBtn, 'should show the dark mode setting turned on');
  }

  async animationsSettingAtStart() {
    await openSettings(this.modPage);
    await this.modPage.hasElementNotChecked(animationsToggleBtn, 'should start with the animations setting off');
    await openSettings(this.modPage2);
    await this.modPage2.hasElementChecked(
      animationsToggleBtn,
      'should start with the animations setting on for the moderator without the parameter',
    );
  }

  async avatarURL() {
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    const avatar = this.modPage.page.locator(e.currentUser).locator(avatarImage);
    await expect(avatar, 'should show the avatarURL image as the avatar in the user list').toHaveAttribute(
      'src',
      AVATAR_URL,
    );
    await expect
      .poll(() => avatar.evaluate((image: HTMLImageElement) => image.naturalWidth), {
        message: 'should load the avatar image',
      })
      .toBeGreaterThan(0);
  }

  async firstAndLastNameExport() {
    const { zaraAbbott, adamZeller } = NAMED_ATTENDEES;
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.hasElementCount(e.userListItem, 2, 'should list both attendees');
    const { content } = await this.modPage.handleDownload(this.modPage.page.locator(e.downloadUserNamesList));
    // the attendees in the order a section of the export lists them
    const listedUnder = (heading: string) =>
      (content.split(/\r?\n\r?\n/).find((section) => section.startsWith(heading)) ?? '')
        .split(/\r?\n/)
        .filter((name) => [zaraAbbott.fullName, adamZeller.fullName].includes(name));

    expect(listedUnder(SORTED_BY_FIRST_NAME_HEADING), 'should sort the first name list by firstName').toEqual([
      adamZeller.fullName,
      zaraAbbott.fullName,
    ]);
    expect(listedUnder(SORTED_BY_LAST_NAME_HEADING), 'should sort the last name list by lastName').toEqual([
      zaraAbbott.fullName,
      adamZeller.fullName,
    ]);
  }

  async defaultLayoutCamerasOnly() {
    await expect(
      this.modPage.page.locator(layoutContainer),
      'should start the client in the cameras only layout',
    ).toHaveAttribute('data-layout', 'camerasOnly', { timeout: ELEMENT_WAIT_LONGER_TIME });
    await this.modPage.wasRemoved(e.whiteboard, 'should not display the whiteboard in the cameras only layout');
  }
}
