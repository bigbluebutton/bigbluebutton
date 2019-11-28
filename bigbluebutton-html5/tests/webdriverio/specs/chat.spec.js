
const chai = require('chai');
const clipboardy = require('clipboardy');
const LandingPage = require('../pageobjects/landing.page');
const ModalPage = require('../pageobjects/modal.page');
const ChatPage = require('../pageobjects/chat.page');
const Utils = require('../utils');

const WAIT_TIME = 10000;
const message = 'Hello';

const loginWithoutAudio = function (username) {
  LandingPage.joinClient(username);

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
      const username = 'chatUser1';
      loginWithoutAudio(username);

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage(message);
    });

  it('should be able to save chat',
    () => {
      const username = 'chatUser2';
      loginWithoutAudio(username);

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage(message);

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.saveChatButtonSelector, WAIT_TIME);
      ChatPage.saveChat();
    });

  it('should be able to copy chat',
    () => {
      const username = 'chatUser3';
      loginWithoutAudio(username);

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage(message);

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.copyChatButtonSelector, WAIT_TIME);
      ChatPage.copyChat();
      const copiedChat = clipboardy.readSync();
      chai.expect(copiedChat).to.include(`${username} : ${message}`);
    });

  it('should be able to clear chat',
    () => {
      const username = 'chatUser4';
      loginWithoutAudio(username);

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      ChatPage.sendPublicChatMessage(message);

      browser.waitForExist(ChatPage.chatDropdownTriggerSelector, WAIT_TIME);
      ChatPage.triggerChatDropdown();

      browser.waitForExist(ChatPage.clearChatButtonSelector, WAIT_TIME);
      ChatPage.clearChat();
    });
});
