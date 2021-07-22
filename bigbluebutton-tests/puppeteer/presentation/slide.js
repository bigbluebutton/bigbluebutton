const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');

class Slide extends Page {
  constructor() {
    super('presentation-slide');
  }

  async test() {
    await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.waitForSelector(e.presentationToolbarWrapper, ELEMENT_WAIT_TIME);

    const svg0 = await this.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/1') !== -1);

    await this.waitForSelector(e.nextSlide, ELEMENT_WAIT_TIME);
    await this.click(e.nextSlide, true);
    await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
    await this.page.waitFor(1000);

    const svg1 = await this.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/2') !== -1);

    await this.waitForSelector(e.prevSlide, ELEMENT_WAIT_TIME);
    await this.click(e.prevSlide, true);
    await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
    await this.page.waitFor(1000);

    const svg2 = await this.page.evaluate(async () => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/1') !== -1);

    return svg0 === true && svg1 === true && svg2 === true;
  }
}

module.exports = exports = Slide;
