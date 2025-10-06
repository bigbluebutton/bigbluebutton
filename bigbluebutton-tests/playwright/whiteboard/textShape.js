const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { MultiUsers } = require('../user/multiusers');
const { snapshotComparison } = require('./util');

class TextShape extends MultiUsers {
  async typeText() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // select the text
    await this.modPage.waitAndClick(e.wbTextShape);
    // type on the whiteboard
    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.press('A');
    await this.modPage.press('A');
    await this.modPage.press('Backspace');
    await this.modPage.press('B');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);
    // check if the text is drawn
    await this.modPage.hasElement(e.wbTextTrue, 'should display the text shape for the moderator');
    await this.userPage.hasElement(e.wbTextTrue, 'should display the text shape for the viewer');
    await this.modPage.hasText(e.wbTextTrue, 'AB', 'should text content be "AB" for the moderator');
    await this.userPage.hasText(e.wbTextTrue, 'AB', 'should text content be "AB" for the viewer');
    await snapshotComparison(this.modPage, this.userPage, 'text');
  }

  async stickyNote() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // select the sticky note
    await this.modPage.waitAndClick(e.wbStickyNoteShape);
    // type on the sticky note
    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    await this.modPage.press('A');
    await this.modPage.press('A');
    await this.modPage.press('Backspace');
    await this.modPage.press('B');
    await this.modPage.page.mouse.click(wbBox.x + 0.6 * wbBox.width, wbBox.y + 0.6 * wbBox.height);
    // check if the sticky note is drawn
    await this.modPage.hasElement(e.wbTypedStickyNote, 'should display the sticky note for the moderator');
    await this.userPage.hasElement(e.wbTypedStickyNote, 'should display the sticky note for the viewer');
    await this.modPage.hasText(e.wbTypedStickyNote, 'AB', 'should sticky note text content be "AB" for the moderator');
    await this.userPage.hasText(e.wbTypedStickyNote, 'AB', 'should sticky note text content be "AB" for the viewer');
    await snapshotComparison(this.modPage, this.userPage, 'sticky');
  }

  async realTimeTextTyping() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard);
    const modWbLocator = this.modPage.getLocator(e.whiteboard);
    const wbBox = await modWbLocator.boundingBox();
    // select the text
    await this.modPage.waitAndClick(e.wbTextShape);
    await this.modPage.page.mouse.click(wbBox.x + 0.3 * wbBox.width, wbBox.y + 0.3 * wbBox.height);
    // type "A"
    await this.modPage.press('A');
    await this.modPage.hasElement(e.wbTextTrue, 'should display the text shape for the moderator');
    await this.userPage.hasElement(e.wbTextTrue, 'should display the text shape for the viewer');
    await this.modPage.hasText(e.wbTextTrue, 'A', 'should text content be "A" for the moderator');
    await this.userPage.hasText(e.wbTextTrue, 'A', 'should text content be "A" for the viewer');
    // type "B"
    await this.modPage.press('B');
    await this.modPage.hasText(e.wbTextTrue, 'AB', 'should text content be "AB" for the moderator');
    await this.userPage.hasText(e.wbTextTrue, 'AB', 'should text content be "AB" for the viewer');
    // type "123"
    await this.modPage.press('1');
    await this.modPage.press('2');
    await this.modPage.press('3');
    await this.modPage.hasText(e.wbTextTrue, 'AB123', 'should text content be "AB123" for the moderator');
    await this.userPage.hasText(e.wbTextTrue, 'AB123', 'should text content be "AB123" for the viewer');
    await snapshotComparison(this.modPage, this.userPage, 'realtime-text');
  }
}

exports.TextShape = TextShape;
