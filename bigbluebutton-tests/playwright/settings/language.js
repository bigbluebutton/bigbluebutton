const Page = require('../core/page');
const { openSettings } = require('./util');
const e = require('../core/elements');

class Language extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test(locale) {
    for(let locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      await openSettings(this.page);
      await this.page.waitForSelector('#langSelector');
      const langDropdown = await this.page.$('#langSelector');
      const langOptions = await langDropdown.$$('option');
      await langDropdown.selectOption({ value: locale });
      await this.page.click(e.modalConfirmButton);
    }
  }
}

exports.Language = Language;
