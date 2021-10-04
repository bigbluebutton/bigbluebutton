const Create = require('../breakout/create');
const util = require('./util');

class SharedNotes extends Create {
  constructor() {
    super();
  }

  async test() {
    const response = await util.startSharedNotes(this.modPage1);
    return response;
  }

  async close() {
    try {
      await this.modPage1.close();
      await this.userPage1.close();
    } catch (e) {
      await this.modPage1.logger(e);
    }
  }
}

module.exports = exports = SharedNotes;
