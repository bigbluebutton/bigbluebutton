const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const utilWebcam = require('../webcam/util');
const utilScreenshare = require('../screenshare/util');
const { sleep } = require('../core/helper');
const { checkElementLengthEqualTo, checkElementLengthDifferentTo } = require('../core/util');

class Status extends Page {
  constructor() {
    super();
  }

  async test() {
    try {
      await util.setStatus(this, e.applaud);
      const resp1 = await this.page.evaluate(checkElementLengthDifferentTo, e.applauseIcon, 0);
      await util.setStatus(this, e.away);
      const resp2 = await this.page.evaluate(checkElementLengthDifferentTo, e.awayIcon, 0);

      await this.waitAndClick(e.firstUser);
      await this.waitAndClick(e.clearStatus);
      return resp1 === resp2;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async mobileTagName() {
    try {
      await this.waitAndClick(e.userList);
      await this.waitForSelector(e.firstUser);

      const response = await this.page.evaluate(checkElementLengthDifferentTo, e.mobileUser, 0);
      return response === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async findConnectionStatusModal() {
    try {
      await util.connectionStatus(this);
      const resp = await this.page.evaluate(checkElementLengthDifferentTo, e.connectionStatusModal, 0);
      return resp === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async disableWebcamsFromConnectionStatus() {
    try {
      await utilWebcam.enableWebcam(this, ELEMENT_WAIT_LONGER_TIME);
      await util.connectionStatus(this);
      await this.waitAndClickElement(e.dataSavingWebcams);
      await this.waitAndClickElement(e.closeConnectionStatusModal);
      await sleep(2000);
      const webcamsIsDisabledInDataSaving = await this.page.evaluate(checkElementLengthDifferentTo, e.webcamsIsDisabledInDataSaving, 0);
      return webcamsIsDisabledInDataSaving === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async disableScreenshareFromConnectionStatus() {
    try {
      await utilScreenshare.startScreenshare(this);
      await utilScreenshare.waitForScreenshareContainer(this);
      await util.connectionStatus(this);
      await this.waitAndClickElement(e.dataSavingScreenshare);
      await this.waitAndClickElement(e.closeConnectionStatusModal);
      await sleep(2000);
      const webcamsIsDisabledInDataSaving = await this.page.evaluate(checkElementLengthEqualTo, e.screenshareLocked, 0);
      return webcamsIsDisabledInDataSaving === true;
    } catch (err) {
      await this.logger(err);
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
      const connectionStatusItemEmpty = await this.page.evaluate(checkElementLengthEqualTo, e.connectionStatusItemEmpty, 0);
      const connectionStatusItemUser = await this.page.evaluate(checkElementLengthDifferentTo, e.connectionStatusItemUser, 0);
      return connectionStatusItemUser && connectionStatusItemEmpty;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Status;
