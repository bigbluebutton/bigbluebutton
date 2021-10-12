const Create = require('../breakout/create');
const util = require('./util');

class SharedNotes extends Create {
  constructor() {
    super('shared-notes');
  }

  async test() {
    const response = await util.startSharedNotes(this.page1);
    return response;
  }

  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}
module.exports = exports = SharedNotes;
