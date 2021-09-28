const Create = require('../breakout/create');
const util = require('./util');

class SharedNotes extends Create {
  constructor() {
    super();
  }

  async test() {
    const response = await util.startSharedNotes(this.page1);
    return response;
  }

  async close() {
    try {
      await this.page1.close();
      await this.page2.close();
    } catch (e) {
      await this.page1.logger(e);
    }
  }
}

module.exports = exports = SharedNotes;
