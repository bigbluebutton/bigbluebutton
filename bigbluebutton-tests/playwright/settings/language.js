const Page = require('../core/page');
const { openSettings } = require('./util');
const e = require('../core/elements');

class Language extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async test() {
    for(const locale of e.locales) {
      console.log(`Testing ${locale} locale`);
      await openSettings(this);
      await this.waitForSelector(e.languageSelector);
      const langDropdown = await this.page.$(e.languageSelector);
      await langDropdown.selectOption({ value: locale });
      await this.waitAndClick(e.modalConfirmButton);
    }
  }
}

exports.Language = Language;
