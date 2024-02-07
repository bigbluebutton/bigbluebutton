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
    await this.modPage.hasElement(e.closeModal);
    await this.modPage.waitAndClick(e.closeModal);
  }

  async openHelp(context) {
    await this.modPage.waitAndClick(e.optionsButton);
    const newPage = await this.modPage.handleNewTab(e.helpButton, context);
    await expect(newPage).toHaveTitle(/Tutorials/);
    await newPage.close();
    await this.modPage.hasElement(e.whiteboard);
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
      await this.modPage.waitForSelector(e.toastContainer);

      for (const selector in currentValuesBySelector) {
        await this.modPage.hasText(selector, currentValuesBySelector[selector]);
      }
    }
  }

  async darkMode() {
    await openSettings(this.modPage);

    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    const modPageLocator = this.modPage.getLocator('body');
    await this.modPage.page.setViewportSize({ width: 1924, height: 1080 });
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.closeAllToastNotifications();
    await expect(modPageLocator).toHaveScreenshot('moderator-page-dark-mode.png', screenshotOptions);
    
    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);
  }

  async fontSizeTest() {
    // Increasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    const modPageLocator = this.modPage.getLocator('body');

    await this.modPage.page.setViewportSize({ width: 1924, height: 1080 });
    const screenshotOptions = {
      maxDiffPixels: 1000,
    };

    await this.modPage.closeAllToastNotifications();

    await expect(modPageLocator).toHaveScreenshot('moderator-page-font-size.png', screenshotOptions);
  }
}

exports.Options = Options;
