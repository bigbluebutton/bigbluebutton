const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { MultiUsers } = require('../user/multiusers');
const { getSettings } = require('../core/settings');
const e = require('../core/elements');
const { startSharedNotes, getNotesLocator, getShowMoreButtonLocator, getExportButtonLocator, getExportPlainTextLocator, getMoveToWhiteboardLocator, getSharedNotesUserWithoutPermission, getExportHTMLLocator, getExportEtherpadLocator } = require('./util');
const { expect } = require('@playwright/test');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');
const { readFileSync } = require('fs');
const { checkTextContent } = require('../core/util');
const { domainToASCII } = require('url');

class SharedNotes extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async openSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
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

    await notesLocator.press('Control+Z');
    await expect(notesLocator).toBeEmpty();
    await notesLocator.press('Control+Y');
    await expect(notesLocator).toContainText(e.message);

    await this.formatMessage(notesLocator);
    const html = await notesLocator.innerHTML();

    const uText = '<u>!</u>';
    await expect(html.includes(uText)).toBeTruthy();

    const bText = '<b>World</b>';
    await expect(html.includes(bText)).toBeTruthy();

    const iText = '<i>Hello</i>'
    await expect(html.includes(iText)).toBeTruthy();
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
    const exportHtmlLocator = getExportHTMLLocator(this.modPage);
    const exportEtherpadLocator = getExportEtherpadLocator(this.modPage);

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      exportPlainTextLocator.click(),
    ]);
    await expect(download).toBeTruthy();
    const filePath = await download.path();
    const content = await readFileSync(filePath, 'utf8');
    
    await checkTextContent(content, e.message);

    const [downloadHtml] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      exportHtmlLocator.click(),
    ]);
    await expect(downloadHtml).toBeTruthy();
    const filePathHtml = await downloadHtml.path();
    const contentHtml = await readFileSync(filePathHtml, 'utf8');

    await checkTextContent(contentHtml, '<body>');

    const [downloadEtherpad] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      exportEtherpadLocator.click(),
    ]);
    await expect(downloadEtherpad).toBeTruthy();
    const filePathEtherpad = await downloadEtherpad.path();
    const contentEtherpad = await readFileSync(filePathEtherpad, 'utf8');

    await checkTextContent(contentEtherpad, e.message);    
  }

  async convertNotesToWhiteboard() {
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
    await notesLocator.type('Hello');

    await startSharedNotes(this.userPage);

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);

    const notesLocatorUser  = getSharedNotesUserWithoutPermission(this.userPage);
    await expect(notesLocatorUser).toContainText(/Hello/, { timeout : 20000 });
    await this.userPage.wasRemoved(e.etherpadFrame); 
  }

  async pinNotesOntoWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');

    await startSharedNotes(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes);

    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('Hello');
    const notesLocatorUser = getNotesLocator(this.userPage1);

    await expect(notesLocator).toContainText(/Hello/, { timeout : 20000 });
    await expect(notesLocatorUser).toContainText(/Hello/);
  }
}

exports.SharedNotes = SharedNotes;