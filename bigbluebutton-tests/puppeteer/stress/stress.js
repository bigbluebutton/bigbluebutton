const Page = require('../core/page');
const params = require('../params');
const c = require('../core/constants');
const ne = require('../notifications/elements');
const ue = require('../user/elements');
const e = require('../core/elements');
const util = require('./util');
const { checkElementLengthEqualTo } = require('../core/util');

class Stress extends Page {
  constructor() {
    super('stress');
  }

  async moderatorAsPresenter(testName) {
    try {
      const maxFailRate = c.JOIN_AS_MODERATOR_TEST_ROUNDS * c.MAX_JOIN_AS_MODERATOR_FAIL_RATE;
      let failureCount = 0;
      for (let i = 1; i <= c.JOIN_AS_MODERATOR_TEST_ROUNDS; i++) {
        await this.init(Page.getArgs(), undefined, { ...params, fullName: `Moderator-${i}` }, undefined, testName);
        await this.closeAudioModal();
        await this.page.waitForSelector(ue.statusIcon, { timeout: c.ELEMENT_WAIT_TIME });
        const hasPresenterClass = await this.page.evaluate(util.checkIncludeClass, ue.statusIcon, e.presenterClassName);
        await this.click(e.actions);
        const canStartPoll = await this.page.evaluate(checkElementLengthEqualTo, ne.polling, 1);
        if (!hasPresenterClass || !canStartPoll) {
          failureCount++;
          await this.screenshot(`${testName}`, `loop-${i}-failure-${testName}`);
        }
        await this.close();
        await this.logger(`Loop ${i} of ${c.JOIN_AS_MODERATOR_TEST_ROUNDS} completed`);
        if (failureCount > maxFailRate) return false;
      }
      return true;
    } catch (err) {
      await this.close();
      this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Stress;