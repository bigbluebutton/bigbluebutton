const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { getSettings } = require('../core/settings');
const { startSharedNotes } = require('./util');

class SharedNotes extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openSharedNotes() {
    const { sharedNotesEnabled } = getSettings();
    test.fail(!sharedNotesEnabled, 'Shared notes is disabled');
    await startSharedNotes(this);
  }
}

exports.SharedNotes = SharedNotes;
