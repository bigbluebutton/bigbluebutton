import { expect } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { getDefaultLocaleValue } from '../core/util';
import { MultiUsers } from '../user/multiusers';

// the buttons of the toolbar shown when hovering a chat message
const MESSAGE_TOOLBAR_BUTTONS = {
  reply: e.replyMessageButton,
  react: e.reactMessageButton,
  pin: e.pinMessageButton,
  edit: e.editMessageButton,
  delete: e.deleteMessageButton,
};

export type MessageToolbarButton = keyof typeof MESSAGE_TOOLBAR_BUTTONS;

// each of these values removes one button from the message toolbar
export const MESSAGE_TOOLBAR_VALUES: Record<string, MessageToolbarButton> = {
  replyChatMessage: 'reply',
  chatMessageReactions: 'react',
  editChatMessage: 'edit',
  deleteChatMessage: 'delete',
};

// the tile shown for a participant without a camera once the presentation is minimized
const GRID_TILE = `${e.webcamVideoItem}[data-video-type="grid"]`;
// the download menu names each file by its extension: the uploaded text document (txt) and the PDF converted from it
const fileDownloadOption = (fileExtension: 'txt' | 'pdf') =>
  `${e.enableOriginalPresentationDownloadBtn}:has-text("${getDefaultLocaleValue(
    'app.presentationUploader.enableOriginalPresentationDownload',
  ).replace('{fileExtension}', fileExtension)}")`;

export class DisabledFeatureValues extends MultiUsers {
  // sends a message and hovers it: its toolbar should show every button but the hidden ones
  async messageToolbarLacks(hiddenButtons: MessageToolbarButton[]) {
    const sentMessage = `${e.chatMessageItem}:has-text("${e.message}")`;
    await openPublicChat(this.modPage);
    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(sentMessage, 'should display the message sent on the public chat');
    await this.modPage.hoverElement(sentMessage);
    const shownButtons = (Object.keys(MESSAGE_TOOLBAR_BUTTONS) as MessageToolbarButton[]).filter(
      (button) => !hiddenButtons.includes(button),
    );
    for (const button of shownButtons) {
      await this.modPage.hasElement(
        `${sentMessage} ${MESSAGE_TOOLBAR_BUTTONS[button]}`,
        `should display the ${button} button on the message toolbar`,
      );
    }
    for (const button of hiddenButtons) {
      await this.modPage.wasRemoved(
        `${sentMessage} ${MESSAGE_TOOLBAR_BUTTONS[button]}`,
        `should not display the ${button} button on the message toolbar`,
      );
    }
  }

  async emojiPickerRemoved() {
    expect(
      this.modPage.settings?.emojiPickerEnabled,
      'emojiPicker.enable should be on (EMOJI_PICKER_SETTINGS_OVERRIDE)',
    ).toBe(true);
    await this.modPage.hasElement(e.sendButton, 'should display the send message button');
    await this.modPage.wasRemoved(e.emojiPickerButton, 'should not display the emoji picker button');
  }

  async emojiPickerShown() {
    expect(
      this.modPage.settings?.emojiPickerEnabled,
      'emojiPicker.enable should be on (EMOJI_PICKER_SETTINGS_OVERRIDE)',
    ).toBe(true);
    await this.modPage.hasElement(e.emojiPickerButton, 'should display the emoji picker button');
  }

  async quizTabRemoved() {
    await this.modPage.waitAndClick(e.pollSidebarButton);
    await this.modPage.hasElement(e.pollQuestionArea, 'should display the poll question area');
    await this.modPage.wasRemoved(e.quizTab, 'should not display the quiz tab on the poll panel');
  }

  async quizTabShown() {
    await this.modPage.waitAndClick(e.pollSidebarButton);
    await this.modPage.hasElement(e.quizTab, 'should display the quiz tab on the poll panel');
  }

  async raiseHandRemoved() {
    await this.modPage.hasElement(e.reactionsButton, 'should display the reactions button');
    await this.modPage.wasRemoved(e.raiseHandBtn, 'should not display the raise hand button');
  }

  async userReactionsRemoved() {
    await this.modPage.hasElement(e.raiseHandBtn, 'should display the raise hand button');
    await this.modPage.wasRemoved(e.reactionsButton, 'should not display the reactions button');
  }

  async timerRemoved() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.hasElement(e.pollSidebarButton, 'should display the poll button on the sidebar');
    await this.modPage.wasRemoved(e.timerStopwatchFeature, 'should not display the timer button on the sidebar');
  }

  async raiseHandReactionsAndTimerShown() {
    await this.modPage.hasElement(e.raiseHandBtn, 'should display the raise hand button');
    await this.modPage.hasElement(e.reactionsButton, 'should display the reactions button');
    await this.modPage.hasElement(e.timerStopwatchFeature, 'should display the timer button on the sidebar');
  }

  async sessionDataDownloadRemoved() {
    const dashboardPage = await this.modPage.handleNewTab(e.learningDashboardSidebarButton, this.context);
    await expect(dashboardPage, 'should open the learning dashboard').toHaveTitle(/Dashboard/);
    const dashboard = new Page(this.browser, dashboardPage, this.modPage.testInfo);
    // the status and the download button come from the same dashboard data
    await dashboard.hasElement(
      e.meetingStatusActiveDashboard,
      'should display the meeting as active on the learning dashboard',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await dashboard.wasRemoved(
      e.downloadSessionLearningDashboard,
      'should not display the download session data button on the learning dashboard',
    );
  }

  async originalFileDownloadRemoved() {
    await this.openTextPresentationDownloadMenu();
    await this.modPage.hasElement(fileDownloadOption('pdf'), 'should offer to download the converted PDF');
    await this.modPage.wasRemoved(fileDownloadOption('txt'), 'should not offer to download the original text document');
  }

  async convertedPdfDownloadRemoved() {
    await this.openTextPresentationDownloadMenu();
    await this.modPage.hasElement(fileDownloadOption('txt'), 'should offer to download the original text document');
    await this.modPage.wasRemoved(fileDownloadOption('pdf'), 'should not offer to download the converted PDF');
  }

  async presentationDownloadsShown() {
    await this.openTextPresentationDownloadMenu();
    await this.modPage.hasElement(fileDownloadOption('txt'), 'should offer to download the original text document');
    await this.modPage.hasElement(fileDownloadOption('pdf'), 'should offer to download the converted PDF');
  }

  async webcamGridRemoved() {
    await this.minimizePresentation();
    // with both participants known to the client, the grid would show their tiles by now
    await expect(
      this.modPage.page.locator(e.usersListSidebarButton),
      'should count both participants on the sidebar',
    ).toHaveText('2');
    await this.modPage.hasElementCount(e.webcamVideoItem, 0, 'should not display any participant tile');
  }

  async webcamGridShown() {
    await this.minimizePresentation();
    await this.modPage.hasElement(
      `${GRID_TILE}[data-user-name="${this.modPage.username}"]`,
      'should display the moderator tile',
    );
    await this.modPage.hasElement(
      `${GRID_TILE}[data-user-name="${this.userPage.username}"]`,
      'should display the attendee tile',
    );
  }

  async slidePreloadingOff() {
    expect(await this.getPreloadNextSlides(), 'should preload no next slides (public.app.preloadNextSlides)').toBe(0);
  }

  async slidePreloadingOn() {
    expect(
      await this.getPreloadNextSlides(),
      'should preload the next slides (public.app.preloadNextSlides)',
    ).toBeGreaterThan(0);
  }

  private async openTextPresentationDownloadMenu() {
    const textPresentation = `${e.presentationItem}:has-text("${e.presentationTXT}")`;
    const downloadMenuButton = `${textPresentation} ${e.presentationOptionsDownloadBtn}`;
    await this.modPage.hasElement(
      e.whiteboard,
      'should display the text document converted for the whiteboard',
      UPLOAD_PDF_WAIT_TIME,
    );
    await this.modPage.waitAndClick(e.mediaAreaButton);
    await this.modPage.waitAndClick(e.managePresentations);
    // the document is listed once converted, and its download menu is enabled once the upload is complete
    await this.modPage.hasElementEnabled(
      downloadMenuButton,
      'should enable the download menu of the text document',
      UPLOAD_PDF_WAIT_TIME,
    );
    await this.modPage.waitAndClick(downloadMenuButton);
    await this.modPage.hasElement(
      e.sendPresentationInCurrentStateBtn,
      'should offer to send the presentation with its annotations',
    );
  }

  private async minimizePresentation() {
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard', ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.minimizePresentation);
    await this.modPage.hasElement(e.restorePresentation, 'should display the restore presentation button');
  }

  private async getPreloadNextSlides(): Promise<number> {
    return this.modPage.page.evaluate(
      () =>
        (window as unknown as { meetingClientSettings: { public: { app: { preloadNextSlides: number } } } })
          .meetingClientSettings.public.app.preloadNextSlides,
    );
  }
}
