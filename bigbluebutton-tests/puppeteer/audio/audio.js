const Page = require('../core/page');
const util = require('./util');

class Audio extends Page {
  constructor() {
    super();
  }

  async test() {
    return util.joinAudio(this);
  }

  async microphone() {
    return util.joinMicrophone(this);
  }
}

module.exports = exports = Audio;
