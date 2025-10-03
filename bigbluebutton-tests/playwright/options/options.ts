import { expect } from '@playwright/test';
import { openAboutModal, openSettings, getLocaleValues } from './util';
import { elements as e } from '../core/elements';
import { CI } from '../core/constants';
import { MultiUsers } from '../user/multiusers';

export class Options extends MultiUsers {
  async openedAboutModal() {
    await openAboutModal(this.modPage);
    await this.modPage.hasElement(e.closeModal, 'should display the close modal button for the about modal');
    await this.modPage.waitAndClick(e.closeModal);
  }

  async openHelp() {
    if (!this.modPage.context) throw new Error('Moderator page context is not initialized');

    await this.modPage.waitAndClick(e.optionsButton);
    const newPage = await this.modPage.handleNewTab(e.helpButton, this.modPage.context);
    await expect(newPage, 'should the help page to display the title Tutorials').toHaveTitle(/Tutorials/);
    await newPage.close();
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be open on the main meeting');
  }

  async localesTest() {
    const selectedKeysBySelector = {
      [e.messageTitle]: 'app.userList.messagesTitle',
      [e.notesTitle]: 'app.userList.notesTitle',
      [e.userListToggleBtn]: 'app.navBar.userListToggleBtnLabel',
      [e.hidePublicChat]: 'app.chat.titlePublic',
      [e.sendButton]: 'app.chat.submitLabel',
      [e.actions]: 'app.actionsBar.actionsDropdown.actionsLabel',
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

      await openSettings(this.modPage);
      await this.modPage.waitForSelector(e.languageSelector, 5000);
      const langDropdown = await this.modPage.page.$(e.languageSelector);
      if (!langDropdown) throw new Error('Language dropdown not found');
      await langDropdown.selectOption({ value: locale });
      await this.modPage.waitAndClick(e.modalConfirmButton);

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
    await this.modPage.type(e.chatBox, e.message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasElement(e.chatUserMessageText, 'should the chat message be displayed');
    // set all locators
    const [
      userListContainerLocator,
      whiteboardOptionsButtonLocator,
      messageTitleLocator,
      presentationTitleLocator,
      chatUserMessageTextLocator,
      chatNotificationMessageItemLocator,
      sendButtonLocator,
      joinAudioLocator,
      minimizePresentationLocator,
    ] = [
      e.userListContainer,
      e.whiteboardOptionsButton,
      e.messageTitle,
      e.presentationTitle,
      e.chatUserMessageText,
      e.chatNotificationMessageText,
      `${e.sendButton} span[color]`,
      `${e.joinAudio} span[color]`,
      `${e.minimizePresentation} span[color]`,
    ].map((element) => this.modPage.page.locator(element));

    const getBackgroundColorComputed = (node: HTMLElement) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node: HTMLElement) => getComputedStyle(node).color;
    // background color elements that should be changed (light mode)
    const userListContainerBackgroundColor = await userListContainerLocator.evaluate(getBackgroundColorComputed);
    const whiteboardOptionsButtonBackground = await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed);
    const sendButtonBackgroundColor = await sendButtonLocator.evaluate(getBackgroundColorComputed);
    const joinAudioBackgroundColor = await joinAudioLocator.evaluate(getBackgroundColorComputed);
    const minimizePresentationBackgroundColor = await minimizePresentationLocator.evaluate(getBackgroundColorComputed);
    // text colors that should be changed (light mode)
    const chatMessagesBackgroundColor = await chatNotificationMessageItemLocator.evaluate(getTextColorComputed);
    const messageTitleColor = await messageTitleLocator.evaluate(getTextColorComputed);
    const presentationTitleColor = await presentationTitleLocator.evaluate(getTextColorComputed);
    const chatUserMessageTextColor = await chatUserMessageTextLocator.evaluate(getTextColorComputed);

    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.page.waitForTimeout(500); // wait for the changes to be applied
    expect
      .soft(userListContainerBackgroundColor, 'should the user list container background color be changed')
      .not.toEqual(await userListContainerLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(whiteboardOptionsButtonBackground, 'should the whiteboard options button background color be changed')
      .not.toEqual(await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(sendButtonBackgroundColor, 'should the send button background color be changed')
      .not.toEqual(await sendButtonLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(joinAudioBackgroundColor, 'should the join audio button background color be changed')
      .not.toEqual(await joinAudioLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(minimizePresentationBackgroundColor, 'should the minimize presentation button background color be changed')
      .not.toEqual(await minimizePresentationLocator.evaluate(getBackgroundColorComputed));
    expect
      .soft(chatMessagesBackgroundColor, 'should the chat notification message color be changed')
      .not.toEqual(await chatNotificationMessageItemLocator.evaluate(getTextColorComputed));
    expect
      .soft(messageTitleColor, 'should the message title text color be changed')
      .not.toEqual(await messageTitleLocator.evaluate(getTextColorComputed));
    expect
      .soft(presentationTitleColor, 'should the presentation title text color be changed')
      .not.toEqual(await presentationTitleLocator.evaluate(getTextColorComputed));
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
    const [presentationTitleLocator, chatButtonLocator, messageTitleLocator] = [
      e.presentationTitle,
      e.chatButton,
      e.messageTitle,
    ].map((element) => this.modPage.page.locator(element));
    const presentationTitleFontSize = await presentationTitleLocator.evaluate(getFontSizeNumber);
    const chatButtonFontSize = await chatButtonLocator.evaluate(getFontSizeNumber);
    const messageTitleFontSize = await messageTitleLocator.evaluate(getFontSizeNumber);

    // Increasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.page.waitForTimeout(500); // wait for the changes to be applied
    expect
      .soft(
        await presentationTitleLocator.evaluate(getFontSizeNumber),
        'should the presentation title font size be increased',
      )
      .toBeGreaterThan(presentationTitleFontSize);
    expect
      .soft(await chatButtonLocator.evaluate(getFontSizeNumber), 'should the chat button font size be increased')
      .toBeGreaterThan(chatButtonFontSize);
    expect
      .soft(await messageTitleLocator.evaluate(getFontSizeNumber), 'should the message title font size be increased')
      .toBeGreaterThan(messageTitleFontSize);

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

    const whiteboardLocator = await this.modPage.page.locator(e.whiteboard);
    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-visible.png');

    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.wbAutoHideToggleBtn);
    await this.modPage.hasElementEnabled(
      e.wbAutoHideToggleBtn,
      'should display the auto hide whiteboard toolbar toggle enabled after clicking it',
    );

    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.waitForSelector(e.whiteboard);

    const wbToolbarLocator = this.modPage.page.locator(e.wbToolbar);
    await this.modPage.hoverElement(e.whiteboard);
    await expect(wbToolbarLocator).toHaveClass(/fade-in/);
    await this.modPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar when hover the whiteboard');

    await this.modPage.hoverElement(e.chatButton);
    await expect(wbToolbarLocator).toHaveClass(/fade-out/);

    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-hidden.png', {
      maxDiffPixels: 1000,
    });
  }
}
