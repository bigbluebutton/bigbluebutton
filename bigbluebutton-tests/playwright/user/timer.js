const { MultiUsers } = require('./multiusers');
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
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.waitForSelector(e.timerCurrent);
    const timerCurrentLocator = await this.modPage.getLocator(e.timerCurrent);
    const timerIndicatorLocator = await this.modPage.getLocator(e.timerIndicator);

    const initialValeuStopWatch = await timeInSeconds(timerCurrentLocator);
    const initialValeuStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);

    await this.modPage.hasText(e.timerCurrent, /00:00:00/);
    await this.modPage.waitAndClick(e.startStopTimer);
    await sleep(5000);
    const currentValueStopwatch = await timeInSeconds(timerCurrentLocator);
    const currentValueStopwatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await expect(currentValueStopwatch).toBeGreaterThan(initialValeuStopWatch);
    await expect(currentValueStopwatchIndicator).toBeGreaterThan(initialValeuStopWatchIndicator);

    await this.modPage.waitAndClick(e.startStopTimer);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.timerCurrent, /00:00:00/);
    await this.modPage.hasText(e.timerIndicator, /00:00:00/);

    await this.modPage.waitAndClick(e.timerButton);
    await this.modPage.hasText(e.timerCurrent, /00:05:00/);
    await this.modPage.hasText(e.timerIndicator, /00:05:00/);

    await this.modPage.getLocator(e.minutesInput).press('Backspace');
    await this.modPage.type(e.minutesInput, '6');
    await this.modPage.hasText(e.timerCurrent, /00:06:00/);
    await this.modPage.hasText(e.timerIndicator, /00:06:00/);

    const timerInitialValue = await timeInSeconds(timerCurrentLocator);
    await this.modPage.waitAndClick(e.startStopTimer);
    await sleep(5000);
    const timerCurrentValue = await timeInSeconds(timerCurrentLocator);
    await expect(timerInitialValue).toBeGreaterThan(timerCurrentValue);

    await this.modPage.waitAndClick(e.startStopTimer);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);

    await this.modPage.hasText(e.timerCurrent, /00:06:00/);
    await this.modPage.hasText(e.timerIndicator, /00:06:00/);

    //Testing Timer Indicator
    const initialValueIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.waitAndClick(e.timerIndicator);
    await sleep(5000);

    const currentValueIndicator = await timeInSeconds(timerIndicatorLocator);
    await expect(initialValueIndicator).toBeGreaterThan(currentValueIndicator);
  }
}

exports.Timer = Timer;
