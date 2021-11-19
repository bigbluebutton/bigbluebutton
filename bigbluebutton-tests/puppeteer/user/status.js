const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const Page = require('../core/page');
const e = require('../core/elements');
const util = require('./util');
const utilScreenshare = require('../screenshare/util');
const { sleep } = require('../core/helper');
const { checkElementLengthEqualTo } = require('../core/util');

class Status extends Page {
  constructor() {
    super();
  }

  async test() {
    try {
      await util.setStatus(this, e.applaud);
      const resp1 = await this.hasElement(e.applauseIcon);
      await sleep(1000);
      await util.setStatus(this, e.away);
      const resp2 = await this.hasElement(e.awayIcon);

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

      const response = await this.hasElement(e.mobileUser);
      return response === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async findConnectionStatusModal() {
    try {
      await util.connectionStatus(this);
      const resp = await this.hasElement(e.connectionStatusModal);
      return resp === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async disableScreenshareFromConnectionStatus() {
    try {
      await utilScreenshare.startScreenshare(this);
      await util.connectionStatus(this);
      await this.waitAndClickElement(e.dataSavingScreenshare);
      await this.waitAndClickElement(e.closeConnectionStatusModal);

      const webcamsIsDisabledInDataSaving = await this.hasElement(e.screenshareLocked);
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
      await this.shareWebcam(true, ELEMENT_WAIT_LONGER_TIME);
      await utilScreenshare.startScreenshare(this);
      await util.connectionStatus(this);
      await sleep(5000);
      const connectionStatusItemEmpty = await this.page.evaluate(checkElementLengthEqualTo, e.connectionStatusItemEmpty, 0);
      const connectionStatusItemUser = await this.hasElement(e.connectionStatusItemUser);
      return connectionStatusItemUser && connectionStatusItemEmpty;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Status;
