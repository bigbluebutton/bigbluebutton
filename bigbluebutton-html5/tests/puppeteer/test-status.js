// Test: Setting/changing/clearing a user's status

const Page = require('./page');
const helper = require('./helper');
const e = require('./elements');

class StatusTestPage extends Page
{
  async test()
  {
    await this.createBBBMeeting();
    await this.joinWithoutAudio();
    await this.page.screenshot({path: "screenshots/test-status-0.png"});
    var status0 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.setStatus);
    await this.page.click(e.applaud);
    await helper.sleep(100);
    await this.page.screenshot({path: "screenshots/test-status-1.png"});
    var status1 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.setStatus);
    await this.page.click(e.away);
    await helper.sleep(100);
    await this.page.screenshot({path: "screenshots/test-status-2.png"});
    var status2 = await this.getTestElements();

    await this.page.click(e.firstUser);
    await this.page.click(e.clearStatus);
    await helper.sleep(100);
    await this.page.screenshot({path: "screenshots/test-status-3.png"});
    var status3 = await this.getTestElements();

    console.log("\nStatus at start of meeting:");
    console.log(status0);
    console.log("\nStatus after status set (applaud):");
    console.log(status1);
    console.log("\nStatus after status change (away):");
    console.log(status2);
    console.log("\nStatus after status clear:");
    console.log(status3);
  }

  async getTestElements()
  {
    var status = await this.page.evaluate((statusIcon) => {return document.querySelector(statusIcon).innerHTML;}, e.statusIcon);
    return status;
  }
};

var test = new StatusTestPage();
(async() =>
{
  try
  {
    await test.init(Page.getArgs());
    await test.test();
    await test.close();
  }
  catch(e)
  {
    console.log(e);
    process.exit(1);
  }
})();