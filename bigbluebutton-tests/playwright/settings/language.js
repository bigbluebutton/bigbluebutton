const { expect } = require('@playwright/test');
const Page = require('../page');
const util = require('./util');
const elements = require('../elements');

class Language extends Page {

  constructor(browser, page) {
    super(browser, page);
  }

  async test(locale) {
    await util.openSettings(this.page);
    await this.page.waitForSelector('#langSelector');
    const langDropdown = await this.page.$('#langSelector');
    const langOptions = await langDropdown.$$('option');
    await langDropdown.selectOption({ value: locale });
    await this.page.click(elements.modalConfirmButton);
    await util.openSettings(this.page);
  }
}

exports.Language = Language;
