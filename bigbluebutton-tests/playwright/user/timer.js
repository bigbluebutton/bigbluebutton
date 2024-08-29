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
    await this.modPage.hasText(e.timerCurrent, /00:00/, 'should display the initial value of the stopwatch');
    await this.clickOnTimerControl();
    await sleep(2000);
    await expect(
      await timeInSeconds(timerCurrentLocator),
      'should be the current value of the stopwatch timer greater than the initial value'
    ).toBeGreaterThan(initialValueStopWatch);
    await expect(
      await timeInSeconds(timerIndicatorLocator),
      'should be the current value of the stopwatch indicator greater than the initial value'
    ).toBeGreaterThan(initialValueStopWatchIndicator);

    // stop the stopwatch and check if the values are the same after 2 seconds
    await this.clickOnTimerControl(false);
    const stopWatchValueStopped = await timeInSeconds(timerCurrentLocator);
    const stopWatchIndicatorValueStopped = await timeInSeconds(timerIndicatorLocator);
    await sleep(2000);
    await expect(
      await timeInSeconds(timerCurrentLocator),
      'should be the current value of the stopwatch timer equals the value when stopped after 2 seconds'
    ).toBe(stopWatchValueStopped);
    await expect(
      await timeInSeconds(timerCurrentLocator),
      'should be the current value of the stopwatch indicator equals the value when stopped after 2 seconds'
    ).toBe(stopWatchIndicatorValueStopped);

    // reset a stopped stopwatch
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.timerCurrent, /00:00/, 'should reset the stopwatch timer to its initial value');
    await this.modPage.hasText(e.timerIndicator, /00:00/, 'should reset the stopwatch indicator to its initial value');

    // reset a running stopwatch and check if the values are reset
    await this.clickOnTimerControl();
    await this.modPage.hasText(e.timerCurrent, /00:02/, 'should display 00:02 after 2 seconds');
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await expect(
      this.modPage.getLocator(e.startStopTimer),
      `should switch the button color to the same as stopped after resetting the timer`
    ).toHaveAttribute('color', 'primary');
    await this.modPage.hasText(e.timerCurrent, /00:00/, 'should display the initial value of the stopwatch timer after reset');
    await this.modPage.hasText(e.timerIndicator, /00:00/, 'should display the initial value of the stopwatch indicator after reset');
  }

  async timerTest() {
    await this.openTimerAndStopwatch();
    await this.modPage.waitAndClick(e.timerButton);
    await this.modPage.hasElement(e.timerContainer, 'should display the timer container');
    const timerCurrentLocator = this.modPage.getLocator(e.timerCurrent);
    const timerIndicatorLocator = this.modPage.getLocator(e.timerIndicator);

    // check for initial values
    await this.modPage.hasText(e.timerCurrent, /00:00/, 'should display the timer current to contain the value "00:00"');
    await this.modPage.hasValue(e.minutesInput, '5', 'should display the initial minutes input to contain the value "5"');

    // start timer and check the current values
    await this.modPage.getLocator(e.secondsInput).press('Backspace');
    await this.modPage.type(e.secondsInput, '4');
    await this.clickOnTimerControl();
    await this.modPage.hasText(e.timerCurrent, /05:00/, 'should display the starting value on the timer current');
    await this.modPage.hasText(e.timerIndicator, /04:58/, 'should display the starting value on the timer indicator (2 seconds delay expected)');

    // change input value and check if the timer is updated
    await this.clickOnTimerControl(false);
    await this.modPage.getLocator(e.secondsInput).press('Backspace');
    await this.modPage.type(e.secondsInput, '50');
    await this.clickOnTimerControl();
    await this.modPage.hasText(e.timerCurrent, /05:44/, 'should display an increased value on the timer current after a while running');
    await this.modPage.hasText(e.timerIndicator, /05:42/, 'should display an increased value on the timer indicator after a while running (2 seconds delay expected)');

    // reset an active timer and check if the values are set to the previous values
    await this.clickOnTimerControl();
    await sleep(2000);
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.timerCurrent, /05:50/, 'should display the same timer current value as the last time it was started when resetting');
    await this.modPage.hasText(e.timerIndicator, /05:50/, 'should display the same timer indicator value as the last time it was started when resetting');

    // check if the timer stops when clicking on the timer indicator
    await this.clickOnTimerControl();
    const timerValueAfterStartingTimer = await timeInSeconds(timerCurrentLocator);
    const timerIndicatorValueAfterStartingTimer = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.waitAndClick(e.timerIndicator);
    await sleep(2000);
    await expect(
      timerValueAfterStartingTimer,
      'should stop the timer when clicking on the timer indicator'
    ).toBe(await timeInSeconds(timerCurrentLocator));
    await expect(
      timerIndicatorValueAfterStartingTimer,
      'should stop the timer when clicking on the timer indicator'
    ).toBe(await timeInSeconds(timerIndicatorLocator));
  }

  async openTimerAndStopwatch() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.actions);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.hasElement(e.timerCurrent, 'should display the timer counter in the sidebar content');
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
