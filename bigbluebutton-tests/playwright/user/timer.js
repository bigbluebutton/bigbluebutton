const { MultiUsers } = require('./multiusers');
const e = require('../core/elements');
const { timeInSeconds } = require('./util');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');

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

    const initialValueStopWatch = await timeInSeconds(timerCurrentLocator);
    const initialValueStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);

    await this.modPage.hasText(e.timerCurrent, /00:00/);
    await this.modPage.waitAndClick(e.startStopTimer);
    await sleep(5000);
    const currentValueStopwatch = await timeInSeconds(timerCurrentLocator);
    const currentValueStopwatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await expect(currentValueStopwatch).toBeGreaterThan(initialValueStopWatch);
    await expect(currentValueStopwatchIndicator).toBeGreaterThan(initialValueStopWatchIndicator);

    await this.modPage.waitAndClick(e.startStopTimer);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.timerCurrent, /00:00/);
    await this.modPage.hasText(e.timerIndicator, /00:00/);

    await this.modPage.waitAndClick(e.timerButton);
    await this.modPage.hasElement(e.timerContainer);
    await this.modPage.getLocator(e.secondsInput).press('Backspace');
    await this.modPage.type(e.secondsInput, '4');
    await this.modPage.waitAndClick(e.startStopTimer);
    await this.modPage.hasText(e.timerCurrent, /00:02/);
    await this.modPage.hasText(e.timerIndicator, /00:02/);

    // await this.modPage.getLocator(e.secondsInput).press('Backspace');
    await this.modPage.type(e.secondsInput, '6');
    await this.modPage.type(e.minutesInput, '2');
    await this.modPage.hasText(e.timerCurrent, /02:44/);
    await this.modPage.hasText(e.timerIndicator, /02:44/);

    const timerInitialValue = await timeInSeconds(timerCurrentLocator);
    await this.modPage.waitAndClick(e.startStopTimer);
    await sleep(5000);
    const timerCurrentValue = await timeInSeconds(timerCurrentLocator);
    await expect(timerInitialValue).toBeGreaterThan(timerCurrentValue);

    await this.modPage.waitAndClick(e.startStopTimer);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);

    await this.modPage.hasText(e.timerCurrent, /00:06/);
    await this.modPage.hasText(e.timerIndicator, /00:06/);

    //Testing Timer Indicator
    const initialValueIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.waitAndClick(e.timerIndicator);
    await sleep(5000);

    const currentValueIndicator = await timeInSeconds(timerIndicatorLocator);
    await expect(initialValueIndicator).toBeGreaterThan(currentValueIndicator);
  }
}

exports.Timer = Timer;
