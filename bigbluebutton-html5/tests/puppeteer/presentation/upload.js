const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');
const ce = require('../core/elements');

class UploadTestPage extends Page {
  constructor() {
    super('presentation-upload');
  }

  async test() {
    await this.page.waitFor(we.whiteboard);
    await this.page.waitFor(e.skipSlide);

    const slides0 = await this.getTestElements();

    await this.click(ce.actions);
    await this.click(e.uploadPresentation);

    await this.page.waitFor(e.fileUpload);
    const fileUpload = await this.page.$(e.fileUpload);
    await fileUpload.uploadFile(`${__dirname}/upload-test.png`);

    await this.click(e.start);
    await this.elementRemoved(e.start);

    await this.screenshot(true);
    const slides1 = await this.getTestElements();

    console.log('\nSlides before presentation upload:');
    console.log(slides0.slideList);
    console.log(slides0.svg);
    console.log('\nSlides after presentation upload:');
    console.log(slides1.slideList);
    console.log(slides1.svg);

    // TODO: Check test
    return true
  }

  async getTestElements() {
    const slides = {};
    slides.svg = await this.page.evaluate(() => document.querySelector('svg g g g').outerHTML);
    slides.slideList = await this.page.evaluate(skipSlide => document.querySelector(skipSlide).innerHTML, e.skipSlide);
    return slides;
  }
}

module.exports = exports = UploadTestPage;
