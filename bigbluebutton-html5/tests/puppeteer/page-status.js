const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class StatusTestPage extends Page {
  async test() {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();

    await this.screenshot('test-status-0.png', true);
    const status0 = await this.getTestElements();

    await this.click(e.firstUser);
    await this.click(e.setStatus, true);
    await this.click(e.applaud, true);

    await this.screenshot('test-status-1.png', true);
    const status1 = await this.getTestElements();

    await this.click(e.firstUser);
    await this.click(e.setStatus, true);
    await this.click(e.away, true);

    await this.screenshot('test-status-2.png', true);
    const status2 = await this.getTestElements();

    await this.click(e.firstUser);
    await this.click(e.clearStatus, true);

    await this.screenshot('test-status-3.png', true);
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
