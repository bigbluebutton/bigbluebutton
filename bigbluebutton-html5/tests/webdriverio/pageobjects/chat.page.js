

const Page = require('./page');

const pageObject = new Page();
const chai = require('chai');

class ChatPage extends Page {
  get publicChatSelector() {
    return '#message-input';
  }

  get publicChatElement() {
    return $(this.publicChatSelector);
  }

  sendPublicChatMessage(message) {
    this.publicChatElement.setValue(message);
    this.sendMessageButtonElement.click();
  }

  // ////////

  get chatDropdownTriggerSelector() {
    return '[data-test=chatDropdownTrigger]';
  }

  get chatDropdownTriggerElement() {
    return $(this.chatDropdownTriggerSelector);
  }

  triggerChatDropdown() {
    this.chatDropdownTriggerElement.click();
  }

  // ////////

  get clearChatButtonSelector() {
    return '[data-test=chatClear]';
  }

  get clearChatButtonElement() {
    return $(this.clearChatButtonSelector);
  }

  clearChat() {
    this.clearChatButtonElement.click();
  }

  // ////////

  get saveChatButtonSelector() {
    return '[data-test=chatSave]';
  }

  get saveChatButtonElement() {
    return $(this.saveChatButtonSelector);
  }

  saveChat() {
    this.saveChatButtonElement.click();
  }

  // ////////

  get copyChatButtonSelector() {
    return '[data-test=chatCopy]';
  }

  get copyChatButtonElement() {
    return $(this.copyChatButtonSelector);
  }

  copyChat() {
    this.copyChatButtonElement.click();
  }

  // ////////

  get sendMessageButtonSelector() {
    return '[data-test=sendMessageButton]';
  }

  get sendMessageButtonElement() {
    return $(this.sendMessageButtonSelector);
  }
}

module.exports = new ChatPage();
