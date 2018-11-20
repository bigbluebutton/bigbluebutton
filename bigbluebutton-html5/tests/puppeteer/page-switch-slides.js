const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class SlideSwitchTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.page.waitFor(e.whiteboard);
    await this.page.waitFor(e.presentationToolbarWrapper);

    await this.screenshot('test-switch-slides-0.png', true);
    const svg0 = await this.getTestElements();

    await this.click(e.nextSlide, true);

    await this.screenshot('test-switch-slides-1.png', true);
    const svg1 = await this.getTestElements();

    await this.click(e.prevSlide, true);

    await this.screenshot('test-switch-slides-2.png', true);
    const svg2 = await this.getTestElements();

    console.log('\nStarting slide:');
    console.log(svg0);
    console.log('\nAfter next slide:');
    console.log(svg1);
    console.log('\nAfter previous slide:');
    console.log(svg2);
  }

  async getTestElements() {
    const svg = await this.page.evaluate(() => document.querySelector('svg g g g').outerHTML);
    return svg;
  }
}

module.exports = exports = SlideSwitchTestPage;
