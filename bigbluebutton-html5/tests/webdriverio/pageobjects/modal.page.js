

const Page = require('./page');

const pageObject = new Page();
const chai = require('chai');

class ModalPage extends Page {
  get modalCloseSelector() {
    return 'i.icon-bbb-close';
  }

  get modalCloseElement() {
    return $(this.modalCloseSelector);
  }

  closeAudioModal() {
    this.modalCloseElement.click();
  }

  get meetingEndedModalTitleSelector() {
    return '[data-test=meetingEndedModalTitle]';
  }

  get aboutModalSelector() {
    return '[aria-label=About]';
  }

  get modalConfirmButtonSelector() {
    return '[data-test=modalConfirmButton]';
  }

  get modalConfirmButtonElement() {
    return browser.element(this.modalConfirmButtonSelector);
  }
}

module.exports = new ModalPage();
