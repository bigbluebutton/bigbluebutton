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
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }
    await startSharedNotes(this.modPage);
    const sharedNotesContent = await getNotesLocator(this.modPage);
    await expect(sharedNotesContent, 'should the shared notes be editable').toBeEditable({ timeout: ELEMENT_WAIT_TIME });

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async typeInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);
    await this.editMessage(notesLocator);
    const editedMessage = '!Hello';
    await expect(notesLocator, 'should contain the edited text on shared notes').toContainText(editedMessage, { timeout: ELEMENT_WAIT_TIME });

    //! avoiding the following screenshot comparison due to https://github.com/microsoft/playwright/issues/18827
    // const wbBox = await this.modPage.getLocator(e.etherpadFrame);
    // await expect(wbBox).toHaveScreenshot('sharednotes-type.png', {
    //   maxDiffPixels: 100,
    // });

    await notesLocator.press('Control+Z');
    await notesLocator.press('Control+Z');
    await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async formatTextInSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await notesLocator.press('Control+Z');
    await expect(notesLocator, 'should not contain any text on the shared notes').toContainText('');
    await notesLocator.press('Control+Y');
    await expect(notesLocator, 'should contain a message on the shared notes').toContainText(e.message);

    await this.formatMessage(notesLocator);
    const html = await notesLocator.innerHTML();

    const uText = '<u>!</u>';
    await expect(html.includes(uText), 'should include the text "!"').toBeTruthy();

    const bText = '<b>World</b>';
    await expect(html.includes(bText), 'should include the text "World"').toBeTruthy();

    const iText = '<i>Hello</i>'
    await expect(html.includes(iText), 'should include the text "Hello"').toBeTruthy();

    await notesLocator.press('Control+Z'); await notesLocator.press('Control+Z'); await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async exportSharedNotes(testInfo) {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
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
    await checkTextContent(txtFileExtension, 'txt', 'should match the .txt file extension');
    await checkTextContent(txt.content, e.message, 'should the txt content file have the message "Hello World!"');

    //.html checks
    const html = await this.modPage.handleDownload(exportHtmlLocator, testInfo);
    const htmlFileExtension = (html.download._suggestedFilename).split('.').pop();
    await checkTextContent(htmlFileExtension, 'html',  'should match the html file extension');
    await checkTextContent(html.content, e.message, 'should the html content file have the message "Hello World!"');

    //.etherpad checks
    const etherpad = await this.modPage.handleDownload(exportEtherpadLocator, testInfo);
    const etherpadFileExtension = (etherpad.download._suggestedFilename).split('.').pop();    
    await checkTextContent(etherpadFileExtension, 'etherpad',  'should match the etherpad file extension');
    await checkTextContent(etherpad.content, e.message, 'should the etherpad content file have the message "Hello World!"');
    
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label');
  }

  async convertNotesToWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('test');
    await sleep(1000);

    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.sendNotesToWhiteboard);

    await this.modPage.hasText(e.currentSlideText, /test/, 'should the slide contain the text "test" for the moderator', 30000);
    await this.userPage.hasText(e.currentSlideText, /test/,  'should the slide contain the text "test" for the attendee', 20000);

    await notesLocator.press('Control+Z');

    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes label button');
    
  }

  async editSharedNotesWithMoreThanOneUSer() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type(e.message);

    await startSharedNotes(this.userPage);
    const notesLocatorUser = getNotesLocator(this.userPage);
    await notesLocatorUser.press('Delete');
    await notesLocatorUser.type('J');

    await expect(notesLocator, 'should the shared notes contain the text "Jello" for the moderator').toContainText(/Jello/, { timeout: ELEMENT_WAIT_TIME });
    await expect(notesLocatorUser, 'should the shared notes contain the text "Jello" for the attendee').toContainText(/Jello/, { timeout: ELEMENT_WAIT_TIME });
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the moderator');
    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the attendee');
  }

  async seeNotesWithoutEditPermission() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
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
    await expect(notesLocatorUser, 'should the shared notes contain the text "Hello" for the attendee').toContainText(/Hello/, { timeout: 20000 });
    await this.userPage.wasRemoved(e.etherpadFrame);

    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.lockViewersButton);
    await this.modPage.waitAndClickElement(e.lockEditSharedNotes);
    await this.modPage.waitAndClick(e.applyLockSettings);
    
    await this.modPage.waitAndClick(e.hideNotesLabel);
    await this.modPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the moderator');

    await this.userPage.waitAndClick(e.hideNotesLabel);
    await this.userPage.wasRemoved(e.hideNotesLabel, 'should not display the hide notes button for the attendee');
  }

  async pinAndUnpinNotesOntoWhiteboard() {
    const { sharedNotesEnabled } = getSettings();
    if(!sharedNotesEnabled) {
      await this.modPage.hasElement(e.chatButton, 'should display the public chat button');
      return this.modPage.wasRemoved(e.sharedNotes, 'should not display the shared notes button');
    }

    await this.userPage.waitAndClick(e.minimizePresentation);
    await this.userPage.hasElement(e.restorePresentation, 'should display the restore presentation button for the attendee');
    await startSharedNotes(this.modPage);
    const notesLocator = getNotesLocator(this.modPage);
    await notesLocator.type('Hello');
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes, 'should display the unpin notes button');

    await this.userPage.hasElement(e.minimizePresentation, 'should display the minimize presentation button for the attendee');
    const notesLocatorUser = getNotesLocator(this.userPage);
    await expect(notesLocator, 'should display the text "Hello" on the shared notes for the moderator').toContainText(/Hello/, { timeout: 20000 });
    await expect(notesLocatorUser, 'should display the text "Hello" on the shared notes for the attendee').toContainText(/Hello/);

    // unpin notes
    await this.modPage.waitAndClick(e.unpinNotes);
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard for the attendee');
    await startSharedNotes(this.modPage);
    await this.modPage.waitAndClick(e.notesOptions);
    await this.modPage.waitAndClick(e.pinNotes);
    await this.modPage.hasElement(e.unpinNotes, 'should display the unpin notes button for the moderator');
    // make viewer as presenter and unpin pinned notes
    await this.modPage.waitAndClick(e.userListItem);
    await this.modPage.waitAndClick(e.makePresenter);
    await this.userPage.waitAndClick(e.unpinNotes);
    await this.userPage.hasElement(e.whiteboard, 'should display the whiteboard for the attendee');
    await this.modPage.hasElement(e.whiteboard, 'should display the whiteboard for the moderator');
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
