'use strict';

let Page = require('./page');
let pageObject = new Page();
let chai = require('chai');

class HomePage extends Page {
  login(username, meeting) {
    super.open('demo/demoHTML5.jsp?username=' + username + '&meetingname=' + meeting.replace(/\s+/g, '+') + '&action=create');
  }

  get audioModalHeaderSelector() {
    return '[data-test=audioModalHeader]';
  }
  get audioModalHeaderElement() {
    return browser.element(this.audioModalSelector);
  }

  get audioModalSelector() {
    return '.ReactModal__Content--after-open._imports_ui_components_audio_audio_modal__styles__modal';
  }

  get modalBaseCloseButtonSelector() {
    return '[data-test=modalBaseCloseButton]';
  }
  get modalBaseCloseButtonElement() {
    return $(this.modalBaseCloseButtonSelector);
  }

  get settingsDropdownTriggerSelector() {
    return '[data-test=settingsDropdownTrigger]';
  }
  get settingsDropdownTriggerElement() {
    return browser.element(this.settingsDropdownTriggerSelector);
  }

  get settingsDropdownSelector() {
    return '[data-test=settingsDropdownTrigger] + [data-test=dropdownContent][aria-expanded="true"]';
  }
  get settingsDropdownElement() {
    return browser.element(this.settingsDropdownSelector);
  }

  get settingsDropdownLogoutButtonSelector() {
    return '[data-test=settingsDropdownLogoutButton]';
  }
  get settingsDropdownLogoutButtonElement() {
    return browser.element(this.settingsDropdownLogoutButtonSelector);
  }

  get logoutModalSelector() {
    return '.ReactModal__Content--after-open._imports_ui_components_modal_fullscreen__styles__modal';
  }
  get logoutModalElement() {
    return browser.element(this.logoutModalSelector);
  }
}

module.exports = new HomePage();

