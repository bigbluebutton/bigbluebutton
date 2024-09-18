const { MultiUsers } = require('./multiusers');
const { timeInSeconds } = require('./util');
const { expect } = require('@playwright/test');
const { sleep } = require('../core/helpers');
const e = require('../core/elements');

class Timer extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async stopwatchTest() {
    await this.openTimerAndStopwatch();
    const timerCurrentLocator = this.modPage.getLocator(e.timerCurrent);
    const timerIndicatorLocator = this.modPage.getLocator(e.timerIndicator);

    // compare initial values of the stopwatch elements after 2 seconds running
    const initialValueStopWatch = await timeInSeconds(timerCurrentLocator);
    const initialValueStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.hasText(e.timerCurrent, /00:00/);
    await this.clickOnTimerControl();
    await sleep(5000);
    await expect(await timeInSeconds(timerCurrentLocator)).toBeGreaterThan(initialValueStopWatch);
    await expect(await timeInSeconds(timerIndicatorLocator)).toBeGreaterThan(initialValueStopWatchIndicator);

    // stop the stopwatch and check if the values are the same after 2 seconds
    await this.clickOnTimerControl(false);
    const stopWatchValueStopped = await timeInSeconds(timerCurrentLocator);
    const stopWatchIndicatorValueStopped = await timeInSeconds(timerIndicatorLocator);
    await sleep(2000);
    await expect(await timeInSeconds(timerCurrentLocator)).toBe(stopWatchValueStopped);
    await expect(await timeInSeconds(timerCurrentLocator)).toBe(stopWatchIndicatorValueStopped);

    // reset a stopped stopwatch
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.timerCurrent, /00:00/);
    await this.modPage.hasText(e.timerIndicator, /00:00/);

    // reset a running stopwatch and check if the values are reset
    await this.clickOnTimerControl();
    await this.modPage.hasText(e.timerCurrent, /00:02/);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await expect(this.modPage.getLocator(e.startStopTimer)).toHaveAttribute('color', 'danger');
    await this.modPage.hasText(e.timerCurrent, /00:00/);
    await this.modPage.hasText(e.timerIndicator, /00:00/);
  }

  async timerTest() {
    await this.openTimerAndStopwatch();
    await this.modPage.waitAndClick(e.timerButton);
    await this.modPage.hasElement(e.timerCurrent);
    const timerCurrentLocator = this.modPage.getLocator(e.timerCurrent);
    const timerIndicatorLocator = this.modPage.getLocator(e.timerIndicator);

    // check for initial values
    await this.modPage.hasText(e.timerCurrent, /05:00/);
    await this.modPage.hasValue(e.minutesInput, '05');
    await this.modPage.hasValue(e.secondsInput, '00');

    // start timer and check the current values
    await this.clickOnTimerControl();
    await Promise.all([
      this.modPage.hasText(e.timerCurrent, /04:57/),
      this.modPage.hasText(e.timerIndicator, /04:57/),
    ]);

    // change input value and check if the timer is updated
    await this.clickOnTimerControl(false);
    await this.modPage.type(e.secondsInput, '5');
    await this.clickOnTimerControl();
    await Promise.all([
      this.modPage.hasText(e.timerCurrent, /05:02/),
      this.modPage.hasText(e.timerIndicator, /05:02/),
    ]);

    // reset timer and check if the values are set to the previous values
    await this.clickOnTimerControl(false);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await Promise.all([
      this.modPage.hasText(e.timerCurrent, /05:05/),
      this.modPage.hasText(e.timerIndicator, /05:05/),
    ]);

    // check if the timer stops when clicking on the timer indicator
    await this.clickOnTimerControl();
    const timerValueAfterStartingTimer = await timeInSeconds(timerCurrentLocator);
    const timerIndicatorValueAfterStartingTimer = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.waitAndClick(e.timerIndicator);
    await sleep(2000);
    await expect(timerValueAfterStartingTimer).toBe(await timeInSeconds(timerCurrentLocator));
    await expect(timerIndicatorValueAfterStartingTimer).toBe(await timeInSeconds(timerIndicatorLocator));
  }

  async openTimerAndStopwatch() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.hasElement(e.timerCurrent);
  }

  async clickOnTimerControl(isStarting = true) {
    await this.modPage.waitAndClick(e.startStopTimer);
    const expectedColor = isStarting ? 'danger' : 'primary';

    await expect(
      this.modPage.getLocator(e.startStopTimer),
      `should switch the button color after ${isStarting ? 'starting' : 'stopping'} the timer`
    ).toHaveAttribute('color', expectedColor);
  }
}

exports.Timer = Timer;
