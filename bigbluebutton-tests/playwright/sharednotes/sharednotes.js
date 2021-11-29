const Page = require('../core/page');
// const Create = require('../breakout/create');
const util = require('./util');

class SharedNotes extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openSharedNotes() {
    await util.startSharedNotes(this);
  }
}

module.exports = exports = SharedNotes;
