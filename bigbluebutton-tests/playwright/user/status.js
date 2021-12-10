const Page = require('../core/page');
const { setStatus, connectionStatus } = require('./util');
const { waitAndClearNotification } = require('../notifications/util');
const { startScreenshare } = require('../screenshare/util');
const e = require('../core/elements');

class Status extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async changeStatus() {
    await setStatus(this, e.applaud);
    await this.waitForSelector(e.smallToastMsg);
    await this.checkElement(e.applauseIcon);

    await waitAndClearNotification(this);
    await setStatus(this, e.away);
    await this.waitForSelector(e.smallToastMsg);
    await this.checkElement(e.awayIcon);
  }

  async mobileTagName() {
    await this.waitAndClick(e.userList);
    await this.waitForSelector(e.firstUser);
    await this.hasElement(e.mobileUser);
  }

  async connectionStatusModal() {
    await connectionStatus(this);
    await this.hasElement(e.connectionStatusModal);
  }

  async disableScreenshareFromConnectionStatus() {
    await startScreenshare(this);
    await connectionStatus(this);
    await this.waitAndClickElement(e.dataSavingScreenshare);
    await this.waitAndClickElement(e.closeConnectionStatusModal);
    await this.hasElement(e.screenshareLocked);
  }

  async reportUserInConnectionIssues() {
    await connectionStatus(this);
    await this.hasElement(e.connectionStatusItemEmpty);
    await this.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
    await this.wasRemoved(e.connectionStatusItemEmpty);
    await this.hasElement(e.connectionStatusItemUser);
  }
}

exports.Status = Status;
