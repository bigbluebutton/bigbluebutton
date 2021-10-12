const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');
const utilWebcam = require('../webcam/util');
const utilScreenshare = require('../screenshare/util');
const utilB = require('../breakout/util');
const { sleep } = require('../core/helper');

class Status extends Page {
  constructor() {
    super('user-status');
  }

  async test() {
    await util.setStatus(this, e.applaud);
    const resp1 = await this.page.evaluate(util.countTestElements, e.applauseIcon);
    await util.setStatus(this, e.away);
    const resp2 = await this.page.evaluate(util.countTestElements, e.awayIcon);

    await this.click(e.firstUser, true);
    await this.waitForSelector(e.clearStatus, ELEMENT_WAIT_TIME);
    await this.click(e.clearStatus, true);
    return resp1 === resp2;
  }

  async mobileTagName() {
    await this.page.waitForSelector(e.userList, ELEMENT_WAIT_TIME);
    await this.page.click(e.userList, true);
    await this.page.waitForSelector(e.firstUser, ELEMENT_WAIT_TIME);

    const response = await this.page.evaluate(util.countTestElements, e.mobileUser) === true;
    return response;
  }

  async findConnectionStatusModal() {
    await util.connectionStatus(this.page);
    const resp = await this.page.evaluate(util.countTestElements, e.connectionStatusModal) === true;
    return resp;
  }

  async disableWebcamsFromConnectionStatus() {
    try {
      await this.closeAudioModal();
      await utilWebcam.enableWebcam(this, ELEMENT_WAIT_LONGER_TIME);
      await util.connectionStatus(this);
      await this.waitForSelector(e.dataSavingWebcams, ELEMENT_WAIT_TIME);
      await this.page.evaluate(utilB.clickTestElement, e.dataSavingWebcams);
      await this.waitForSelector(e.closeConnectionStatusModal, ELEMENT_WAIT_TIME);
      await this.page.evaluate(utilB.clickTestElement, e.closeConnectionStatusModal);
      await sleep(2000);
      const webcamsIsDisabledInDataSaving = await this.page.evaluate(util.countTestElements, e.webcamsIsDisabledInDataSaving) === true;
      return webcamsIsDisabledInDataSaving === true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async disableScreenshareFromConnectionStatus() {
    try {
      await this.closeAudioModal();
      await utilScreenshare.startScreenshare(this);
      await utilScreenshare.waitForScreenshareContainer(this);
      await util.connectionStatus(this);
      await this.waitForSelector(e.dataSavingScreenshare, ELEMENT_WAIT_TIME);
      await this.page.evaluate(utilB.clickTestElement, e.dataSavingScreenshare);
      await this.waitForSelector(e.closeConnectionStatusModal, ELEMENT_WAIT_TIME);
      await this.page.evaluate(utilB.clickTestElement, e.closeConnectionStatusModal);
      await sleep(2000);
      const webcamsIsDisabledInDataSaving = await this.page.evaluate(util.countTestElements, e.screenshareLocked) === true;
      return webcamsIsDisabledInDataSaving === true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async reportUserInConnectionIssues() {
    try {
      await this.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
      await this.joinMicrophone();
      await utilWebcam.enableWebcam(this, ELEMENT_WAIT_LONGER_TIME);
      await utilScreenshare.startScreenshare(this);
      await utilScreenshare.waitForScreenshareContainer(this);
      await util.connectionStatus(this);
      await sleep(5000);
      const connectionStatusItemEmpty = await this.page.evaluate(util.countTestElements, e.connectionStatusItemEmpty) === false;
      const connectionStatusItemUser = await this.page.evaluate(util.countTestElements, e.connectionStatusItemUser) === true;
      return connectionStatusItemUser && connectionStatusItemEmpty;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
module.exports = exports = Status;
