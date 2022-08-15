const Page = require('../core/page');
const { openSettings, getLocaleValues } = require('./util');
const e = require('../core/elements');

class Language extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
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
}

exports.Language = Language;
