require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
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
  async init(args, meetingId, newParams, customParameter, testFolderName) {
    try {
      this.effectiveParams = newParams || params;
      const isModerator = this.effectiveParams.moderatorPW;
      if (process.env.BROWSERLESS_ENABLED === 'true') {
        this.browser = await puppeteer.connect({
          browserWSEndpoint: `ws://${process.env.BROWSERLESS_URL}?token=${process.env.BROWSERLESS_TOKEN}&${args.args.join('&')}`,
        });
      } else {
        this.browser = await puppeteer.launch(args);
      }
      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(3600000);

      // Getting all page console logs
      // this.page.on('console', async msg => console[msg._type](
      //   ...await Promise.all(msg.args().map(arg => arg.jsonValue()))
      // ));
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US',
      });
      await this.setDownloadBehavior(`${this.parentDir}/downloads`);
      this.logger('before create meeting', customParameter);
      this.meetingId = await helper.createMeeting(params, meetingId, customParameter);
      this.logger('after create meeting', customParameter);

      this.logger('before getJoinURL', customParameter);
      const joinURL = helper.getJoinURL(this.meetingId, this.effectiveParams, isModerator, customParameter);
      this.logger('after getJoinURL', customParameter);

      await this.page.goto(joinURL);
      const checkForGetMetrics = async () => {
        if (process.env.BBB_COLLECT_METRICS === 'true') {
          await this.page.waitForSelector('[data-test^="userListItem"]');
          await this.getMetrics(testFolderName);
        }
      };
      // if (process.env.IS_AUDIO_TEST !== 'true') {
      //   await this.closeAudioModal();
      // }
      await checkForGetMetrics();
    } catch (e) {
      this.logger(e);
    }
  }

  // Joining audio with microphone
  async joinMicrophone() {
    await this.waitForSelector(e.audioDialog);
    await this.waitForSelector(e.microphoneButton);
    await this.click(e.microphoneButton, true);
    await this.waitForSelector(e.connectingStatus);
    await this.waitForSelector(e.echoYes);
    await this.click(e.echoYes, true);
  }

  // Joining audio with microphone
  async joinMicrophoneWithoutEchoTest() {
    await this.waitForSelector(e.audioDialog);
    await this.waitForSelector(e.microphoneButton);
    await this.click(e.microphoneButton, true);
    await this.waitForSelector(e.connectingStatus);
  }

  // Logout from meeting
  async logoutFromMeeting() {
    await this.waitForSelector(e.options);
    await this.click(e.options, true);
    await this.waitForSelector(e.logout);
    await this.click(e.logout, true);
  }

  // Joining audio with Listen Only mode
  async listenOnly() {
    await this.waitForSelector(e.audioDialog);
    await this.waitForSelector(e.listenButton);
    await this.click(e.listenButton);
  }

  async closeAudioModal() {
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
    const args = ['--no-sandbox', '--use-fake-ui-for-media-stream', '--lang=en-US'];
    return { headless: false, args };
  }

  static getArgsWithAudio() {
    if (process.env.BROWSERLESS_ENABLED === 'true') {
      const args = [
        '--no-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--lang=en-US',
      ];
      return {
        headless: false,
        args,
      };
    }
    const args = [
      '--no-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${path.join(__dirname, '../media/audio.wav')}`,
      '--allow-file-access',
      '--lang=en-US',
    ];
    return {
      headless: false,
      args,
    };
  }

  static getArgsWithVideo() {
    if (process.env.BROWSERLESS_ENABLED === 'true') {
      const args = [
        '--no-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--lang=en-US',
      ];
      return {
        headless: false,
        args,
      };
    }
    const args = [
      '--no-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${path.join(__dirname, '../media/video_rgb.y4m')}`,
      '--allow-file-access',
      '--lang=en-US',
    ];
    return {
      headless: false,
      args,
    };
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

  async screenshot(testFolderName, testFileName, relief = false) {
    if (process.env.GENERATE_EVIDENCES === 'true') {
      const today = moment().format('DD-MM-YYYY');
      const dir = path.join(__dirname, `../${process.env.TEST_FOLDER}`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const testResultsFolder = `${dir}/test-${today}-${testFolderName}`;
      if (!fs.existsSync(testResultsFolder)) {
        fs.mkdirSync(testResultsFolder);
      }
      const screenshots = `${testResultsFolder}/screenshots`;
      if (!fs.existsSync(screenshots)) {
        fs.mkdirSync(screenshots);
      }
      if (relief) await helper.sleep(1000);
      const filename = `${testFileName}.png`;
      await this.page.screenshot({ path: `${screenshots}/${filename}` });
      this.screenshotIndex++;
    }
  }

  async logger() {
    if (process.env.DEBUG === 'true') {
      const date = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()} / ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
      const args = Array.prototype.slice.call(arguments);
      args.unshift(`${date} `);
      console.log(...args);
    }
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

  async getMetrics(testFolderName) {
    const pageMetricsObj = {};
    const today = moment().format('DD-MM-YYYY');
    const dir = path.join(__dirname, `../${process.env.TEST_FOLDER}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const testExecutionResultsName = `${dir}/test-${today}-${testFolderName}`;
    if (!fs.existsSync(testExecutionResultsName)) {
      fs.mkdirSync(testExecutionResultsName);
    }
    const metricsFolder = `${testExecutionResultsName}/metrics`;
    if (!fs.existsSync(metricsFolder)) {
      fs.mkdirSync(metricsFolder);
    }
    await this.waitForSelector('[data-test^="userListItem"]');
    const totalNumberOfUsersMongo = await this.page.evaluate(() => {
      const collection = require('/imports/api/users/index.js');
      const users = collection.default._collection.find({ connectionStatus: 'online' }).count();
      return users;
    });
    const totalNumberOfUsersDom = await this.page.evaluate(() => document.querySelectorAll('[data-test^="userListItem"]').length);
    this.logger({ totalNumberOfUsersDom, totalNumberOfUsersMongo });
    const metric = await this.page.metrics();
    pageMetricsObj.totalNumberOfUsersMongoObj = totalNumberOfUsersMongo;
    pageMetricsObj.totalNumberOfUsersDomObj = totalNumberOfUsersDom;
    pageMetricsObj[`metricObj-${this.meetingId}`] = metric;
    const metricsFile = path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testFolderName}/metrics/metrics-${this.effectiveParams.fullName}-${this.meetingId}.json`);
    const createFile = () => {
      try {
        fs.appendFileSync(metricsFile, `${JSON.stringify(pageMetricsObj)},\n`);
      } catch (error) {
        this.logger(error);
      }
    };
    createFile();
  }
}

module.exports = exports = Page;
