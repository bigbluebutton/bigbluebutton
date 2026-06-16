import { expect } from '@playwright/test';

import { CI, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import * as utilScreenShare from '../screenshare/util';
import { MultiUsers } from '../user/multiusers';
import { getLocaleValues, openAboutModal, openSettings } from './util';

export class Options extends MultiUsers {
  async openedAboutModal() {
    await openAboutModal(this.modPage);
    await this.modPage.hasText(e.simpleModal, 'Copyright: ', 'should display the copyright text');
    await this.modPage.hasText(e.simpleModal, 'Client build: ', 'should display the client build text');
    await this.modPage.hasText(e.simpleModal, 'BigBlueButton version: ', 'should display the BBB version text');
    await this.modPage.hasText(e.simpleModal, 'Keyboard shortcuts', 'should display the shortcuts text');
    await this.modPage.hasElement(e.helpLinkButton, 'should display the help link button');
    await this.modPage.hasElement(e.closeModal, 'should display the close modal button for the about modal');
    await this.modPage.waitAndClick(e.closeModal);
  }

  async openHelp() {
    if (!this.modPage.context) throw new Error('Moderator page context is not initialized');

    await openAboutModal(this.modPage);
    const newPage = await this.modPage.handleNewTab(e.helpLinkButton, this.modPage.context);
    await expect(newPage, 'should the help page to display the title Tutorials').toHaveTitle(/Tutorials/);
    await newPage.close();
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be open on the main meeting');
  }

  async localesTest() {
    const selectedKeysBySelector = {
      [e.chatTitle]: 'app.userList.messagesTitle',
      [e.mediaAreaButton]: 'app.actionsBar.actionsDropdown.actionsLabel',
      [e.joinAudio]: 'app.audio.joinAudio',
      [e.joinVideo]: 'app.video.joinVideo',
      [e.startScreenSharing]: 'app.actionsBar.actionsDropdown.desktopShareLabel',
      [e.minimizePresentation]: 'app.actionsBar.actionsDropdown.minimizePresentationLabel',
      [e.reactionsButton]: 'app.actionsBar.reactions.reactionsButtonLabel',
      [e.connectionStatusBtn]: 'app.connection-status.label',
      [e.optionsButton]: 'app.navBar.optionsDropdown.optionsLabel',
    };

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesBySelector = await getLocaleValues(selectedKeysBySelector, locale);

      await this.modPage.waitAndClick(e.settingsSidebarButton);
      await this.modPage.waitForSelector(e.languageSelector, 5000);
      const langDropdown = await this.modPage.page.$(e.languageSelector);
      if (!langDropdown) throw new Error('Language dropdown not found');
      await langDropdown.selectOption({ value: locale });
      await this.modPage.waitAndClick(e.saveSettingsButton);

      for (const selector of Object.keys(currentValuesBySelector)) {
        await this.modPage.hasText(
          selector,
          currentValuesBySelector[selector],
          'should the elements be translated into the specific language',
        );
      }
    }
  }

  async darkMode() {
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be display');
    // send chat message
    await this.modPage.fill(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should the chat message be displayed');
    // set all locators
    const [
      navigationSidebarContainerLocator,
      whiteboardOptionsButtonLocator,
      chatTitleLocator,
      chatUserMessageTextLocator,
      chatNotificationMessageItemLocator,
      settingsSidebarButtonLocator,
      joinAudioLocator,
      leaveMeetingDropdownLocator,
    ] = [
      e.navigationSidebarContainer,
      e.whiteboardOptionsButton,
      e.chatTitle,
      e.chatUserMessageText,
      e.chatNotificationMessageText,
      e.settingsSidebarButton,
      `${e.joinAudio} span[color]`,
      e.leaveMeetingDropdown,
    ].map((element) => this.modPage.page.locator(element));

    const getBackgroundColorComputed = (node: HTMLElement) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node: HTMLElement) => getComputedStyle(node).color;
    // background color elements that should be changed (light mode)
    const navigationSidebarContainerBackgroundColor =
      await navigationSidebarContainerLocator.evaluate(getBackgroundColorComputed);
    const whiteboardOptionsButtonBackground = await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed);
    const joinAudioBackgroundColor = await joinAudioLocator.evaluate(getBackgroundColorComputed);
    const leaveMeetingDropdownBackgroundColor = await leaveMeetingDropdownLocator.evaluate(getBackgroundColorComputed);
    // text colors that should be changed (light mode)
    const settingsSidebarButtonColor = await settingsSidebarButtonLocator.evaluate(getBackgroundColorComputed);
    const chatMessagesBackgroundColor = await chatNotificationMessageItemLocator.evaluate(getTextColorComputed);
    const chatTitleColor = await chatTitleLocator.evaluate(getTextColorComputed);
    const chatUserMessageTextColor = await chatUserMessageTextLocator.evaluate(getTextColorComputed);

    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.page.waitForTimeout(500); // wait for the changes to be applied
    expect
      .soft(navigationSidebarContainerBackgroundColor, 'should the user list container background color be changed')
      .not.toEqual(await navigationSidebarContainerLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(whiteboardOptionsButtonBackground, 'should the whiteboard options button background color be changed')
      .not.toEqual(await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(joinAudioBackgroundColor, 'should the join audio button background color be changed')
      .not.toEqual(await joinAudioLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(leaveMeetingDropdownBackgroundColor, 'should the minimize presentation button background color be changed')
      .not.toEqual(await leaveMeetingDropdownLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(chatMessagesBackgroundColor, 'should the chat notification message color be changed')
      .not.toEqual(await chatNotificationMessageItemLocator.evaluate(getTextColorComputed));
    expect
      .soft(settingsSidebarButtonColor, 'should the message title text color be changed')
      .not.toEqual(await settingsSidebarButtonLocator.evaluate(getTextColorComputed));
    expect
      .soft(chatTitleColor, 'should the presentation title text color be changed')
      .not.toEqual(await chatTitleLocator.evaluate(getTextColorComputed));
    expect
      .soft(chatUserMessageTextColor, 'should the chat user message text color be changed')
      .not.toEqual(await chatUserMessageTextLocator.evaluate(getTextColorComputed));

    if (!CI) {
      const modPageLocator = this.modPage.page.locator('body');
      const screenshotOptions = {
        maxDiffPixels: 1000,
      };
      await this.modPage.closeAllToastNotifications();
      await expect(modPageLocator, 'should the meeting be in dark mode').toHaveScreenshot(
        'moderator-page-dark-mode.png',
        screenshotOptions,
      );
    }
  }

  async fontSizeTest() {
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be display');
    const getFontSizeNumber = (node: HTMLElement) => Number(getComputedStyle(node).fontSize.slice(0, -2));
    const [presentationTitleLocator, messagesSidebarButtonLocator, chatTitleLocator] = [
      e.presentationTitle,
      e.messagesSidebarButton,
      e.chatTitle,
    ].map((element) => this.modPage.page.locator(element));
    const presentationTitleFontSize = await presentationTitleLocator.evaluate(getFontSizeNumber);
    const messagesSidebarButtonFontSize = await messagesSidebarButtonLocator.evaluate(getFontSizeNumber);
    const chatTitleFontSize = await chatTitleLocator.evaluate(getFontSizeNumber);

    // Increasing font size
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.page.waitForTimeout(500); // wait for the changes to be applied
    expect
      .soft(
        await presentationTitleLocator.evaluate(getFontSizeNumber),
        'should the presentation title font size be increased',
      )
      .toBeGreaterThan(presentationTitleFontSize);
    expect
      .soft(
        await messagesSidebarButtonLocator.evaluate(getFontSizeNumber),
        'should the chat button font size be increased',
      )
      .toBeGreaterThan(messagesSidebarButtonFontSize);
    expect
      .soft(await chatTitleLocator.evaluate(getFontSizeNumber), 'should the message title font size be increased')
      .toBeGreaterThan(chatTitleFontSize);
    if (!CI) {
      const modPageLocator = this.modPage.page.locator('body');
      const screenshotOptions = {
        maxDiffPixels: 1000,
      };
      await this.modPage.closeAllToastNotifications();
      await expect(modPageLocator, 'should the meeting display the font size increased').toHaveScreenshot(
        'moderator-page-font-size.png',
        screenshotOptions,
      );
    }
  }

  async autoHideWhiteboardToolbar() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar when meeting starts');
    await this.modPage.closeAllToastNotifications();

    const whiteboardLocator = this.modPage.page.locator(e.whiteboard);
    await this.modPage.page.waitForTimeout(1000); // wait for the whiteboard zoom to stabilize
    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-visible.png');

    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.wbAutoHideToggleBtn);
    await this.modPage.hasElementEnabled(
      e.wbAutoHideToggleBtn,
      'should display the auto hide whiteboard toolbar toggle enabled after clicking it',
    );

    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.modPage.waitForSelector(e.whiteboard);

    const wbToolbarLocator = this.modPage.page.locator(e.wbToolbar);
    await this.modPage.hoverElement(e.whiteboard);
    await expect(wbToolbarLocator).toHaveClass(/fade-in/);
    await this.modPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar when hover the whiteboard');

    await this.modPage.hoverElement(e.messagesSidebarButton);
    await expect(wbToolbarLocator).toHaveClass(/fade-out/);

    await this.modPage.page.waitForTimeout(1000); // wait for the whiteboard zoom to stabilize
    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-hidden.png', {
      maxDiffPixels: 1000,
    });
  }

  async enableOtherParticipantsWebcams() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await this.modPage.shareWebcam();
    await this.userPage.shareWebcam();
    await this.modPage.hasElementCount(
      'video',
      2,
      'should display 2 video elements for the moderator as both users shared webcam',
    );
    await this.userPage.hasElementCount(
      'video',
      2,
      'should display 2 video elements for the attendee as both users shared webcam',
    );

    await openSettings(this.modPage);
    await openSettings(this.userPage);
    await this.modPage.waitAndClick(e.dataSavingsTab);
    await this.userPage.waitAndClick(e.dataSavingsTab);
    await this.modPage.hasElementChecked(
      e.enableWebcamsToggleBtn,
      'should display the toggle button as ON after opening the data savings tab as default behavior',
    );
    await this.userPage.waitAndClickElement(e.enableWebcamsToggleBtn);
    await this.userPage.hasElementNotChecked(
      e.enableWebcamsToggleBtn,
      'should display the toggle button as OFF after clicking it',
    );
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.userPage.waitAndClick(e.saveSettingsButton);

    await this.userPage.hasElementCount(
      'video',
      1,
      'should display 1 video elements for the attendee as the attendee disabled other participants webcams option',
    );
    await this.userPage.hasElement(
      e.webcamMirroredVideoContainer,
      'should display the current user webcam for the attendee, as the attendee disabled other participants webcams option',
    );
    await this.userPage.hasElement(
      e.videoDropdownMenu,
      'should display the video dropdown menu as default behavior for the shared webcam',
    );
    await this.modPage.hasElementCount(
      'video',
      2,
      'should display 2 video elements for the moderator as the moderator has enable other participants webcams option ON',
    );

    await this.modPage.waitAndClick(e.leaveVideo);
    await this.modPage.hasElementCount(
      'video',
      1,
      'should display 1 video element for the moderator, as the moderator stopped sharing webcam',
    );

    await this.modPage.shareWebcam();
    await this.modPage.hasElementCount(
      'video',
      2,
      'should display 2 video elements for the moderator, as the moderator started sharing webcam again',
    );
    await this.userPage.hasElementCount(
      'video',
      1,
      'should display 1 video elements for the attendee, as the attendee disabled other participants webcams option',
    );
    await this.userPage.hasElement(
      e.webcamMirroredVideoContainer,
      'should display the current user webcam for the attendee, as the attendee disabled other participants webcams option',
    );
  }

  async keyboardNavigationOptionsDropdown() {
    await this.modPage.page.focus(e.optionsButton);
    await this.modPage.press('Enter');
    await this.modPage.waitForSelector(e.settings);

    await this.modPage.press('ArrowDown');
    await expect(
      this.modPage.page.locator(e.presenceToggle),
      'should focus the presence toggle on the first ArrowDown',
    ).toBeFocused({ timeout: ELEMENT_WAIT_TIME });
  }

  async enableOtherParticipantsDesktopSharing() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.userPage.waitForSelector(e.whiteboard);
    await utilScreenShare.startScreenshare(this.modPage);
    await this.modPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare for the moderator after starting it',
    );
    await this.userPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare for the attendee after the moderator started it',
    );

    await openSettings(this.modPage);
    await openSettings(this.userPage);
    await this.modPage.waitAndClick(e.dataSavingsTab);
    await this.userPage.waitAndClick(e.dataSavingsTab);
    await this.modPage.hasElementChecked(
      e.enableDesktopSharingToggleBtn,
      'should display the toggle button as ON, as default behavior',
    );
    await this.userPage.waitAndClickElement(e.enableDesktopSharingToggleBtn);
    await this.userPage.hasElementNotChecked(
      e.enableDesktopSharingToggleBtn,
      'should display the toggle button as OFF, after clicking it',
    );
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await this.userPage.waitAndClick(e.saveSettingsButton);

    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'should not display the screenshare for the attendee, as the attendee disabled other participants desktop sharing option',
    );
    await this.modPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare for the moderator, as the moderator has enable other participants desktop sharing option ON',
    );

    await this.modPage.waitAndClick(e.stopScreenSharing);
    await this.modPage.wasRemoved(
      e.screenShareVideo,
      'should not display the screenshare for the moderator after stopping it',
    );
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'should not display the screenshare for the attendee, as the attendee disabled other participants desktop sharing option and the moderator stopped screenshare',
    );

    await utilScreenShare.startScreenshare(this.modPage);
    await this.modPage.hasElement(
      e.screenShareVideo,
      'should display the screenshare for the moderator after starting it again',
    );
    await this.userPage.wasRemoved(
      e.screenShareVideo,
      'should not display the screenshare for the attendee, as the attendee disabled other participants desktop sharing option',
    );
  }
}
