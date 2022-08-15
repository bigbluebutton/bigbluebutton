const Page = require('../../core/page');
const e = require('../../core/elements');
const { openAboutModal } = require('./util');

class About extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async openedAboutModal() {
    await openAboutModal(this);
    await this.hasElement(e.closeModal);
  }
}

exports.About = About;