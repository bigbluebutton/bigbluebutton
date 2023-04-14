const { default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const { getSettings } = require('../core/settings');
const e = require('../core/elements');
const { startSharedNotes, getNotesLocator, getShowMoreButtonLocator, getExportButtonLocator, getExportPlainTextLocator, getSharedNotesUserWithoutPermission, getExportHTMLLocator, getExportEtherpadLocator } = require('./util');
const { expect } = require('@playwright/test');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
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
    const sharedNotesContent = await getNotesLocator(this.modPage);
    await expect(sharedNotesContent).toBeEditable({ timeout: ELEMENT_WAIT_TIME });
  }

  async editMessage() {
    await this.modPage.down('Shift');
    let i = 7;
    while (i > 0) {
      await this.modPage.press('ArrowLeft');
      i--;
    }
    await this.modPage.up('Shift');
    await this.modPage.press('Backspace');
    i = 5;
    while (i > 0) {
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
    await this.editMessage(notesLocator);
    const editedMessage = '!Hello';
    await expect(notesLocator).toContainText(editedMessage, { timeout: ELEMENT_WAIT_TIME });

    const wbBox = await this.modPage.getElementBoundingBox(e.etherpadFrame);
    await expect(this.modPage.page).toHaveScreenshot('sharednotes-1.png', {
      maxDiffPixels: 10,
      clip: wbBox,
    });
  }

  async formatMessage() {
    // U for '!'
    await this.modPage.down('Shift');
    await this.modPage.press('ArrowLeft');
    await this.modPage.up('Shift');
    await this.modPage.press('Control+U');
    await this.modPage.press('ArrowLeft');

    // B for 'World'
    await this.modPage.down('Shift');
    let i = 5;
    while (i > 0) {
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
    while (i > 0) {
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

  async exportSharedNotes(testInfo) {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    const showMoreButtonLocator = getShowMoreButtonLocator(this.modPage);
    await showMoreButtonLocator.click({ timeout: ELEMENT_WAIT_TIME });

    const exportButtonLocator = getExportButtonLocator(this.modPage);
    await exportButtonLocator.click({ timeout: ELEMENT_WAIT_TIME });

    const exportPlainTextLocator = getExportPlainTextLocator(this.modPage);
    const exportHtmlLocator = getExportHTMLLocator(this.modPage);
    const exportEtherpadLocator = getExportEtherpadLocator(this.modPage);

    //.txt checks
    const txt = await this.modPage.handleDownload(exportPlainTextLocator, testInfo);
    const txtFileExtension = (txt.download._suggestedFilename).split('.').pop();
    await checkTextContent(txtFileExtension, 'txt');
    await checkTextContent(txt.content, e.message);

    //.html checks
    const html = await this.modPage.handleDownload(exportHtmlLocator, testInfo);
    const htmlFileExtension = (html.download._suggestedFilename).split('.').pop();
    await checkTextContent(htmlFileExtension, 'html');
    await checkTextContent(html.content, e.message); 

    //.etherpad checks
    const etherpad = await this.modPage.handleDownload(exportEtherpadLocator, testInfo);
    const etherpadFileExtension = (etherpad.download._suggestedFilename).split('.').pop();    
    await checkTextContent(etherpadFileExtension, 'etherpad');
    await checkTextContent(etherpad.content, e.message);    
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
    await expect(notesLocator).toContainText(editedMessage, { timeout: ELEMENT_WAIT_TIME });
    await expect(notesLocatorUser).toContainText(editedMessage, { timeout: ELEMENT_WAIT_TIME });
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

    const notesLocatorUser = getSharedNotesUserWithoutPermission(this.userPage);
    await expect(notesLocatorUser).toContainText(/Hello/, { timeout: 20000 });
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

    await expect(notesLocator).toContainText(/Hello/, { timeout: 20000 });
    await expect(notesLocatorUser).toContainText(/Hello/);
  }
}

exports.SharedNotes = SharedNotes;
