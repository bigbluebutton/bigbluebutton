const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { timeInSeconds } = require('./util');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Timer extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }
  async timerTest() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.timer);
    await this.modPage.waitForSelector(e.timerCurrent);
    const timerCurrentLocator = await this.modPage.getLocator(e.timerCurrent);
    const timerIndicatorLocator = await this.modPage.getLocator(e.timerIndicator);

    const initialValeuStopWatch = await timeInSeconds(timerCurrentLocator);
    console.log(initialValeuStopWatch);
    const initialValeuStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.hasText(e.timerCurrent, /00:00:00/);
    await this.modPage.waitAndClick(e.startStopTimer);
    await sleep(5000);
    const currentValueTimer = await timeInSeconds(timerCurrentLocator);
    console.log(currentValueTimer);
    const currentValueStopwatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await expect(currentValueTimer).toBeGreaterThan(initialValeuStopWatch);
    await expect(currentValueStopwatchIndicator).toBeGreaterThan(initialValeuStopWatchIndicator);
    await this.modPage.waitAndClick(e.resetTimer);
    await this.modPage.hasText(e.timerCurrent, /00:00:00/);
    await this.modPage.hasText(e.timerIndicator, /00:00:00/, ELEMENT_WAIT_LONGER_TIME);

    /*
    const timerIndicatorValue = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.waitAndClick(e.timerIndicator);
    await sleep(5000);
    const timerIndicatorCurrentValue = await timeInSeconds(timerIndicatorLocator);
    await expect(timerIndicatorCurrentValue).toBeGreaterThan(timerIndicatorValue);
    */
    await this.modPage.waitAndClick(e.timerButton);
    await this.modPage.hasText(e.timerCurrent, /00:05:00/);

    await this.modPage.type(e.minutesInput, '6');

  }
}

exports.Timer = Timer;
