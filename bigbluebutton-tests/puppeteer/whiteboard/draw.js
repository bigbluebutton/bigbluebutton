const Page = require('../core/page');
const e = require('../core/elements');

class Draw extends Page {
  constructor() {
    super();
  }

  async test() {
    try {
      await this.waitForSelector(e.whiteboard);
      await this.waitAndClick(e.tools);
      await this.waitAndClick(e.rectangle);

      const shapes1 = await this.getTestElements();
      const test1 = shapes1 === '<g></g>';

      const wb = await this.page.$(e.whiteboard);
      const wbBox = await wb.boundingBox();
      await this.page.mouse.move(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
      await this.page.mouse.down();
      await this.page.mouse.move(wbBox.x + 0.7 * wbBox.width, wbBox.y + 0.7 * wbBox.height);
      await this.page.mouse.up();

      await this.waitForSelector(e.drawnRectangle);
      const shapes2 = await this.getTestElements();
      const test2 = shapes2 !== '<g></g>';

      return test1 && test2;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async getTestElements() {
    try {
      await this.waitForSelector(e.whiteboardViewBox);
      return this.page.evaluate((selector) => document.querySelector(selector).children[1].outerHTML, e.whiteboardViewBox);
    } catch (err) {
      await this.logger(err);
    }
  }
}

module.exports = exports = Draw;
