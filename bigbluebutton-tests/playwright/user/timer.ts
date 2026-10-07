import { expect, type Locator } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ELEMENT_WAIT_TIME } from '../core/constants';
import { MultiUsers } from './multiusers';
import { timeInSeconds } from './util';

export class Timer extends MultiUsers {
  async stopwatchTest() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.waitAndClick(e.stopwatch);
    await this.modPage.hasElement(e.stopwatchCurrent, 'should display the timer counter in the sidebar content');

    const timerCurrentLocator = this.modPage.page.locator(e.stopwatchCurrent);
    const timerIndicatorLocator = this.modPage.page.locator(e.timerIndicator);

    // compare initial values of the stopwatch elements after 2 seconds running
    const initialValueStopWatch = await timeInSeconds(timerCurrentLocator);
    const initialValueStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.hasText(e.stopwatchCurrent, /00:00/, 'should display the initial value of the stopwatch');
    await this.clickOnTimerControl();
    await this.modPage.page.waitForTimeout(2000);
    await expect(
      await timeInSeconds(timerCurrentLocator),
      'should be the current value of the stopwatch timer greater than the initial value',
    ).toBeGreaterThan(initialValueStopWatch);
    await expect(
      await timeInSeconds(timerIndicatorLocator),
      'should be the current value of the stopwatch indicator greater than the initial value',
    ).toBeGreaterThan(initialValueStopWatchIndicator);

    // stop the stopwatch and check that both counters stay still
    await this.clickOnTimerControl(false);
    await this.checkTimeIsStopped(timerCurrentLocator, 'should keep the stopwatch timer still after stopping it');
    await this.checkTimeIsStopped(timerIndicatorLocator, 'should keep the stopwatch indicator still after stopping it');

    // reset a stopped stopwatch
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.modPage.hasText(e.stopwatchCurrent, /00:00/, 'should reset the stopwatch timer to its initial value');
    await this.modPage.hasText(e.timerIndicator, /00:00/, 'should reset the stopwatch indicator to its initial value');

    // reset a running stopwatch and check if the values are reset
    await this.clickOnTimerControl();
    await this.modPage.hasText(e.stopwatchCurrent, /00:02/, 'should display 00:02 after 2 seconds');
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await expect(async () => {
      const { r, b } = await this.getStartStopButtonColor();
      // Stopped state uses the primary (blue-dominant) color.
      expect(
        b,
        'should switch the button color to the same as stopped after resetting the timer',
      ).toBeGreaterThan(r);
    }).toPass({ timeout: ELEMENT_WAIT_TIME });
    await this.modPage.hasText(
      e.stopwatchCurrent,
      /00:00/,
      'should display the initial value of the stopwatch timer after reset',
    );
    await this.modPage.hasText(
      e.timerIndicator,
      /00:00/,
      'should display the initial value of the stopwatch indicator after reset',
    );
  }

  async timerTest() {
    await this.openTimerAndStopwatch();
    const timerIndicatorLocator = this.modPage.page.locator(e.timerIndicator);

    // opening the panel activates the timer mode with the default duration (5 minutes)
    await this.modPage.hasElementDisabled(e.timerButton, 'should open the panel in the timer mode');
    await this.checkTimerInputs('00', '05', '00', 'should display the default duration on the timer inputs');
    await this.modPage.hasText(e.timerIndicator, /05:00/, 'should display the default duration on the timer indicator');

    // a preset sets the duration and a quick-add button adds to it
    await this.modPage.waitAndClick(e.timerPreset10min);
    await this.checkTimerInputs('00', '10', '00', 'should set the timer inputs to the selected preset');
    await this.modPage.hasText(e.timerIndicator, /10:00/, 'should set the timer indicator to the selected preset');
    await this.modPage.waitAndClick(e.timerAdd30s);
    await this.checkTimerInputs('00', '10', '30', 'should add 30 seconds to the timer inputs');
    await this.modPage.hasText(e.timerIndicator, /10:30/, 'should add 30 seconds to the timer indicator');

    // a running timer locks the inputs, which show the countdown
    await this.clickOnTimerControl();
    await this.modPage.hasElementDisabled(e.timerHoursInput, 'should disable the hours input while running');
    await this.modPage.hasElementDisabled(e.timerMinutesInput, 'should disable the minutes input while running');
    await this.modPage.hasElementDisabled(e.timerSecondsInput, 'should disable the seconds input while running');
    await expect
      .poll(() => this.timerInputsInSeconds(), { message: 'should count down on the timer inputs' })
      .toBeLessThan(630);
    await expect
      .poll(() => timeInSeconds(timerIndicatorLocator), { message: 'should count down on the timer indicator' })
      .toBeLessThan(630);

    // stopping keeps the remaining time
    await this.clickOnTimerControl(false);
    await this.modPage.hasElementEnabled(e.timerSecondsInput, 'should enable the inputs again after stopping');
    await this.checkTimeIsStopped(timerIndicatorLocator, 'should keep the timer indicator still after stopping it');
    const stoppedInputsValue = await this.timerInputsInSeconds();
    expect(stoppedInputsValue, 'should keep the remaining time on the timer inputs').toBeLessThan(630);
    expect(
      Math.abs(stoppedInputsValue - (await timeInSeconds(timerIndicatorLocator))),
      'should display the same remaining time on the timer inputs and on the indicator',
    ).toBeLessThanOrEqual(1);

    // resetting goes back to the duration that was set before starting
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.checkTimerInputs('00', '10', '30', 'should reset the timer inputs to the duration set before starting');
    await this.modPage.hasText(
      e.timerIndicator,
      /10:30/,
      'should reset the timer indicator to the duration set before starting',
    );

    // the moderator pauses a running timer by clicking on the indicator
    await this.clickOnTimerControl();
    await expect
      .poll(() => timeInSeconds(timerIndicatorLocator), { message: 'should count down after starting again' })
      .toBeLessThan(630);
    await this.modPage.waitAndClick(e.timerIndicator);
    await this.checkStartStopButtonIsStopped(
      'should switch the start/stop button to stopped after clicking on the indicator',
    );
    await this.checkTimeIsStopped(timerIndicatorLocator, 'should stop the timer when clicking on the timer indicator');
  }

  async openTimerAndStopwatch() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.hasElement(e.timerHeader, 'should display the timer panel in the sidebar content');
  }

  async checkTimerInputs(hours: string, minutes: string, seconds: string, description: string) {
    await this.modPage.hasValue(e.timerHoursInput, hours, `${description} (hours)`);
    await this.modPage.hasValue(e.timerMinutesInput, minutes, `${description} (minutes)`);
    await this.modPage.hasValue(e.timerSecondsInput, seconds, `${description} (seconds)`);
  }

  async timerInputsInSeconds() {
    const [hours, minutes, seconds] = await Promise.all(
      [e.timerHoursInput, e.timerMinutesInput, e.timerSecondsInput].map((selector) =>
        this.modPage.page.locator(selector).inputValue(),
      ),
    );
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }

  // A stopped counter must not move. Reading it once right after the stop can
  // catch the last tick before the stop lands, so allow one second of drift
  // across a window that a running counter would exceed.
  async checkTimeIsStopped(locator: Locator, description: string) {
    const valueWhenStopped = await timeInSeconds(locator);
    await this.modPage.page.waitForTimeout(5000);
    expect(Math.abs((await timeInSeconds(locator)) - valueWhenStopped), description).toBeLessThanOrEqual(1);
  }

  async checkStartStopButtonIsStopped(description: string) {
    await expect(async () => {
      const { r, b } = await this.getStartStopButtonColor();
      expect(b, description).toBeGreaterThan(r);
    }).toPass({ timeout: ELEMENT_WAIT_TIME });
  }

  async clickOnTimerControl(isStarting = true) {
    await this.modPage.waitAndClick(e.startStopTimer);

    // The running (Stop) control uses a danger (red-dominant) color and the
    // stopped (Start) control a primary (blue-dominant) one. Assert the
    // dominant channel of the computed background rather than an exact hex or a
    // DOM `color` attribute, so the check stays valid across palette/theme
    // changes and after the migration to the shared button component.
    await expect(async () => {
      const { r, b } = await this.getStartStopButtonColor();
      if (isStarting) {
        expect(r, 'should switch the button to the danger (red) color after starting the timer').toBeGreaterThan(b);
      } else {
        expect(b, 'should switch the button to the primary (blue) color after stopping the timer').toBeGreaterThan(r);
      }
    }).toPass({ timeout: ELEMENT_WAIT_TIME });
  }

  async getStartStopButtonColor() {
    const backgroundColor = await this.modPage.page.locator(e.startStopTimer).evaluate(
      (elem) => getComputedStyle(elem).backgroundColor,
    );
    const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match
      ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
      : { r: 0, g: 0, b: 0 };
  }
}
