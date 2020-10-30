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
    
    const svg0 = await this.page.evaluate(async() => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/1') !== -1);

    await this.waitForSelector(e.nextSlide);
    await this.click(e.nextSlide, true);
    await this.waitForSelector(we.whiteboard);
    await this.page.waitFor(1000)
    
    const svg1 = await this.page.evaluate(async() => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/2') !== -1);

    await this.waitForSelector(e.prevSlide);
    await this.click(e.prevSlide, true);
    await this.waitForSelector(we.whiteboard);
    await this.page.waitFor(1000)

    const svg2 = await this.page.evaluate(async() => await document.querySelector('svg g g g').outerHTML.indexOf('/svg/1') !== -1);

    return svg0 === true && svg1 === true && svg2 === true;
  }
}

module.exports = exports = Slide;
