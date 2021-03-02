const { ELEMENT_WAIT_TIME } = require('../core/constants');
const Page = require('../core/page');
const e = require('./elements');

class Draw extends Page {
  constructor() {
    super('whiteboard-draw');
  }

  async test() {
    try {
      await this.waitForSelector(e.tools, ELEMENT_WAIT_TIME);
      await this.click(e.tools, true);
      await this.waitForSelector(e.rectangle, ELEMENT_WAIT_TIME);
      await this.click(e.rectangle, true);
      await this.waitForSelector(e.whiteboard, ELEMENT_WAIT_TIME);

      const shapes0 = await this.getTestElements();
      shapes0 === '<g></g>';

      const wb = await this.page.$(e.whiteboard);
      const wbBox = await wb.boundingBox();
      await this.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
      await this.page.mouse.down();
      await this.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
      await this.page.mouse.up();

      await this.waitForSelector(e.drawnRectangle, ELEMENT_WAIT_TIME);
      const shapes1 = await this.getTestElements();
      shapes1 !== '<g></g>';
      return true;
    } catch (e) {
      await this.logger(e);
      return false;
    }
  }

  async getTestElements() {
    await this.waitForSelector('g[clip-path="url(#viewBox)"]', ELEMENT_WAIT_TIME);
    const shapes = await this.page.evaluate(() => document.querySelector('svg g[clip-path]').children[1].outerHTML);
    return shapes;
  }
}

module.exports = exports = Draw;
