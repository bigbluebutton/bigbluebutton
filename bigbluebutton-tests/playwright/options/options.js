const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openAboutModal, openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');


class Options extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openedAboutModal() {
    await openAboutModal(this);
    await this.hasElement(e.closeModal);
  }

  async openHelp(context) {
    await this.waitAndClick(e.optionsButton);

    const newPage = await this.handleNewTab(e.helpButton, context);

    await expect(newPage).toHaveTitle(/BigBlueButton Tutorials/);
    await this.hasElement(e.presentationTitle);
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
      [e.raiseHandBtn]: 'app.actionsBar.emojiMenu.raiseHandLabel',
      [e.connectionStatusBtn]: 'app.connection-status.label',
      [e.optionsButton]: 'app.navBar.settingsDropdown.optionsLabel',
    }

    for (const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      const currentValuesBySelector = await getLocaleValues(selectedKeysBySelector, locale);

      await openSettings(this);
      await this.waitForSelector(e.languageSelector);
      const langDropdown = await this.page.$(e.languageSelector);
      await langDropdown.selectOption({ value: locale });
      await this.waitAndClick(e.modalConfirmButton);
      await this.waitForSelector(e.toastContainer);

      for (const selector in currentValuesBySelector) {
        await this.hasText(selector, currentValuesBySelector[selector]);
      }
    }
  }

  async darkMode() {
    await openSettings(this);

    await this.waitAndClickElement(e.darkModeToggleBtn);
    await this.waitAndClick(e.modalConfirmButton);

    //Checking user list
    await this.waitAndClick(e.sharedNotes, ELEMENT_WAIT_TIME);
    await this.backgroundColorTest(e.sharedNotesBackground, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.manageUsers);
    await this.waitAndClick(e.guestPolicyLabel);
    await this.backgroundColorTest(e.simpleModal, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.closeModal);
    await this.waitAndClick(e.chatButton);
    await this.backgroundColorTest(e.chatButton, 'rgb(48, 51, 52)');
    await this.textColorTest(e.chatButton, 'rgb(208, 205, 201)');
    await this.textColorTest(e.hidePublicChat, 'rgb(170, 164, 155)');
    await this.textColorTest(`${e.chatOptions} >> span`, 'rgb(170, 164, 155)'); 

    await this.textColorTest(`${e.manageUsers} >> span`, 'rgb(170, 164, 155)');
    await this.waitAndClick(e.manageUsers);
    await this.waitAndClick(e.lockViewersButton);
    await this.backgroundColorTest(e.simpleModal, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.applyLockSettings);

    //Checking public chat
    await this.backgroundColorTest(e.publicChat, 'rgb(34, 36, 37)');
    await this.backgroundColorTest(e.chatWelcomeMessageText, 'rgb(37, 39, 40)');
    await this.backgroundColorTest(`${e.sendButton} >> span`, 'rgb(24, 94, 168)');
    await this.backgroundColorTest(e.chatBox, 'rgb(34, 36, 37)');
    await this.textColorTest(e.chatBox, 'rgb(170, 164, 155)');

    // Checking actions bar background and buttons color
    await this.backgroundColorTest(e.actionsBarBackground, 'rgb(30, 32, 33)')
    await this.textColorTest(`${e.joinAudio} >> span`, 'rgb(222, 220, 217)');
    await this.backgroundColorTest(`${e.joinAudio} >> span`, 'rgba(0, 0, 0, 0)');
    await this.textColorTest(`${e.joinVideo} >> span`, 'rgb(222, 220, 217)');
    await this.backgroundColorTest(`${e.joinVideo} >> span`, 'rgba(0, 0, 0, 0)');
    await this.textColorTest(`${e.startScreenSharing} >> span`, 'rgb(222, 220, 217)');
    await this.backgroundColorTest(`${e.startScreenSharing} >> span`, 'rgba(0, 0, 0, 0)');
    await this.textColorTest(`${e.raiseHandBtn} >> span`, 'rgb(222, 220, 217)');
    await this.backgroundColorTest(`${e.raiseHandBtn} >> span`, 'rgba(0, 0, 0, 0)');
    await this.backgroundColorTest(`${e.actions} >> span`, 'rgb(24, 94, 168)');
    await this.backgroundColorTest(`${e.minimizePresentation} >> span`, 'rgb(24, 94, 168)');
    
    // Checking buttons background and navbar background
    await this.backgroundColorTest(e.navbarBackground, 'rgb(30, 32, 33)');
    await this.textColorTest(`${e.userListToggleBtn} >> span`, 'rgb(222, 220, 217)');
    await this.textColorTest(`${e.optionsButton} >> span`, 'rgb(222, 220, 217)');
    
    // Checking presentation area
    await this.backgroundColorTest(e.whiteboardOptionsButton, 'rgb(34, 36, 37)');
    await this.textColorTest(e.whiteboardOptionsButton, 'rgb(208, 205, 201)');
    await this.waitAndClick(e.optionsButton);
    await this.waitAndClick(e.settings);
    await this.backgroundColorTest(e.fullscreenModal, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.modalConfirmButton);
    await this.backgroundColorTest(e.presentationToolbarWrapper, 'rgb(39, 42, 42)');
  }

  async fontSizeTest() {
    // Increasing font size
    await openSettings(this);
    await this.waitAndClick(e.increaseFontSize);
    await this.waitAndClick(e.modalConfirmButton);

    await this.fontSizeCheck(e.chatButton, '16px');//text + icon
    await this.fontSizeCheck(e.chatWelcomeMessageText, '16px');
    await this.fontSizeCheck(e.chatMessages, '16px');
    await this.fontSizeCheck(e.sharedNotes, '14px');
    await this.fontSizeCheck(e.userslist, '16px');
    await this.fontSizeCheck(e.currentUser, '16px');
    await this.fontSizeCheck(e.actionsBarBackground, '16px');
    await this.fontSizeCheck(e.navbarBackground, '24px');
    
    // Decreasing font size
    await openSettings(this);
    await this.waitAndClick(e.decreaseFontSize);
    await this.waitAndClick(e.decreaseFontSize);
    await this.waitAndClick(e.modalConfirmButton);

    await this.fontSizeCheck(e.chatButton, '12px');
    await this.fontSizeCheck(e.chatWelcomeMessageText, '12px');
    await this.fontSizeCheck(e.chatMessages, '12px')
    await this.fontSizeCheck(e.sharedNotes, '10.5px');
    await this.fontSizeCheck(e.userslist, '12px');
    await this.fontSizeCheck(e.currentUser, '12px');
    await this.fontSizeCheck(e.actionsBarBackground, '12px');
    await this.fontSizeCheck(e.navbarBackground, '18px');
  }
}

exports.Options = Options;
