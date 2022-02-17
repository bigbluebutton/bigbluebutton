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
}

module.exports = exports = SharedNotes;
