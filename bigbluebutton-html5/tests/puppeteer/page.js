const puppeteer = require('puppeteer');
const helper = require('./helper');
const params = require('./params');
const e = require('./elements');

class Page {
  // Initializes the page
  async init(args) {
    this.browser = await puppeteer.launch(args);
    this.page = await this.browser.newPage();
  }

  // Navigates to a page
  async goto(page) {
    this.page.goto(page);
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

  // Creates a BigBlueButton meeting
  async createBBBMeeting() {
    const meetingID = await helper.createMeeting(params);
    await this.joinBBBMeeting(meetingID);
    return meetingID;
  }

  // Navigates the page to join a BigBlueButton meeting
  async joinBBBMeeting(meetingID) {
    const joinURL = helper.getJoinURL(meetingID, params, true);
    await this.goto(joinURL);
    await this.page.waitForSelector(e.audioDialog, { timeout: 60000 });
  }

  // Joins a BigBlueButton as a listener
  async joinAudioListenOnly() {
    await this.click(e.listenButton);
    console.log('Joined meeting as listener');
  }

  // Joins a BigBlueButton meeting with a microphone
  async joinAudioMicrophone() {
    await this.click(e.microphoneButton);
    await this.click(e.echoYes, true);
    console.log('Joined meeting with microphone');
  }

  // Joins a BigBlueButton meeting without audio
  async joinWithoutAudio() {
    await this.click(e.closeAudio, true);
    console.log('Joined meeting without audio');
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
    await this.page.waitForSelector(element, { timeout: 60000 });
    await this.page.click(element);
  }

  async type(element, text, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.page.waitForSelector(element, { timeout: 60000 });
    await this.page.type(element, text);
  }

  async screenshot(path, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.page.screenshot({ path: 'screenshots/' + path });
  }
}

module.exports = exports = Page;
