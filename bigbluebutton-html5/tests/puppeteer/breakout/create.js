const Page = require('../core/page');
const params = require('../params');
const moment = require('moment');
const path = require('path');
const util = require('./util');
const be = require('./elements');
const we = require('../webcam/elements');
const e = require('../core/elements');
const { element } = require('prop-types');
const today = moment().format('DD-MM-YYYY');

class Create {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'Moderator1' }, undefined);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, undefined);
  }

  // Create Breakoutrooms
  async create(testName) {
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page02-initialized-${testName}`);
    this.page1.logger('page01 initialized');
    this.page2.logger('page02 initialized');
    await this.page1.page.evaluate(util.clickTestElement, be.manageUsers);
    await this.page1.page.evaluate(util.clickTestElement, be.createBreakoutRooms);
    this.page1.logger('page01 breakout rooms menu loaded');
    await this.page1.screenshot(`${testName}`, `02-page01-creating-breakoutrooms-${testName}`);
    await this.page1.waitForSelector(be.randomlyAssign);
    await this.page1.page.evaluate(util.clickTestElement, be.randomlyAssign);
    this.page1.logger('page01 randomly assigned  users');
    await this.page1.screenshot(`${testName}`, `03-page01-randomly-assign-user-${testName}`);
    await this.page1.waitForSelector(be.modalConfirmButton);
    await this.page1.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    this.page1.logger('page01 breakout rooms creation confirmed');
    await this.page1.screenshot(`${testName}`, `04-page01-confirm-breakoutrooms-creation-${testName}`);
    await this.page2.waitForSelector(be.modalConfirmButton);
    await this.page2.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    this.page2.logger('page02 breakout rooms join confirmed');
    await this.page2.screenshot(`${testName}`, `02-page02-accept-invite-breakoutrooms-${testName}`);
    const page2 = await this.page2.browser.pages();
    await page2[2].bringToFront();
    this.page2.logger('before closing audio modal');
    await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/03-breakout-page02-before-closing-audio-modal.png`)});
    await this.page2.waitForBreakoutElement('button[aria-label="Close Join audio modal"]', 2);
    await this.page2.clickBreakoutElement('button[aria-label="Close Join audio modal"]', 2);
    await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/04-breakout-page02-after-closing-audio-modal.png`)});
    this.page2.logger('audio modal closed');
  }

  // Check if Breakoutrooms have been created
  async testCreatedBreakout(testName) {
    const resp = await this.page1.page.evaluate(() => document.querySelectorAll('div[data-test="breakoutRoomsItem"]').length !== 0);
    if (resp === true) {
      await this.page1.screenshot(`${testName}`, `05-page01-success-${testName}`);
      return true;
    };
    await this.page1.screenshot(`${testName}`, `05-page01-fail-${testName}`);
    return false;
  }

  // Initialize a Moderator session
  async joinWithUser3(testName) {
    if(testName == 'joinBreakoutroomsWithAudio') {
      await this.page3.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
            
      const page3 = await this.page3.browser.pages();

      await page3[2].waitForSelector('button[aria-label="Microphone"]');
      // await this.page3.waitForBreakoutElement('button[aria-label="Microphone"]', 2);
      await this.page3.clickBreakoutElement('button[aria-label="Microphone"]', 2);
      await page3[2].waitForSelector('div[class^="connecting--"]');
      // await this.page3.waitForBreakoutElement('div[class^="connecting--"]', 2);
      await page3[2].waitForSelector('button[aria-label="Echo is audible"]');
      // await this.page3.waitForBreakoutElement('button[aria-label="Echo is audible"]', 2);
      await this.page3.clickBreakoutElement('button[aria-label="Echo is audible"]', 2);

      console.log('with audio');

      this.page2.logger('before pages check');
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      await page2[2].waitForSelector('[data-test="isTalking"]');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const foundTalkingIndicatorElement = await document.querySelectorAll('[data-test="isTalking"]').length !== 0;
        return foundUserElement && foundTalkingIndicatorElement;
      });
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-success.png`)});
      this.page2.logger('after pages check');
      return resp;
    } else if (testName == 'joinBreakoutroomsWithVideo') {
      await this.page3.init(Page.getArgsWithVideo(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      const page3 = await this.page3.browser.pages();
      await page3[2].bringToFront();
      
      await page3[2].waitForSelector('button[aria-label="Share webcam"]');
      // await this.page3.waitForBreakoutElement('button[aria-label="Share webcam"]', 2);
      await this.page3.clickBreakoutElement('button[aria-label="Share webcam"]', 2);
      await page3[2].waitForSelector('video[id="preview"]');
      // await this.page3.waitForBreakoutElement('video[id="preview"]', 2);
      await page3[2].waitForSelector('button[aria-label="Start sharing"]');
      // await this.page3.waitForBreakoutElement('button[aria-label="Start sharing"]', 2);
      await this.page3.clickBreakoutElement('button[aria-label="Start sharing"]', 2);

      console.log('with video');

      this.page2.logger('before pages check');
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      await page2[2].waitForSelector('div[class^="videoListItem"]');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const webcamContainerElement = await document.querySelectorAll('div[class^="videoListItem"]').length !== 0;
        return foundUserElement && webcamContainerElement;
      });
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`)});
      this.page2.logger('after pages check');
      return resp;
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      const page2 = await this.page2.browser.pages();
      const page3 = await this.page3.browser.pages();
      await this.page3.waitForSelector('span[class^="usersAssignedNumberLabel"]');
      const respCountUsers = await this.page3.page.evaluate(async ()=> 
        await document.querySelectorAll('span[class^="usersAssignedNumberLabel"]')[0].innerText.includes('2') === true
      );

      console.log('with screenshare');

      await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      await page3[2].evaluate(async ()=> {
        await document.querySelectorAll('div[aria-label^="Moderator3"]')[0].click();
        await document.querySelectorAll('div[aria-label^="Take presenter"]')[0].click();
      });
      await page3[2].waitForSelector('button[aria-label="Share your screen"]');
      await this.page3.clickBreakoutElement('button[aria-label="Share your screen"]', 2);
      await page3[2].on('dialog',async dialog => {
        await dialog.accept();
      });

      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        return foundUserElement;
      });

      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-success.png`)});
      return resp && respCountUsers;
    } else {
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      const page3 = await this.page3.browser.pages();
      await page3[2].evaluate(util.clickTestElement, be.breakoutJoin);
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      
      console.log('with nothing');

      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        return foundUserElement;
      });

      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-success.png`)});
      return resp;
    }
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = Create;
