const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');

class Slide extends Page {
  constructor() {
    super('presentation-slide');
  }

  async test() {
    await this.waitForSelector(we.whiteboard);
    await this.waitForSelector(e.presentationToolbarWrapper);

    await this.screenshot(true);
    const svg0 = await this.getTestElements();

    await this.click(e.nextSlide, true);

    await this.screenshot(true);
    const svg1 = await this.getTestElements();

    await this.click(e.prevSlide, true);

    await this.screenshot(true);
    const svg2 = await this.getTestElements();

    console.log('\nStarting slide:');
    console.log(svg0);
    console.log('\nAfter next slide:');
    console.log(svg1);
    console.log('\nAfter previous slide:');
    console.log(svg2);

    // TODO: Check test
    return true;
  }

  async getTestElements() {
    const svg = await this.page.evaluate(() => document.querySelector('svg g g g').outerHTML);
    return svg;
  }
}

module.exports = exports = Slide;
