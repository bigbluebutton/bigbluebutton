const Page = require('../core/page');
const util = require('./util');

class Audio extends Page {
  constructor() {
    super('audio-test');
  }

  async test() {
    return await util.joinAudio(this);
  }

  async microphone() {
    return await util.joinMicrophone(this);
  }
}

module.exports = exports = Audio;
