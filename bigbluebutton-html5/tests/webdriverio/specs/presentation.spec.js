const LandingPage = require('../pageobjects/landing.page');
const ModalPage = require('../pageobjects/modal.page');
const ChatPage = require('../pageobjects/chat.page');
const Utils = require('../utils');

const WAIT_TIME = 10000;

const checkFullscreen = () => document.fullscreen;

const loginWithoutAudio = function (username) {
  LandingPage.joinClient(username);

  // close audio modal
  browser.waitForExist(ModalPage.modalCloseSelector, WAIT_TIME);
  ModalPage.closeAudioModal();
};

describe('Presentation', () => {
  beforeEach(() => {
    Utils.configureViewport();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  });

  it('should be able to enter fullscreen',
    () => {
      const username = 'presentationUser';
      loginWithoutAudio(username);

      browser.waitForExist(ChatPage.publicChatSelector, WAIT_TIME);
      browser.waitForExist('[data-test="presentationFullscreenButton"]', WAIT_TIME);
      $('[data-test="presentationFullscreenButton"]').click();
      browser.pause(2000);
      console.log(browser.execute(checkFullscreen));
    });
});
