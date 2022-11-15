const { expect } = require('@playwright/test');
const Page = require('../core/page');
const { openAboutModal, openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');


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
    await this.getBackgroundColor(e.sharedNotesBackground, 'rgb(39, 42, 42)');
    await this.getTextColor(e.sharedNotesBackground, 'rgb(208, 205, 201)');
    await this.waitAndClick(e.manageUsers);
    await this.waitAndClick(e.guestPolicyLabel);
    await this.getBackgroundColor(e.guestPolicyBackground, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.closeModal);
    await this.getBackgroundColor(e.chatButton, 'rgb(39, 42, 42)');
    await this.getTextColor(e.chatButton, 'rgb(208, 205, 201)');
    await this.getTextColor(e.hidePublicChat, 'rgb(170, 164, 155)');
    await this.getTextColor(e.chatOptionsColor, 'rgb(170, 164, 155)'); 

    await this.getTextColor(e.manageUsersColor, 'rgb(170, 164, 155)');
    await this.waitAndClick(e.manageUsers);
    await this.waitAndClick(e.lockViewersButton);
    await this.getBackgroundColor(e.lockViewersBackground, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.applyLockSettings);

    //Checking public chat
    await this.getBackgroundColor(e.publicChat, 'rgb(34, 36, 37)');
    await this.getBackgroundColor(e.chatWelcomeMessageText, 'rgb(37, 39, 40)');
    await this.getBackgroundColor(e.sendButtonBackground, 'rgb(24, 94, 168)');
    await this.getBackgroundColor(e.chatBox, 'rgb(34, 36, 37)');
    await this.getTextColor(e.chatBox, 'rgb(170, 164, 155)');

    // Checking actions background and buttons color
    await this.getBackgroundColor(e.actionsBarBackground, 'rgb(30, 32, 33)')
    await this.getTextColor(e.joinAudioBackgroundDisabled, 'rgb(222, 220, 217)');
    await this.getBackgroundColor(e.joinAudioBackgroundDisabled, 'rgba(0, 0, 0, 0)');
    await this.getTextColor(e.joinVideoBackgroundDisabled, 'rgb(222, 220, 217)');
    await this.getBackgroundColor(e.joinVideoBackgroundDisabled, 'rgba(0, 0, 0, 0)');
    await this.getTextColor(e.startScreenShareBackground, 'rgb(222, 220, 217)');
    await this.getBackgroundColor(e.startScreenShareBackground, 'rgba(0, 0, 0, 0)');
    await this.getTextColor(e.raiseHandBtnBackground, 'rgb(222, 220, 217)');
    await this.getBackgroundColor(e.raiseHandBtnBackground, 'rgba(0, 0, 0, 0)');
    await this.getBackgroundColor(e.actionsBackground, 'rgb(24, 94, 168)');
    await this.getBackgroundColor(e.minimizePresentationBackground, 'rgb(24, 94, 168)');
    
    // Checking buttons background and navbar background
    await this.getBackgroundColor(e.navbarBackground, 'rgb(30, 32, 33)');
    await this.getTextColor(e.userListToggleBackground, 'rgb(222, 220, 217)');
    await this.getTextColor(e.optionsButtonBackground, 'rgb(222, 220, 217)');
    
    // Checking presentation area
    await this.getBackgroundColor(e.whiteboardOptionsButton, 'rgb(34, 36, 37)');
    await this.getTextColor(e.whiteboardOptionsButton, 'rgb(208, 205, 201)');
    await this.waitAndClick(e.optionsButton);
    await this.waitAndClick(e.settings);
    await this.getBackgroundColor(e.modalSettings, 'rgb(34, 36, 37)');
    await this.waitAndClick(e.modalConfirmButton);
    await this.getBackgroundColor(e.presentationToolbarWrapper, 'rgb(39, 42, 42)');
    await this.getBackgroundColor(e.whiteboardOptionsButton, 'rgb(34, 36, 37)');
    await this.getTextColor(e.whiteboardOptionsButton, 'rgb(208, 205, 201)');
  }
}

exports.Options = Options;