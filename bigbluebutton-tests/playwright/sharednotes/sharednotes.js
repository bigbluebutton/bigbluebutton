const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { MultiUsers } = require('../user/multiusers');
const { getSettings } = require('../core/settings');
const e = require('../core/elements');
const { startSharedNotes, getNotesLocator, getShowMoreButtonLocator, getExportButtonLocator, getExportPlainTextLocator, getMoveToWhiteboardLocator, getSharedNotesUserWithoutPermission } = require('./util');
const { expect } = require('@playwright/test');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

class SharedNotes extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async openSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    await startSharedNotes(this.userPage);
  }

  async editMessage(notesLocator) {
    await this.modPage.down('Shift');
    let i = 7;
    while(i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Backspace');
    i = 5;
    while(i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.press('!');
  }

  async typeInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);
    this.editMessage(notesLocator);
    const editedMessage = '!Hello';
    await expect(notesLocator).toContainText(editedMessage, { timeout : ELEMENT_WAIT_TIME });
  }

  async formatMessage(notesLocator) {

    // U for '!'
    await this.modPage.down('Shift');
    await this.modPage.press('ArrowLeft');
    await this.modPage.up('Shift');
    await this.modPage.press('Control+U');
    await this.modPage.press('ArrowLeft');

    // B for 'World'
    await this.modPage.down('Shift');
    let i = 5;
    while(i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Control+B');
    await this.modPage.press('ArrowLeft');

    await this.modPage.press('ArrowLeft');

    // I for 'Hello'
    await this.modPage.down('Shift');
    i = 5;
    while(i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Control+I');
    await this.modPage.press('ArrowLeft');
  }

  async formatTextInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);
    this.formatMessage(notesLocator);
    const html = await notesLocator.innerHTML();

    const uText = '<u>!</u>';
    await expect(html.includes(uText)).toBeTruthy();

    const bText = '<b>World</b>';
    await expect(html.includes(bText)).toBeTruthy();

    const iText = '<i>Hello</i>'
    await expect(html.includes(bText)).toBeTruthy();
  }

  async exportSharedNotes(page) {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    const showMoreButtonLocator = getShowMoreButtonLocator(this.modPage);
    await showMoreButtonLocator.click();

    const exportButtonLocator = getExportButtonLocator(this.modPage);
    await exportButtonLocator.click();

    const exportPlainTextLocator = getExportPlainTextLocator(this.modPage);
    page.waitForEvent('download');
    await exportPlainTextLocator.click();
    await sleep(500);
  }

  async moveNotesToWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('test');
    await sleep(1000);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.sendNotesToWhiteboard);
    
    await this.modPage.hasText(e.currentSlideText, /test/, 20000);
    await this.userPage.hasText(e.currentSlideText, /test/);
  }

  async editSharedNotesWithMoreThanOneUSer() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await startSharedNotes(this.userPage);
    const notesLocatorUser = getNotesLocator(this.userPage);
    await notesLocatorUser.press('Delete');
    await notesLocatorUser.type('J');

    const editedMessage = 'Jello World!';
    await expect(notesLocator).toContainText(editedMessage, { timeout : ELEMENT_WAIT_TIME });
    await expect(notesLocatorUser).toContainText(editedMessage, { timeout : ELEMENT_WAIT_TIME });
  }

  async seeNotesWithoutEditPermission() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');

    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    notesLocator.type('Hello');

    await startSharedNotes(this.userPage);

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    const notesLocatorUser  = getSharedNotesUserWithoutPermission(this.userPage);
    await expect(notesLocatorUser).toContainText(/Hello/, { timeout : 20000 });
    await this.userPage.wasRemoved(e.etherpadFrame);
    
  }
}

exports.SharedNotes = SharedNotes;