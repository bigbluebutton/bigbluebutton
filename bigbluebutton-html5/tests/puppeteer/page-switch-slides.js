const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class SlideSwitchTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.page.waitFor(e.whiteboard);
    await this.page.waitFor(e.presentationToolbarWrapper);
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-switch-slides-0.png' });
    const svg0 = await this.getTestElements();
    await this.page.click(e.nextSlide);
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-switch-slides-1.png' });
    const svg1 = await this.getTestElements();
    await this.page.click(e.prevSlide);
    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-switch-slides-2.png' });
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
