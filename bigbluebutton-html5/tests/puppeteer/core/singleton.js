const puppeteer = require('puppeteer');
const Page = require('./page');

class BrowserlessSingleton {
  constructor() {
    this.page = new Page();
  }

  async init() {
    return puppeteer.connect({
      browserWSEndpoint: `ws://${process.env.BROWSERLESS_URL}?token=${process.env.BROWSERLESS_TOKEN}&${Page.getArgs().args.join('&')}`,
    });
  }
}

module.exports = exports = BrowserlessSingleton;
