const { expect } = require('@playwright/test');
const { openAboutModal, openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');


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
      [e.optionsButton]: 'app.navBar.settingsDropdown.optionsLabel',
    }

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesBySelector = await getLocaleValues(selectedKeysBySelector, locale);

      await openSettings(this.modPage);
      await this.modPage.waitForSelector(e.languageSelector);
      const langDropdown = await this.modPage.page.$(e.languageSelector);
      await langDropdown.selectOption({ value: locale });
      await this.modPage.waitAndClick(e.modalConfirmButton);

      for (const selector in currentValuesBySelector) {
        await this.modPage.hasText(selector, currentValuesBySelector[selector], 'should the elements to be translated to the specific language');
      }
    }
  }

  async darkMode() {
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be display');
    await this.modPage.waitAndClick(e.closePopup);
    await openSettings(this.modPage);

    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    const modPageLocator = this.modPage.getLocator('body');
    await this.modPage.setHeightWidthViewPortSize();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.closeAllToastNotifications();
    await expect(modPageLocator, 'should the meeting be in dark mode').toHaveScreenshot('moderator-page-dark-mode.png', screenshotOptions);
    
    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.waitAndClick(e.chatOptions);
    await this.modPage.waitAndClick(e.restoreWelcomeMessages);
  }

  async fontSizeTest() {
    await this.modPage.hasElement(e.whiteboard, 'should the whiteboard be display');
    await this.modPage.waitAndClick(e.closePopup);
    // Increasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    const modPageLocator = this.modPage.getLocator('body');

    await this.modPage.setHeightWidthViewPortSize();
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.closeAllToastNotifications();

    await expect(modPageLocator, 'should the meeting display the font size increased').toHaveScreenshot('moderator-page-font-size.png', screenshotOptions);
  }
}

exports.Options = Options;
