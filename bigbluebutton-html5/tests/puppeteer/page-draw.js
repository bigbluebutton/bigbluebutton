const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class DrawTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.page.waitFor(e.tools);
    await this.page.click(e.tools);
    await this.page.waitFor(e.rectangle);
    await this.page.click(e.rectangle);
    await this.page.waitFor(e.whiteboard);

    const shapes0 = await this.getTestElements();

    const wb = await this.page.$(e.whiteboard);
    const wbBox = await wb.boundingBox();
    await this.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.page.mouse.down();
    await this.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
    await this.page.mouse.up();

    await helper.sleep(500);
    await this.page.screenshot({ path: 'screenshots/test-draw.png' });
    const shapes1 = await this.getTestElements();

    console.log('\nShapes before drawing box:');
    console.log(shapes0);
    console.log('\nShapes after drawing box:');
    console.log(shapes1);
  }

  async getTestElements() {
    const shapes = await this.page.evaluate(() => document.querySelector('svg g[clip-path]').children[1].outerHTML);
    return shapes;
  }
}

module.exports = exports = DrawTestPage;
