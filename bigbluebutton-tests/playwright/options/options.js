const { expect } = require('@playwright/test');
const { openAboutModal, openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');
const { CI } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { sleep } = require('../core/helpers');


class Options extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async openedAboutModal() {
    await openAboutModal(this.modPage);
    await this.modPage.hasElement(e.closeModal, 'should display the close modal button for the about modal');
    await this.modPage.waitAndClick(e.closeModal);
  }

  async openHelp() {
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
    }

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesBySelector = getLocaleValues(selectedKeysBySelector, locale);

      await openSettings(this.modPage);
      await this.modPage.waitForSelector(e.languageSelector, 5000);
      const langDropdown = await this.modPage.page.$(e.languageSelector);
      await langDropdown.selectOption({ value: locale });
      await this.modPage.waitAndClick(e.modalConfirmButton);

      for (const selector in currentValuesBySelector) {
        await this.modPage.hasText(selector, currentValuesBySelector[selector], 'should the elements be translated into the specific language');
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
    ].map(e => this.modPage.getLocator(e));

    const getBackgroundColorComputed = (node) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node) => getComputedStyle(node).color;
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
    await sleep(500); // wait for the changes to be applied
    expect.soft(userListContainerBackgroundColor).not.toEqual(await userListContainerLocator.evaluate(getBackgroundColorComputed), 'should the user list container background color be changed');
    expect.soft(whiteboardOptionsButtonBackground).not.toEqual(await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed), 'should the whiteboard options button background color be changed');
    expect.soft(sendButtonBackgroundColor).not.toEqual(await sendButtonLocator.evaluate(getBackgroundColorComputed), 'should the send button background color be changed');
    expect.soft(joinAudioBackgroundColor).not.toEqual(await joinAudioLocator.evaluate(getBackgroundColorComputed), 'should the join audio button background color be changed');
    expect.soft(minimizePresentationBackgroundColor).not.toEqual(await minimizePresentationLocator.evaluate(getBackgroundColorComputed), 'should the minimize presentation button background color be changed');
    expect.soft(chatMessagesBackgroundColor).not.toEqual(await chatNotificationMessageItemLocator.evaluate(getTextColorComputed), 'should the chat notification message color be changed');
    expect.soft(messageTitleColor).not.toEqual(await messageTitleLocator.evaluate(getTextColorComputed), 'should the message title text color be changed');
    expect.soft(presentationTitleColor).not.toEqual(await presentationTitleLocator.evaluate(getTextColorComputed), 'should the presentation title text color be changed');
    expect.soft(chatUserMessageTextColor).not.toEqual(await chatUserMessageTextLocator.evaluate(getTextColorComputed), 'should the chat user message text color be changed');

    if (!CI) {
      const modPageLocator = this.modPage.getLocator('body');
      const screenshotOptions = {
        maxDiffPixels: 1000,
      };
      await this.modPage.closeAllToastNotifications();
      await expect(modPageLocator, 'should the meeting be in dark mode').toHaveScreenshot('moderator-page-dark-mode.png', screenshotOptions);
    }
  }

  async fontSizeTest() {
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be display');
    const getFontSizeNumber = (node) => Number(getComputedStyle(node).fontSize.slice(0, -2));
    const [
      presentationTitleLocator,
      chatButtonLocator,
      messageTitleLocator,
    ] = [
      e.presentationTitle,
      e.chatButton,
      e.messageTitle,
    ].map(e => this.modPage.getLocator(e));
    const presentationTitleFontSize = await presentationTitleLocator.evaluate(getFontSizeNumber);
    const chatButtonFontSize = await chatButtonLocator.evaluate(getFontSizeNumber);
    const messageTitleFontSize = await messageTitleLocator.evaluate(getFontSizeNumber);

    // Increasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await sleep(500); // wait for the changes to be applied
    expect.soft(await presentationTitleLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(presentationTitleFontSize, 'should the presentation title font size be increased');
    expect.soft(await chatButtonLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(chatButtonFontSize, 'should the chat button font size be increased');
    expect.soft(await messageTitleLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(messageTitleFontSize, 'should the message title font size be increased');

    if (!CI) {
      const modPageLocator = this.modPage.getLocator('body');
      const screenshotOptions = {
        maxDiffPixels: 1000,
      };
      await this.modPage.closeAllToastNotifications();
      await expect(modPageLocator, 'should the meeting display the font size increased').toHaveScreenshot('moderator-page-font-size.png', screenshotOptions);
    }
  }

  async autoHideWhiteboardToolbar() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar when meeting starts');
    await this.modPage.closeAllToastNotifications();

    const whiteboardLocator = await this.modPage.getLocator(e.whiteboard);
    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-visible.png');

    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.wbAutoHideToggleBtn);
    await this.modPage.hasElementEnabled(e.wbAutoHideToggleBtn, 'should display the auto hide whiteboard toolbar toggle enabled after clicking it');

    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.waitForSelector(e.whiteboard);

    const wbToolbarLocator = this.modPage.getLocator(e.wbToolbar);
    await this.modPage.hoverElement(e.whiteboard);
    await expect(wbToolbarLocator).toHaveClass(/fade-in/);
    await this.modPage.hasElement(e.wbToolbar, 'should display the whiteboard toolbar when hover the whiteboard');

    await this.modPage.hoverElement(e.chatButton)
    await expect(wbToolbarLocator).toHaveClass(/fade-out/);
    
    await expect(whiteboardLocator).toHaveScreenshot('whiteboard-with-toolbar-hidden.png', {
      maxDiffPixels: 1000,
    });
  }
}

exports.Options = Options;
