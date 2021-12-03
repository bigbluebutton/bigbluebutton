const Page = require('../core/page');
const { startSharedNotes } = require('./util');

class SharedNotes extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openSharedNotes() {
    await startSharedNotes(this);
  }
}

exports.SharedNotes = SharedNotes;
