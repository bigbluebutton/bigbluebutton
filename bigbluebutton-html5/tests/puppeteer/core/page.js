const puppeteer = require('puppeteer');
const helper = require('./helper');
const params = require('../params');
const e = require('./elements');

class Page {
  constructor(name) {
    this.name = name;
    this.screenshotIndex = 0;
    this.meetingId;
    this.parentDir = this.getParentDir(__dirname);
  }

  getParentDir(dir) {
    const tmp = dir.split('/');
    tmp.pop();
    return tmp.join('/');
  }

  // Join BigBlueButton meeting
  async init(args) {
    this.browser = await puppeteer.launch(args);
    this.page = await this.browser.newPage();

    await this.setDownloadBehavior(`${this.parentDir}/downloads`);

    this.meetingId = await helper.createMeeting(params);
    const joinURL = helper.getJoinURL(this.meetingId, params, true);

    await this.page.goto(joinURL);
    await this.waitForSelector(e.audioDialog);
    await this.click(e.closeAudio, true);
  }

  async setDownloadBehavior(downloadPath) {
    const downloadBehavior = { behavior: 'allow', downloadPath };
    await this.page._client.send('Page.setDownloadBehavior', downloadBehavior);
  }

  // Run the test for the page
  async test() {
  }

  // Closes the page
  async close() {
    await this.browser.close();
  }

  // Gets the DOM elements being tested, as strings
  async getTestElements() {
  }

  // Get the default arguments for creating a page
  static getArgs() {
    return { headless: true, args: ['--no-sandbox', '--use-fake-ui-for-media-stream'] };
  }

  // Returns a Promise that resolves when an element does not exist/is removed from the DOM
  elementRemoved(element) {
    return this.page.waitFor(element => !document.querySelector(element), {}, element);
  }

  // Presses a hotkey (Ctrl, Alt and Shift can be held down while pressing the key)
  async hotkey(key, ctrl, alt, shift) {
    if (ctrl) { await this.page.keyboard.down('Control'); }
    if (alt) { await this.page.keyboard.down('Alt'); }
    if (shift) { await this.page.keyboard.down('Shift'); }

    await this.page.keyboard.press(key);

    if (ctrl) { await this.page.keyboard.up('Control'); }
    if (alt) { await this.page.keyboard.up('Alt'); }
    if (shift) { await this.page.keyboard.up('Shift'); }
  }

  // Presses the Tab key a set number of times
  async tab(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('Tab');
    }
  }

  // Presses the Enter key
  async enter() {
    await this.page.keyboard.press('Enter');
  }

  // Presses the Down Arrow key a set number of times
  async down(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('ArrowDown');
    }
  }

  // Presses the up arrow key a set number of times
  async up(count) {
    for (let i = 0; i < count; i++) {
      await this.page.keyboard.press('ArrowUp');
    }
  }

  async click(element, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.waitForSelector(element);
    await this.page.click(element);
  }

  async type(element, text, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.waitForSelector(element);
    await this.page.type(element, text);
  }

  async screenshot(relief = false) {
    if (relief) await helper.sleep(1000);
    const filename = `${this.name}-${this.screenshotIndex}.png`;
    const path = `${this.parentDir}/screenshots/${filename}`;
    await this.page.screenshot({ path });
    this.screenshotIndex++;
  }

  async paste(element) {
    await this.click(element);
    await this.page.keyboard.down('ControlLeft');
    await this.page.keyboard.press('KeyV');
    await this.page.keyboard.up('ControlLeft');
  }

  async waitForSelector(element) {
    await this.page.waitForSelector(element, { timeout: 0 });
  }
}

module.exports = exports = Page;
