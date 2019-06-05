

const Page = require('./page');

const pageObject = new Page();
const chai = require('chai');

class SettingsPage extends Page {
  // open the settings dropdown
  get openSettingsDropdownSelector() {
    return 'i.icon-bbb-more';
  }

  get openSettingsDropdownElement() {
    return $(this.openSettingsDropdownSelector);
  }

  openSettingsDropdown() {
    this.openSettingsDropdownElement.click();
  }

  // ////////

  get endMeetingButtonSelector() {
    return 'i.icon-bbb-application';
  }

  get endMeetingButtonElement() {
    return $(this.endMeetingButtonSelector);
  }

  clickEndMeetingButton() {
    this.endMeetingButtonElement.click();
  }

  // ////////

  get confirmEndMeetingSelector() {
    return '[data-test=confirmEndMeeting]';
  }

  get confirmEndMeetingElement() {
    return $(this.confirmEndMeetingSelector);
  }

  confirmEndMeeting() {
    this.confirmEndMeetingElement.click();
  }

  // ////////

  get logoutButtonSelector() {
    return 'i.icon-bbb-logout';
  }

  get logoutButtonElement() {
    return $(this.logoutButtonSelector);
  }

  clickLogoutButton() {
    this.logoutButtonElement.click();
  }

  // ////////

  get settingsButtonSelector() {
    return 'i.icon-bbb-settings';
  }

  get settingsButtonElement() {
    return $(this.settingsButtonSelector);
  }

  clickSettingsButton() {
    this.settingsButtonElement.click();
  }

  // ////////

  get languageSelectSelector() {
    return '#langSelector';
  }

  get languageSelectElement() {
    return $(this.languageSelectSelector);
  }

  clickLanguageSelect() {
    this.languageSelectElement.click();
  }
}

module.exports = new SettingsPage();
