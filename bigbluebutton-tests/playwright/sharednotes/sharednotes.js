const { default: test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const { getSettings } = require('../core/settings');
const e = require('../core/elements');
const { startSharedNotes, getNotesLocator, getShowMoreButtonLocator, getExportButtonLocator, getExportPlainTextLocator, getSharedNotesUserWithoutPermission, getExportHTMLLocator, getExportEtherpadLocator } = require('./util');
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
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const sharedNotesContent = await getNotesLocator(this.modPage);
    await expect(sharedNotesContent).toBeEditable({ timeout: 20000 });

    await this.modPage.waitAndClick(e.hideNotesLabel, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.wasRemoved(e.hideNotesLabel);
  }

  async typeInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);
    await this.editMessage(notesLocator);
    const editedMessage = '!Hello';
    await expect(notesLocator).toContainText(editedMessage, { timeout: ELEMENT_WAIT_TIME });

    //! avoiding the following screenshot comparison due to https://github.com/microsoft/playwright/issues/18827
    // const wbBox = await this.modPage.getLocator(e.etherpadFrame);
    // await expect(wbBox).toHaveScreenshot('sharednotes-type.png', {
    //   maxDiffPixels: 100,
    // });

    await notesLocator.press('Control+Z');
    await notesLocator.press('Control+Z');
    await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);
  }

  async formatTextInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await notesLocator.press('Control+Z');
    await expect(notesLocator).toContainText('');
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

    await notesLocator.press('Control+Z'); await notesLocator.press('Control+Z'); await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);
  }

  async exportSharedNotes(testInfo) {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    const showMoreButtonLocator = getShowMoreButtonLocator(this.modPage);
    await showMoreButtonLocator.click({ timeout: ELEMENT_WAIT_TIME });

    const exportButtonLocator = getExportButtonLocator(this.modPage);
    await exportButtonLocator.click({ timeout: 10000 });

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
    
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);
  }

  async convertNotesToWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('test');
    await sleep(1000);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.sendNotesToWhiteboard);

    await this.modPage.hasText(e.currentSlideText, /test/, 30000);
    await this.userPage.hasText(e.currentSlideText, /test/, 20000);

    await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);
    
  }

  async editSharedNotesWithMoreThanOneUSer() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await startSharedNotes(this.userPage);
    const notesLocatorUser = getNotesLocator(this.userPage);
    await notesLocatorUser.press('Delete');
    await notesLocatorUser.type('J');

    await expect(notesLocator).toContainText(/Jello/, { timeout: ELEMENT_WAIT_TIME });
    await expect(notesLocatorUser).toContainText(/Jello/, { timeout: ELEMENT_WAIT_TIME });
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);
    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel);
  }

  async seeNotesWithoutEditPermission() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }

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

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);
    
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel);

    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel);
  }

  async pinAndUnpinNotesOntoWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton);
      return this.modPage.wasRemoved(e.sharedNotes);
    }

    await this.userPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(e.restorePresentation);
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('Hello');
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes);

    await this.userPage.hasElement(e.minimizePresentation);
    const notesLocatorUser = getNotesLocator(this.userPage);
    await expect(notesLocator).toContainText(/Hello/, { timeout: 20000 });
    await expect(notesLocatorUser).toContainText(/Hello/);

    // unpin notes
    await this.modPage.waitAndClick(e.unpinNotes);
    await this.modPage.hasElement(e.whiteboard);
    await this.userPage.hasElement(e.whiteboard);
    await startSharedNotes(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes);
    // make viewer as presenter and unpin pinned notes
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.waitAndClick(e.unpinNotes);
    await this.userPage.hasElement(e.whiteboard);
    await this.modPage.hasElement(e.whiteboard);
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
}

exports.SharedNotes = SharedNotes;
