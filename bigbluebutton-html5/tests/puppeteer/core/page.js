require('dotenv').config();
const puppeteer = require('puppeteer');
const yaml = require('js-yaml');
const fs = require('fs');
const fsExtra = require('fs-extra');
const moment = require('moment');
const path = require('path');
const PuppeteerVideoRecorder = require('puppeteer-video-recorder');
const helper = require('./helper');
const params = require('../params');
const { ELEMENT_WAIT_TIME } = require('./constants');
const e = require('./elements');
const ue = require('../user/elements');
const { NETWORK_PRESETS } = require('./profiles');
const audioCapture = `--use-file-for-fake-audio-capture=${path.join(__dirname, '../media/audio.wav')}`;
const videoCapture = `--use-file-for-fake-video-capture=${path.join(__dirname, '../media/video_rgb.y4m')}`;
const devices = require('./devices');
const linuxDesktop = devices['Linux Desktop'];

class Page {
  constructor(name) {
    this.name = name;
    this.screenshotIndex = 0;
    this.meetingId;
    this.parentDir = this.getParentDir(__dirname);
    this.recorder = new PuppeteerVideoRecorder();
  }

  getParentDir(dir) {
    const tmp = dir.split('/');
    tmp.pop();
    return tmp.join('/');
  }

  async getSettingsYaml() {
    try {
      const settings = yaml.load(fs.readFileSync(path.join(__dirname, '../../../private/config/settings.yml'), 'utf8'));
      return settings;
    } catch (e) {
      console.log(e);
    }
  }

  // Join BigBlueButton meeting
  async init(args, meetingId, newParams, customParameter, testFolderName, connectionPreset, deviceX) {
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
      this.page.emulate(deviceX || linuxDesktop);
      await this.getUserAgent(this);

      // Connect to Chrome DevTools
      const client = await this.page.target().createCDPSession();

      // Set throttling property
      await client.send('Network.emulateNetworkConditions', connectionPreset || NETWORK_PRESETS.WiFi);

      // if (process.env.DEVICE_NAME === 'Desktop') {
      //   await this.page.setViewport({ width: 1024, height: 720 });
      // }

      this.page.setDefaultTimeout(3600000);

      // Getting all page console logs
      // this.page.on('console', async msg => console[msg._type](
      //   ...await Promise.all(msg.args().map(arg => arg.jsonValue()))
      // ));

      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US',
      });
      await this.setDownloadBehavior(`${this.parentDir}/downloads`);
      this.meetingId = await helper.createMeeting(params, meetingId, customParameter);
      this.logger('Meeting ID: ', this.meetingId);

      const joinURL = helper.getJoinURL(this.meetingId, this.effectiveParams, isModerator, customParameter);
      await this.page.goto(joinURL, { waitUntil: 'networkidle2' });

      if (process.env.BBB_COLLECT_METRICS === 'true' && process.env.IS_MOBILE !== 'true') {
        await this.waitForSelector(ue.anyUser, ELEMENT_WAIT_TIME);
        await this.getMetrics(testFolderName);
      }
    } catch (e) {
      this.logger(e);
    }
  }

  // Joining audio with microphone
  async joinMicrophone() {
    await this.waitForSelector(e.audioDialog, ELEMENT_WAIT_TIME);
    await this.waitForSelector(e.microphoneButton, ELEMENT_WAIT_TIME);
    await this.click(e.microphoneButton, true);
    await this.waitForSelector(e.connectingStatus, ELEMENT_WAIT_TIME);
    const parsedSettings = await this.getSettingsYaml();
    const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
    await this.waitForSelector(e.echoYes, listenOnlyCallTimeout);
    await this.click(e.echoYes, true);
    await this.waitForSelector(e.isTalking, ELEMENT_WAIT_TIME);
  }

  // Joining audio with microphone
  async joinMicrophoneWithoutEchoTest() {
    await this.waitForSelector(e.joinAudio, ELEMENT_WAIT_TIME);
    await this.click(e.joinAudio, true);
    const parsedSettings = await this.getSettingsYaml();
    const listenOnlyCallTimeout = parseInt(parsedSettings.public.media.listenOnlyCallTimeout);
    await this.waitForSelector(e.leaveAudio, listenOnlyCallTimeout);
    await this.click(e.leaveAudio, ELEMENT_WAIT_TIME);
    await this.waitForSelector(e.disconnectAudio, ELEMENT_WAIT_TIME);
    await this.click(e.disconnectAudio, true);
  }

  // Leave audio
  async leaveAudio() {
    await this.waitForSelector(e.leaveAudio, ELEMENT_WAIT_TIME);
    await this.click(e.leaveAudio, true);
    await this.waitForSelector(e.disconnectAudio, ELEMENT_WAIT_TIME);
    await this.click(e.disconnectAudio, true);
    await this.waitForSelector(e.joinAudio, ELEMENT_WAIT_TIME);
  }

  // Logout from meeting
  async logoutFromMeeting() {
    await this.waitForSelector(e.options, ELEMENT_WAIT_TIME);
    await this.click(e.options, true);
    await this.waitForSelector(e.logout, ELEMENT_WAIT_TIME);
    await this.click(e.logout, true);
  }

  // Joining audio with Listen Only mode
  async listenOnly() {
    await this.waitForSelector(e.audioDialog, ELEMENT_WAIT_TIME);
    await this.waitForSelector(e.listenButton, ELEMENT_WAIT_TIME);
    await this.click(e.listenButton);
  }

  async closeAudioModal() {
    await this.waitForSelector(e.audioDialog, ELEMENT_WAIT_TIME);
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

  async clickBreakoutElement(element, pageNumber) {
    const pageTarget = await this.browser.pages();
    await pageTarget[pageNumber].click(element);
  }

  async returnElement(element) {
    return await document.querySelectorAll(element)[0];
  }

  async getUserAgent(test) {
    const useragent = await test.page.evaluate('navigator.userAgent');
    console.log({ useragent });
    return useragent;
  }

  // Get the default arguments for creating a page
  static getArgs() {
    if (process.env.BROWSERLESS_ENABLED === 'true') {
      const args = [
        '--no-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--window-size=1024,720',
        '--lang=en-US',
      ];
      return {
        headless: true,
        args,
      };
    }
    const args = [
      '--no-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-default-browser-check',
      '--window-size=1150,980',
      audioCapture,
      videoCapture,
      '--allow-file-access',
      '--lang=en-US',
    ];
    return {
      headless: false,
      args,
      defaultViewport: {
        width: 1250,
        height: 850,
      },
      ignoreDefaultArgs: [
        '--enable-automation',
      ],
    };
  }

  static checkRegression(numb) {
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: numb,
        failureThresholdType: 'percent',
      });
    }  
  }

  async isNotVisible(el, timeout) {
    try {
      await this.page.waitForSelector(el, {visible: false, timeout: timeout});
      return true;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  // async emulateMobile(userAgent) {
  //   await this.page.setUserAgent(userAgent);
  // }

  // Returns a Promise that resolves when an element does not exist/is removed from the DOM
  async waitForElementHandleToBeRemoved(element) {
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector(element, { hidden: true });
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

  // Press a keyboard button
  async press(key) {
    await this.page.keyboard.press(key);
  }

  // Press and hold a keyboard button
  async hold(key) {
    await this.page.keyboard.down(key);
  }

  // Release a hold pressed keyboard button
  async release(key) {
    await this.page.keyboard.up(key);
  }

  async click(element, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.waitForSelector(element, ELEMENT_WAIT_TIME);
    await this.page.click(element, true);
  }

  async clickNItem(element, relief = false, n) {
    if (relief) await helper.sleep(1000);
    const elementHandle = await this.page.$$(element);
    await elementHandle[n].click();
  }

  async type(element, text, relief = false) {
    if (relief) await helper.sleep(1000);
    await this.waitForSelector(element, ELEMENT_WAIT_TIME);
    await this.page.type(element, text);
  }

  async startRecording(testName) {
    if (process.env.WITH_RECORD === 'true') {
      const today = moment(new Date()).format('DD-MM-YYYY');
      const finalSaveFolder = path.join(__dirname, `../${process.env.TEST_FOLDER}`);
      if (!fs.existsSync(finalSaveFolder)) {
        fs.mkdirSync(finalSaveFolder);
      }
      this.testNameFolder = `${finalSaveFolder}/test-${today}-${testName}`;
      if (!fs.existsSync(this.testNameFolder)) {
        fs.mkdirSync(this.testNameFolder);
      }
      await this.recorder.init(this.page, `${this.testNameFolder}/recording`);
      await this.recorder.start();
    }
  }

  async stopRecording() {
    if (process.env.WITH_RECORD === 'true') {
      await this.recorder.stop();
      await helper.sleep(5000);
      await this.removeRecordingImages();
    }
  }

  async removeRecordingImages() {
    await fs.unlinkSync(`${this.testNameFolder}/recording/images.txt`);
    await helper.sleep(5000);
    await fsExtra.removeSync(`${this.testNameFolder}/recording/images`);
  }

  async screenshot(testFolderName, testFileName, relief = false) {
    if (process.env.GENERATE_EVIDENCES === 'true') {
      const today = moment(new Date()).format('DD-MM-YYYY');
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
      return testResultsFolder;
    }
  }

  async logger() {
    if (process.env.DEBUG === 'true') {
      const date = moment(new Date()).format('DD-MMM-YYYY HH:mm:ss');
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

  async waitForSelector(element, timeout) {
    await this.page.waitForSelector(element, { timeout });
  }

  async getMetrics(testFolderName) {
    const pageMetricsObj = {};
    const today = moment(new Date()).format('DD-MM-YYYY');
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
    await this.waitForSelector(ue.anyUser, ELEMENT_WAIT_TIME);
    const totalNumberOfUsersMongo = await this.page.evaluate(() => {
      const collection = require('/imports/api/users-persistent-data/index.js');
      const users = collection.default._collection.find({}, {}, {}, {}, {}, { loggedOut: 'false' }).count();
      return users;
    });
    const totalNumberOfUsersDom = await this.page.evaluate(async () => await document.querySelectorAll('[data-test^="userListItem"]').length);
    this.logger({ totalNumberOfUsersDom, totalNumberOfUsersMongo });
    const metric = await this.page.metrics();
    pageMetricsObj.totalNumberOfUsersMongoObj = totalNumberOfUsersMongo;
    pageMetricsObj.totalNumberOfUsersDomObj = totalNumberOfUsersDom;
    pageMetricsObj[`metricObj-${this.meetingId}`] = metric;
    const metricsFile = path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testFolderName}/metrics/metrics-${this.effectiveParams.fullName}-[${this.meetingId}].json`);
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
