const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { getSettings } = require('../core/settings');
const e = require('../core/elements');
const { startSharedNotes, getNotesLocator, getShowMoreButtonLocator, getExportButtonLocator, getExportPlainTextLocator } = require('./util');
const { expect } = require('@playwright/test');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

class SharedNotes extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this);
  }

  async editMessage(notesLocator) {
    await this.down('Shift');
    let i = 7;
    while(i > 0) {
      await this.press('ArrowLeft');
      i--;
    }
    await this.up('Shift');
    await this.press('Backspace');
    i = 5;
    while(i > 0) {
      await this.press('ArrowLeft');
      i--;
    }
    await this.press('!');
  }

  async typeInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this);
    const notesLocator = getNotesLocator(this);
    await notesLocator.type(e.message);
    this.editMessage(notesLocator);
    const editedMessage = '!Hello';
    await expect(notesLocator).toContainText(editedMessage, { timeout : ELEMENT_WAIT_TIME });
  }

  async formatMessage(notesLocator) {

    // U for '!'
    await this.down('Shift');
    await this.press('ArrowLeft');
    await this.up('Shift');
    await this.press('Control+U');
    await this.press('ArrowLeft');

    // B for 'World'
    await this.down('Shift');
    let i = 5;
    while(i > 0) {
      await this.press('ArrowLeft');
      i--;
    }
    await this.up('Shift');
    await this.press('Control+B');
    await this.press('ArrowLeft');

    await this.press('ArrowLeft');

    // I for 'Hello'
    await this.down('Shift');
    i = 5;
    while(i > 0) {
      await this.press('ArrowLeft');
      i--;
    }
    await this.up('Shift');
    await this.press('Control+I');
    await this.press('ArrowLeft');
  }

  async formatTextInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this);
    const notesLocator = getNotesLocator(this);
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

  async exportSharedNotes(testInfo) {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this);
    const notesLocator = getNotesLocator(this);
    await notesLocator.type(e.message);

    const showMoreButtonLocator = getShowMoreButtonLocator(this);
    await showMoreButtonLocator.click();

    const exportButtonLocator = getExportButtonLocator(this);
    await exportButtonLocator.click();

    const exportPlainTextLocator = getExportPlainTextLocator(this);
    this.page.waitForEvent('download');
    await exportPlainTextLocator.click();
    await sleep(500);
  }
}

exports.SharedNotes = SharedNotes;
