const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class UploadTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.page.waitFor(e.whiteboard);
    await this.page.waitFor(e.skipSlide);

    const slides0 = await this.getTestElements();

    await this.click(e.actions);
    await this.click(e.uploadPresentation);

    await this.page.waitFor(e.fileUpload);
    const fileUpload = await this.page.$(e.fileUpload);
    await fileUpload.uploadFile(`${__dirname}/upload-test.png`);

    await this.click(e.start);
    await this.elementRemoved(e.start);

    await this.screenshot('test-upload.png', true);
    const slides1 = await this.getTestElements();

    console.log('\nSlides before presentation upload:');
    console.log(slides0.slideList);
    console.log(slides0.svg);
    console.log('\nSlides after presentation upload:');
    console.log(slides1.slideList);
    console.log(slides1.svg);
  }

  async getTestElements() {
    const slides = {};
    slides.svg = await this.page.evaluate(() => document.querySelector('svg g g g').outerHTML);
    slides.slideList = await this.page.evaluate(skipSlide => document.querySelector(skipSlide).innerHTML, e.skipSlide);
    return slides;
  }
}

module.exports = exports = UploadTestPage;
