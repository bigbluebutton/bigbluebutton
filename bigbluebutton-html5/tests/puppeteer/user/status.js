const Page = require('../core/page');
const { chatPushAlerts } = require('../notifications/elements');
const e = require('./elements');
const util = require('./util');

class Status extends Page {
  constructor() {
    super('user-status');
  }

  async test() {
    try {
      await util.setStatus(this, e.applaud);
      const resp1 = await this.page.evaluate(()=>document.querySelectorAll('div[data-test="userAvatar"] > div > i[class="icon-bbb-applause"]').length === 1);
  
      await util.setStatus(this, e.away);
      const resp2 = await this.page.evaluate(()=>document.querySelectorAll('div[data-test="userAvatar"] > div > i[class="icon-bbb-time"]').length === 1);
    
      await this.click(e.firstUser, true);
      await this.click(e.clearStatus, true);

      return resp1 === true && resp2 === true;  
    } catch (e) {
      console.log(e);
      await this.close()
      return false;
    }
  }
}

module.exports = exports = Status;
