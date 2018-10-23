const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class StatusTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();
    await this.page.screenshot({ path: 'screenshots/test-status-0.png' });
    const status0 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.setStatus);
    await this.page.click(e.applaud);
    await helper.sleep(100);
    await this.page.screenshot({ path: 'screenshots/test-status-1.png' });
    const status1 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.setStatus);
    await this.page.click(e.away);
    await helper.sleep(100);
    await this.page.screenshot({ path: 'screenshots/test-status-2.png' });
    const status2 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.clearStatus);
    await helper.sleep(100);
    await this.page.screenshot({ path: 'screenshots/test-status-3.png' });
    const status3 = await this.getTestElements();

    console.log('\nStatus at start of meeting:');
    console.log(status0);
    console.log('\nStatus after status set (applaud):');
    console.log(status1);
    console.log('\nStatus after status change (away):');
    console.log(status2);
    console.log('\nStatus after status clear:');
    console.log(status3);
  }

  async getTestElements() {
    const status = await this.page.evaluate(statusIcon => document.querySelector(statusIcon).innerHTML, e.statusIcon);
    return status;
  }
}

module.exports = exports = StatusTestPage;
