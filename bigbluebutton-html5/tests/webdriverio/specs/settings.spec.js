

const chai = require('chai');
const LandingPage = require('../pageobjects/landing.page');
const ModalPage = require('../pageobjects/modal.page');
const SettingsPage = require('../pageobjects/settings.page');
const Utils = require('../utils');

const WAIT_TIME = 10000;
let errorsCounter = 0;

const openSettingsDropdown = function () {
  browser.waitForExist(SettingsPage.openSettingsDropdownSelector, WAIT_TIME);
  SettingsPage.openSettingsDropdown();
};

const closeAudioModal = function () {
  browser.waitForExist(ModalPage.modalCloseSelector, WAIT_TIME);
  ModalPage.closeAudioModal();
};

const openSettingsModal = function () {
  browser.waitForExist(SettingsPage.settingsButtonSelector, WAIT_TIME);
  SettingsPage.clickSettingsButton();
};

describe('Settings', () => {
  beforeAll(() => {
    Utils.configureViewport();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;
  });

  beforeEach(() => {
    LandingPage.joinClient('settingsUser');
    closeAudioModal();
  });

  it('should be able to use all locales',
    () => {
      openSettingsDropdown();
      openSettingsModal();
      browser.waitForExist(`${SettingsPage.languageSelectSelector} option:not([disabled]`, WAIT_TIME);
      const locales = browser.elements('#langSelector option:not([disabled]').value.map(e => e.getValue());
      browser.refresh();

      browser.cdp('Console', 'enable');
      browser.on('Console.messageAdded', (log) => {
        if (log.message.level === 'error') {
          console.log(log.message.text);
          errorsCounter += 1;
        }
      });

      locales.forEach((locale) => {
        errorsCounter = 0;

        closeAudioModal();
        openSettingsDropdown();
        openSettingsModal();

        browser.waitForExist(SettingsPage.languageSelectSelector, WAIT_TIME);
        SettingsPage.clickLanguageSelect();
        browser.waitForExist(`option[value=${locale}]`, WAIT_TIME);

        $(`option[value=${locale}]`).click();

        browser.waitForExist(ModalPage.modalConfirmButtonSelector, WAIT_TIME);
        ModalPage.modalConfirmButtonElement.click();

        browser.pause(500);
        browser.refresh();
        browser.pause(500);
        console.log(`[switching to ${locale}] number of errors: ${errorsCounter}`);

        chai.expect(errorsCounter < 5).to.be.true;
      });
    });

  it('should be able to end meeting and get confirmation',
    () => {
      openSettingsDropdown();

      // click End Meeting
      browser.waitForExist(SettingsPage.endMeetingButtonSelector, WAIT_TIME);
      SettingsPage.clickEndMeetingButton();

      // confirm
      browser.waitForExist(SettingsPage.confirmEndMeetingSelector, WAIT_TIME);
      SettingsPage.confirmEndMeeting();

      // check the confirmation page
      browser.waitForExist(ModalPage.meetingEndedModalTitleSelector, WAIT_TIME);
    });

  it('should be able to logout and get confirmation',
    () => {
      openSettingsDropdown();

      // click Logout
      browser.waitForExist(SettingsPage.logoutButtonSelector, WAIT_TIME);
      SettingsPage.clickLogoutButton();

      // check the confirmation page
      browser.waitForExist(ModalPage.meetingEndedModalTitleSelector, WAIT_TIME);
    });
});
