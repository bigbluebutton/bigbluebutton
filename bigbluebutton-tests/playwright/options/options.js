const { expect } = require('@playwright/test');
const { openAboutModal, getLocaleValues } = require('./util');
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
    await this.modPage.hasText(e.simpleModal, 'Copyright: ', 'should display the copyright text');
    await this.modPage.hasText(e.simpleModal, 'Client build: ', 'should display the client build text');
    await this.modPage.hasText(e.simpleModal, 'BigBlueButton version: ', 'should display the BBB version text');
    await this.modPage.hasText(e.simpleModal, 'Keyboard shortcuts', 'should display the shortcuts text');
    await this.modPage.hasElement(e.shortcutsButton, 'should display the shortcuts button');
    await this.modPage.hasElement(e.helpLinkButton, 'should display the help link button');
    await this.modPage.hasElement(e.closeModal, 'should display the close modal button for the about modal');
    await this.modPage.waitAndClick(e.closeModal);
  }

  async openHelp() {
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
    }

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesBySelector = getLocaleValues(selectedKeysBySelector, locale);

      await this.modPage.waitAndClick(e.settingsSidebarButton);
      await this.modPage.waitForSelector(e.languageSelector);
      const langDropdown = await this.modPage.page.$(e.languageSelector);
      await langDropdown.selectOption({ value: locale });
      await this.modPage.waitAndClick(e.saveSettingsButton);

      for (const selector in currentValuesBySelector) {
        await this.modPage.hasText(selector, currentValuesBySelector[selector], 'should the elements be translated into the specific language');
      }
    }
  }

  async darkMode() {
    await this.modPage.waitForSelector(e.whiteboard);
    // send chat message
    await this.modPage.type(e.chatBox, e.message);
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
    ].map(e => this.modPage.getLocator(e));

    const getBackgroundColorComputed = (node) => getComputedStyle(node).backgroundColor;
    const getTextColorComputed = (node) => getComputedStyle(node).color;
    // background color elements that should be changed (light mode)
    const navigationSidebarContainerBackgroundColor = await navigationSidebarContainerLocator.evaluate(getBackgroundColorComputed);
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
    await sleep(500); // wait for the changes to be applied
    //! update assertion descriptions
    expect.soft(navigationSidebarContainerBackgroundColor).not.toEqual(await navigationSidebarContainerLocator.evaluate(getBackgroundColorComputed), 'should the user list container background color be changed');
    expect.soft(whiteboardOptionsButtonBackground).not.toEqual(await whiteboardOptionsButtonLocator.evaluate(getBackgroundColorComputed), 'should the whiteboard options button background color be changed');
    expect.soft(joinAudioBackgroundColor).not.toEqual(await joinAudioLocator.evaluate(getBackgroundColorComputed), 'should the join audio button background color be changed');
    expect.soft(leaveMeetingDropdownBackgroundColor).not.toEqual(await leaveMeetingDropdownLocator.evaluate(getBackgroundColorComputed), 'should the minimize presentation button background color be changed');
    expect.soft(settingsSidebarButtonColor).not.toEqual(await settingsSidebarButtonLocator.evaluate(getTextColorComputed), 'should the send button background color be changed');
    expect.soft(chatMessagesBackgroundColor).not.toEqual(await chatNotificationMessageItemLocator.evaluate(getTextColorComputed), 'should the chat notification message color be changed');
    expect.soft(chatTitleColor).not.toEqual(await chatTitleLocator.evaluate(getTextColorComputed), 'should the message title text color be changed');
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
      messagesSidebarButtonLocator,
      chatTitleLocator,
    ] = [
      e.presentationTitle,
      e.messagesSidebarButton,
      e.chatTitle,
    ].map(e => this.modPage.getLocator(e));
    const presentationTitleFontSize = await presentationTitleLocator.evaluate(getFontSizeNumber);
    const messagesSidebarButtonFontSize = await messagesSidebarButtonLocator.evaluate(getFontSizeNumber);
    const chatTitleFontSize = await chatTitleLocator.evaluate(getFontSizeNumber);

    // increasing font size
    await this.modPage.waitAndClick(e.settingsSidebarButton);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.saveSettingsButton);
    await sleep(500); // wait for the changes to be applied
    expect.soft(await presentationTitleLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(presentationTitleFontSize, 'should the presentation title font size be increased');
    expect.soft(await messagesSidebarButtonLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(messagesSidebarButtonFontSize, 'should the chat button font size be increased');
    expect.soft(await chatTitleLocator.evaluate(getFontSizeNumber)).toBeGreaterThan(chatTitleFontSize, 'should the message title font size be increased');

    if (!CI) {
      const modPageLocator = this.modPage.getLocator('body');
      const screenshotOptions = {
        maxDiffPixels: 1000,
      };
      await this.modPage.closeAllToastNotifications();
      await expect(modPageLocator, 'should the meeting display the font size increased').toHaveScreenshot('moderator-page-font-size.png', screenshotOptions);
    }
  }
}

exports.Options = Options;
