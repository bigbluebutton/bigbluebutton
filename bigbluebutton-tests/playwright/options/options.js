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
      [e.raiseHandBtn]: 'app.actionsBar.emojiMenu.raiseHandLabel',
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

    //Checking user list
    await this.modPage.waitAndClick(e.sharedNotes, ELEMENT_WAIT_TIME);
    await this.modPage.backgroundColorTest(e.sharedNotesBackground, 'rgb(34, 36, 37)');
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.guestPolicyLabel);
    await this.modPage.backgroundColorTest(e.simpleModal, 'rgb(34, 36, 37)');
    await this.modPage.waitAndClick(e.closeModal);
    await this.modPage.waitAndClick(e.chatButton);
    await this.modPage.backgroundColorTest(e.chatButton, 'rgb(48, 51, 52)');
    await this.modPage.textColorTest(e.chatButton, 'rgb(208, 205, 201)');
    await this.modPage.textColorTest(e.hidePublicChat, 'rgb(170, 164, 155)');
    await this.modPage.textColorTest(`${e.chatOptions} >> span`, 'rgb(170, 164, 155)'); 

    await this.modPage.textColorTest(`${e.manageUsers} >> span`, 'rgb(170, 164, 155)');
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.backgroundColorTest(e.simpleModal, 'rgb(34, 36, 37)');
    await this.modPage.waitAndClick(e.applyLockSettings);

    //Checking public chat
    await this.modPage.backgroundColorTest(e.publicChat, 'rgb(34, 36, 37)');
    await this.modPage.backgroundColorTest(e.chatWelcomeMessageText, 'rgb(37, 39, 40)');
    await this.modPage.backgroundColorTest(`${e.sendButton} >> span`, 'rgb(24, 94, 168)');
    await this.modPage.backgroundColorTest(e.chatBox, 'rgb(34, 36, 37)');
    await this.modPage.textColorTest(e.chatBox, 'rgb(170, 164, 155)');

    // Checking actions bar background and buttons color
    await this.modPage.backgroundColorTest(e.actionsBarBackground, 'rgb(30, 32, 33)')
    await this.modPage.textColorTest(`${e.joinAudio} >> span`, 'rgb(222, 220, 217)');
    await this.modPage.backgroundColorTest(`${e.joinAudio} >> span`, 'rgba(0, 0, 0, 0)');
    await this.modPage.textColorTest(`${e.joinVideo} >> span`, 'rgb(222, 220, 217)');
    await this.modPage.backgroundColorTest(`${e.joinVideo} >> span`, 'rgba(0, 0, 0, 0)');
    await this.modPage.textColorTest(`${e.startScreenSharing} >> span`, 'rgb(222, 220, 217)');
    await this.modPage.backgroundColorTest(`${e.startScreenSharing} >> span`, 'rgba(0, 0, 0, 0)');
    await this.modPage.textColorTest(`${e.raiseHandBtn} >> span`, 'rgb(222, 220, 217)');
    await this.modPage.backgroundColorTest(`${e.raiseHandBtn} >> span`, 'rgba(0, 0, 0, 0)');
    await this.modPage.backgroundColorTest(`${e.actions} >> span`, 'rgb(24, 94, 168)');
    await this.modPage.backgroundColorTest(`${e.minimizePresentation} >> span`, 'rgb(24, 94, 168)');
    
    // Checking buttons background and navbar background
    await this.modPage.backgroundColorTest(e.navbarBackground, 'rgb(30, 32, 33)');
    await this.modPage.textColorTest(`${e.userListToggleBtn} >> span`, 'rgb(222, 220, 217)');
    await this.modPage.textColorTest(`${e.optionsButton} >> span`, 'rgb(222, 220, 217)');
    
    // Checking presentation area
    await this.modPage.backgroundColorTest(e.whiteboardOptionsButton, 'rgb(34, 36, 37)');
    await this.modPage.textColorTest(e.whiteboardOptionsButton, 'rgb(208, 205, 201)');
    await this.modPage.waitAndClick(e.optionsButton);
    await this.modPage.waitAndClick(e.settings);
    await this.modPage.backgroundColorTest(e.fullscreenModal, 'rgb(34, 36, 37)');
    await this.modPage.waitAndClick(e.modalConfirmButton);
    await this.modPage.backgroundColorTest(e.presentationToolbarWrapper, 'rgb(39, 42, 42)');

    await openSettings(this.modPage);
    await this.modPage.waitAndClickElement(e.darkModeToggleBtn);
    await this.modPage.waitAndClick(e.modalConfirmButton);
  }

  async fontSizeTest() {
    // Increasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.increaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.fontSizeCheck(e.chatButton, '16px');//text + icon
    await this.modPage.fontSizeCheck(e.chatWelcomeMessageText, '16px');
    await this.modPage.fontSizeCheck(e.chatMessages, '16px');
    await this.modPage.fontSizeCheck(e.sharedNotes, '14px');
    await this.modPage.fontSizeCheck(e.usersList, '16px');
    await this.modPage.fontSizeCheck(e.currentUser, '16px');
    await this.modPage.fontSizeCheck(e.actionsBarBackground, '16px');
    await this.modPage.fontSizeCheck(e.navbarBackground, '24px');
    
    // Decreasing font size
    await openSettings(this.modPage);
    await this.modPage.waitAndClick(e.decreaseFontSize);
    await this.modPage.waitAndClick(e.decreaseFontSize);
    await this.modPage.waitAndClick(e.modalConfirmButton);

    await this.modPage.fontSizeCheck(e.chatButton, '12px');
    await this.modPage.fontSizeCheck(e.chatWelcomeMessageText, '12px');
    await this.modPage.fontSizeCheck(e.chatMessages, '12px')
    await this.modPage.fontSizeCheck(e.sharedNotes, '10.5px');
    await this.modPage.fontSizeCheck(e.usersList, '12px');
    await this.modPage.fontSizeCheck(e.currentUser, '12px');
    await this.modPage.fontSizeCheck(e.actionsBarBackground, '12px');
    await this.modPage.fontSizeCheck(e.navbarBackground, '18px');
  }
}

exports.Options = Options;
