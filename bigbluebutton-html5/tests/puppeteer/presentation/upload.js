const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');
const ce = require('../core/elements');

class Upload extends Page {
  constructor() {
    super('presentation-upload');
  }

  async test(testName) {
    await this.waitForSelector(we.whiteboard);
    await this.waitForSelector(e.skipSlide);

    const slides0 = await this.getTestElements();

    await this.click(ce.actions);
    await this.click(e.uploadPresentation);

    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `01-before-presentation-upload-[${testName}]`);
    }
    await this.waitForSelector(e.fileUpload);
    const fileUpload = await this.page.$(e.fileUpload);
    await fileUpload.uploadFile(`${__dirname}/upload-test.png`);
    await this.page.waitForFunction(
      'document.querySelector("body").innerText.includes("To be uploaded ...")',
    );
    await this.page.waitForSelector(e.upload);

    await this.page.click(e.upload);
    console.log('\nWaiting for the new presentation to upload...');
    await this.page.waitForFunction(
      'document.querySelector("body").innerText.includes("Converting file")',
    );
    console.log('\nPresentation uploaded!');
    await this.page.waitForFunction(
      'document.querySelector("body").innerText.includes("Current presentation")',
    );
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.screenshot(`${testName}`, `02-after-presentation-upload-[${testName}]`);
    }
    const slides1 = await this.getTestElements();

    console.log('\nSlides before presentation upload:');
    console.log(slides0);
    console.log('\nSlides after presentation upload:');
    console.log(slides1);

    return slides0 !== slides1;
  }

  async getTestElements() {
    const svg = await this.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML);
    console.log(svg);
    return svg;
  }
}

module.exports = exports = Upload;
