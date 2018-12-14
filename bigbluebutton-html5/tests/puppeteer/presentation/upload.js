const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');
const ce = require('../core/elements');

class Upload extends Page {
  constructor() {
    super('presentation-upload');
  }

  async test() {
    await this.waitForSelector(we.whiteboard);
    await this.waitForSelector(e.skipSlide);

    const slides0 = await this.getTestElements();

    await this.click(ce.actions);
    await this.click(e.uploadPresentation);

    await this.waitForSelector(e.fileUpload);
    const fileUpload = await this.page.$(e.fileUpload);
    await fileUpload.uploadFile(`${__dirname}/upload-test.png`);

    await this.click(e.start);
    console.log('\nWaiting for the new presentation to upload...');
    // await this.elementRemoved(e.start);
    await this.page.waitFor(10000);
    console.log('\nPresentation uploaded!');

    await this.screenshot(true);
    const slides1 = await this.getTestElements();

    console.log('\nSlides before presentation upload:');
    console.log(slides0.slideList);
    console.log(slides0.svg);
    console.log('\nSlides after presentation upload:');
    console.log(slides1.slideList);
    console.log(slides1.svg);

    // TODO: Check test
    return true;
  }

  async getTestElements() {
    const slides = {};
    slides.svg = await this.page.evaluate(() => document.querySelector('svg g g g').outerHTML);
    slides.slideList = await this.page.evaluate(skipSlide => document.querySelector(skipSlide).innerHTML, e.skipSlide);
    return slides;
  }
}

module.exports = exports = Upload;
