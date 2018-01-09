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

  // Make Fullscreen button
  get settingsDropdownFullscreenButtonSelector() {
    return '[data-test=settingsDropdownFullscreenButton]';
  }
  get settingsDropdownFullscreenButtonElement() {
    return browser.element(this.settingsDropdownFullscreenButtonSelector);
  }

  // Open Settings button
  get settingsDropdownSettingsButtonSelector() {
    return '[data-test=settingsDropdownSettingsButton]';
  }
  get settingsDropdownSettingsButtonElement() {
    return browser.element(this.settingsDropdownSettingsButtonSelector);
  }

  // About button
  get settingsDropdownAboutButtonSelector() {
    return '[data-test=settingsDropdownAboutButton]';
  }
  get settingsDropdownAboutButtonElement() {
    return browser.element(this.settingsDropdownAboutButtonSelector);
  }

  // Logout button
  get settingsDropdownLogoutButtonSelector() {
    return '[data-test=settingsDropdownLogoutButton]';
  }
  get settingsDropdownLogoutButtonElement() {
    return browser.element(this.settingsDropdownLogoutButtonSelector);
  }

  // Fullscreen modal buttons
  get modalDismissButtonSelector() {
    return '[data-test=modalDismissButton]';
  }
  get modalDismissButtonElement() {
    return browser.element(this.modalDismissButtonSelector);
  }
  get modalConfirmButtonSelector() {
    return '[data-test=modalConfirmButton]';
  }
  get modalConfirmButtonElement() {
    return browser.element(this.modalConfirmButtonSelector);
  }

  get logoutModalSelector() {
    return '.ReactModal__Content--after-open._imports_ui_components_modal_fullscreen__styles__modal';
  }
  get logoutModalElement() {
    return browser.element(this.logoutModalSelector);
  }

  get userListToggleButtonSelector() {
    return '[data-test=userListToggleButton]';
  }
  get userListToggleButtonElement() {
    return browser.element(this.userListToggleButtonSelector);
  }

  // User list
  get userListContentSelector() {
    return '[data-test=userListContent]';
  }
  get userListContentElement() {
    return browser.element(this.userListContentSelector);
  }

  // User avatar icon
  get userAvatarIconSelector() {
    return '[data-test=userAvatarIcon]';
  }
  get userAvatarIconElement() {
    return browser.element(this.userAvatarIconSelector);
  }

  // chat item that points to the Public chat
  get publicChatLinkSelector() {
    return '[data-test=publicChatLink]';
  }
  get publicChatLinkElement() {
    return browser.element(this.publicChatLinkSelector);
  }

  // Public chat
  get publicChatSelector() {
    return '[data-test=publicChat]';
  }
  get publicChatElement() {
    return browser.element(this.publicChatSelector);
  }

  // Chat dropdown trigger
  get chatDropdownTriggerSelector() {
    return '[data-test=chatDropdownTrigger]';
  }
  get chatDropdownTriggerElement() {
    return browser.element(this.chatDropdownTriggerSelector);
  }

  // Chat title
  get chatTitleSelector() {
    return '[data-test=chatTitle]';
  }
  get chatTitleElement() {
    return browser.element(this.chatTitleSelector);
  }
}

module.exports = new HomePage();

