

const LandingPage = require('../pageobjects/landing.page');
const ModalPage = require('../pageobjects/modal.page');
const ChatPage = require('../pageobjects/chat.page');
const Utils = require('../utils');

const WAIT_TIME = 10000;

const loginWithoutAudio = function () {
  // login
  LandingPage.open();
  browser.setValue(LandingPage.usernameInputSelector, 'user');
  LandingPage.joinWithEnterKey();

  // close audio modal
  browser.waitForExist(ModalPage.modalCloseSelector, WAIT_TIME);
  ModalPage.closeAudioModal();
};

describe('Chat', () => {
  beforeEach(() => {
    Utils.configureViewport();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  });

  it('should be able to send a message',
    () => {
      loginWithoutAudio();

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage('Hello');
    });

  it('should be able to save chat',
    () => {
      loginWithoutAudio();

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage('Hello');

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.saveChatButtonSelector, WAIT_TIME);
      ChatPage.saveChat();
    });

  it('should be able to copy chat',
    () => {
      loginWithoutAudio();

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage('Hello');

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.copyChatButtonSelector, WAIT_TIME);
      ChatPage.copyChat();
    });

  it('should be able to clear chat',
    () => {
      loginWithoutAudio();

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage('Hello');

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.clearChatButtonSelector, WAIT_TIME);
      ChatPage.clearChat();
    });
});
