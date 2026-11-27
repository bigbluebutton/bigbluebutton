import { expect, type Locator, type Page } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { type ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from './multiusers';
import { timeInSeconds } from './util';

// the timer music is off by default (public.timer.music.enabled)
export const TIMER_MUSIC_CLIENT_SETTINGS_OVERRIDE: ClientSettingsOverrides = {
  public: { timer: { music: { enabled: true } } },
};

// The timer music is an Audio object outside the DOM, so the page records the last play/pause
// call on it, every music element it played and how many times play() was called on each;
// whether the browser lets the sound out (autoplay policy) does not matter here
type TimerMusicWindow = Window & {
  lastTimerMusicCall?: string;
  timerMusicElements?: HTMLMediaElement[];
  timerMusicPlayCalls?: WeakMap<HTMLMediaElement, number>;
};

async function trackTimerMusic(page: Page) {
  await page.evaluate(() => {
    const target = window as TimerMusicWindow;
    target.timerMusicElements = [];
    target.timerMusicPlayCalls = new WeakMap();
    const { play, pause } = HTMLMediaElement.prototype;
    const isMusic = (media: HTMLMediaElement) =>
      media.src.includes('/resources/sounds/') && !media.src.endsWith('/alarm.mp3');
    HTMLMediaElement.prototype.play = function trackedPlay(this: HTMLMediaElement) {
      if (isMusic(this)) {
        target.lastTimerMusicCall = 'play';
        if (!target.timerMusicElements!.includes(this)) target.timerMusicElements!.push(this);
        target.timerMusicPlayCalls!.set(this, (target.timerMusicPlayCalls!.get(this) ?? 0) + 1);
      }
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function trackedPause(this: HTMLMediaElement) {
      if (isMusic(this)) target.lastTimerMusicCall = 'pause';
      return pause.call(this);
    };
  });
}

function lastTimerMusicCall(page: Page) {
  return page.evaluate(() => (window as TimerMusicWindow).lastTimerMusicCall);
}

// Moves the last music element the page played to `secondsBeforeEnd` before the end of the track,
// where the gapless loop restarts it, waits a second and reports what the loop did meanwhile
async function seekTimerMusicNearEnd(page: Page, secondsBeforeEnd: number) {
  const playCallsBefore = await page.evaluate(async (offset) => {
    const target = window as TimerMusicWindow;
    const audio = target.timerMusicElements![target.timerMusicElements!.length - 1];
    if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve, { once: true });
      });
    }
    // counted before the seek: the loop runs on the timeupdate that the seek fires before 'seeked'
    const playCalls = target.timerMusicPlayCalls!.get(audio) ?? 0;
    const seeked = new Promise((resolve) => {
      audio.addEventListener('seeked', resolve, { once: true });
    });
    audio.currentTime = audio.duration - offset;
    await seeked;
    return playCalls;
  }, secondsBeforeEnd);
  await page.waitForTimeout(1000);
  return page.evaluate((before) => {
    const target = window as TimerMusicWindow;
    const audio = target.timerMusicElements![target.timerMusicElements!.length - 1];
    return {
      newPlayCalls: (target.timerMusicPlayCalls!.get(audio) ?? 0) - before,
      paused: audio.paused,
      currentTime: audio.currentTime,
      duration: audio.duration,
    };
  }, playCallsBefore);
}

export class Timer extends MultiUsers {
  async stopwatchTest() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.waitAndClick(e.stopwatch);
    await this.modPage.hasElement(e.stopwatchCurrent, 'should display the timer counter in the sidebar content');

    const timerCurrentLocator = this.modPage.page.locator(e.stopwatchCurrent);
    const timerIndicatorLocator = this.modPage.page.locator(e.timerIndicator);

    // compare initial values of the stopwatch elements with the running ones
    const initialValueStopWatch = await timeInSeconds(timerCurrentLocator);
    const initialValueStopWatchIndicator = await timeInSeconds(timerIndicatorLocator);
    await this.modPage.hasText(e.stopwatchCurrent, /00:00/, 'should display the initial value of the stopwatch');
    await this.clickOnTimerControl();
    await expect
      .poll(() => timeInSeconds(timerCurrentLocator), {
        message: 'should be the current value of the stopwatch timer greater than the initial value',
      })
      .toBeGreaterThan(initialValueStopWatch);
    await expect
      .poll(() => timeInSeconds(timerIndicatorLocator), {
        message: 'should be the current value of the stopwatch indicator greater than the initial value',
      })
      .toBeGreaterThan(initialValueStopWatchIndicator);

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
      expect(b, 'should switch the button color to the same as stopped after resetting the timer').toBeGreaterThan(r);
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
    expect(
      await this.timerInputsInSeconds(),
      'should count down from the 10:30 that was set, not from the default duration',
    ).toBeGreaterThan(600);
    await expect
      .poll(() => timeInSeconds(timerIndicatorLocator), { message: 'should count down on the timer indicator' })
      .toBeLessThan(630);
    expect(
      await timeInSeconds(timerIndicatorLocator),
      'should count down on the timer indicator from the 10:30 that was set',
    ).toBeGreaterThan(600);

    // stopping keeps the remaining time
    await this.clickOnTimerControl(false);
    await this.modPage.hasElementEnabled(e.timerSecondsInput, 'should enable the inputs again after stopping');
    await this.checkTimeIsStopped(timerIndicatorLocator, 'should keep the timer indicator still after stopping it');
    const stoppedInputsValue = await this.timerInputsInSeconds();
    expect(stoppedInputsValue, 'should keep the remaining time on the timer inputs').toBeLessThan(630);
    expect(stoppedInputsValue, 'should keep the remaining time on the timer inputs above 10:00').toBeGreaterThan(600);
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
    expect(
      await timeInSeconds(timerIndicatorLocator),
      'should count down after starting again from the 10:30 it was reset to',
    ).toBeGreaterThan(600);
    await this.modPage.waitAndClick(e.timerIndicator);
    await this.checkStartStopButtonIsStopped(
      'should switch the start/stop button to stopped after clicking on the indicator',
    );
    await this.checkTimeIsStopped(timerIndicatorLocator, 'should stop the timer when clicking on the timer indicator');
  }

  // The Timer test above reads the panel on the moderator's page; this one follows the
  // countdown on the attendee's page as well.
  async timerCountdownForAttendeeTest() {
    await this.userPage.waitForSelector(e.whiteboard);
    await this.openTimerAndStopwatch();
    // opening the panel activates the timer, in countdown mode, for everyone
    await this.modPage.hasElementDisabled(e.timerButton, 'should open the panel in timer mode');
    await this.userPage.hasElement(e.timerIndicator, 'should display the timer indicator for the attendee');

    // presets
    await this.modPage.waitAndClick(e.timerOneMinutePreset);
    await this.checkTimerInputs('00', '01', '00', 'should set the timer inputs to the one-minute preset');
    await this.checkIndicators(/01:00/, 'should display the one-minute preset on the timer indicator');
    await this.modPage.wasRemoved(e.timerFifteenMinutesPreset, 'should display only the first presets');
    await this.modPage.waitAndClick(e.nextTimerPreset);
    await this.modPage.hasElement(e.timerFifteenMinutesPreset, 'should display the next preset');
    await this.modPage.wasRemoved(e.timerOneMinutePreset, 'should scroll the first preset out of view');
    await this.modPage.waitAndClick(e.prevTimerPreset);
    await this.modPage.hasElement(e.timerOneMinutePreset, 'should scroll the first preset back into view');

    // quick add
    await this.modPage.waitAndClick(e.timerAdd30s);
    await this.checkTimerInputs('00', '01', '30', 'should add thirty seconds to the timer inputs');
    await this.checkIndicators(/01:30/, 'should add thirty seconds to the timer indicator');

    // the countdown runs in sync on both pages
    await this.clickOnTimerControl();
    const modIndicatorLocator = this.modPage.page.locator(e.timerIndicator);
    const userIndicatorLocator = this.userPage.page.locator(e.timerIndicator);
    const modStartValue = await timeInSeconds(modIndicatorLocator);
    const userStartValue = await timeInSeconds(userIndicatorLocator);
    expect(modStartValue, 'should start counting down from 01:30 for the moderator').toBeLessThanOrEqual(90);
    expect(userStartValue, 'should start counting down from 01:30 for the attendee').toBeLessThanOrEqual(90);
    expect(
      Math.abs(modStartValue - userStartValue),
      'should display the same countdown for the moderator and the attendee',
    ).toBeLessThanOrEqual(2);
    await expect
      .poll(() => timeInSeconds(modIndicatorLocator), {
        message: 'should count down on the moderator indicator',
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBeLessThanOrEqual(modStartValue - 2);
    await expect
      .poll(() => timeInSeconds(userIndicatorLocator), {
        message: 'should count down on the attendee indicator',
        timeout: ELEMENT_WAIT_TIME,
      })
      .toBeLessThanOrEqual(userStartValue - 2);

    // a short countdown runs out on both pages
    // the panel overwrites its inputs with every time the server sends, so each step waits for it
    await this.modPage.waitAndClick(e.resetTimerStopwatch);
    await this.checkTimerInputs('00', '01', '30', 'should reset the timer inputs to the duration');
    await this.checkIndicators(/01:30/, 'should reset the timer indicator to the duration');
    await this.setTimerInput(e.timerSecondsInput, '5');
    await this.checkIndicators(/01:05/, 'should display the typed seconds on the timer indicator');
    await this.setTimerInput(e.timerMinutesInput, '0');
    await this.checkIndicators(/00:05/, 'should display the five-second countdown on the timer indicator');
    await this.checkTimerInputs('00', '00', '05', 'should display the five-second countdown on the timer inputs');
    await this.clickOnTimerControl();
    // 00:00 shows for about a second, until the server stops the finished timer and resets it
    await Promise.all(
      [this.modPage, this.userPage].map((testPage) =>
        testPage.page.waitForFunction(
          (selector) => document.querySelector(selector)?.textContent?.includes('00:00'),
          e.timerIndicator,
          { polling: 100, timeout: ELEMENT_WAIT_LONGER_TIME },
        ),
      ),
    );
    await this.checkIndicators(/00:05/, 'should reset the timer indicator to the duration once the countdown ran out');
    await this.modPage.hasText(e.startStopTimer, 'Start', 'should stop the timer once the countdown ran out');

    // deactivating removes the timer for everyone
    await this.modPage.waitAndClick(e.deactivateTimer);
    await this.userPage.wasRemoved(e.timerIndicator, 'should remove the timer indicator for the attendee');
    await this.modPage.wasRemoved(e.timerIndicator, 'should remove the timer indicator for the moderator');
  }

  // https://github.com/bigbluebutton/bigbluebutton/issues/26419
  async closesPanelOnDemotion() {
    await this.promoteToModerator();

    const participant = this.userPage.page;
    const pageErrors: string[] = [];
    participant.on('pageerror', (error) => pageErrors.push(error.message));
    await this.userPage.waitAndClick(e.timerStopwatchFeature);
    await expect(participant.locator(e.timerHeader)).toBeVisible();
    await this.userPage.waitAndClick(e.stopwatch);
    await this.userPage.waitAndClick(e.startStopTimer);
    await expect(participant.locator(e.startStopTimer)).toHaveText('Stop');
    const indicator = participant.locator(e.timerIndicator);
    const initialTime = await timeInSeconds(indicator);
    await expect.poll(() => timeInSeconds(indicator)).toBeGreaterThan(initialTime);
    await this.userPage.waitAndClick(e.startStopTimer);
    await expect(participant.locator(e.startStopTimer)).toHaveText('Start');
    const timeBeforeDemotion = await timeInSeconds(indicator);

    await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
    await this.modPage.waitAndClick(e.demoteToViewer);
    await expect(participant.locator(e.timerStopwatchFeature)).toHaveCount(0);
    await expect(participant.locator(e.timerHeader)).toHaveCount(0);
    await expect(participant.locator(e.startStopTimer)).toHaveCount(0);
    await expect(participant.locator(e.sidebarContentMain)).toBeHidden();

    // Closing the controls must not deactivate or reset the meeting's timer.
    await expect(indicator).toBeVisible();
    await expect(this.modPage.page.locator(e.timerIndicator)).toBeVisible();
    expect(await timeInSeconds(indicator)).toBe(timeBeforeDemotion);

    // The controls should work again after promotion, with the shared state preserved.
    await this.modPage.waitAndClick(e.moreOptionsUserItemButton);
    await this.modPage.waitAndClick(e.promoteToModerator);
    await this.userPage.waitAndClick(e.timerStopwatchFeature);
    await expect(participant.locator(e.timerHeader)).toBeVisible();
    await expect(participant.locator(e.startStopTimer)).toHaveText('Start');
    await this.userPage.waitAndClick(e.startStopTimer);
    await expect(participant.locator(e.startStopTimer)).toHaveText('Stop');
    expect(pageErrors, 'role changes should not cause uncaught timer errors').toEqual([]);
  }

  // https://github.com/bigbluebutton/bigbluebutton/issues/26709
  async timerMusicMuteTest() {
    await this.userPage.waitForSelector(e.whiteboard);
    await Promise.all([this.modPage, this.userPage].map((testPage) => trackTimerMusic(testPage.page)));
    await this.openTimerAndStopwatch();
    const modSwitch = this.modPage.page.locator(e.timerMusicSwitch);
    const muteButton = this.userPage.page.locator(e.timerMusicMuteButton);
    const userIndicatorLocator = this.userPage.page.locator(e.timerIndicator);

    await this.modPage.waitAndClick(e.timerMusicSwitch);
    await expect(modSwitch, 'should turn the timer music on').toBeChecked();
    await this.userPage.wasRemoved(
      e.timerMusicMuteButton,
      'should not display the mute button while the timer is stopped',
    );

    await this.clickOnTimerControl();
    await this.userPage.hasElement(e.timerMusicMuteButton, 'should display the mute button while the music plays');
    await expect(muteButton, 'should start with the music not muted').toHaveAttribute('aria-pressed', 'false');
    await expect
      .poll(() => lastTimerMusicCall(this.userPage.page), { message: 'should play the music for the attendee' })
      .toBe('play');

    // the attendee mutes the music with the keyboard, and the timer keeps running
    await muteButton.focus();
    await this.userPage.page.keyboard.press('Enter');
    await expect(muteButton, 'should mark the button as pressed once muted').toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => lastTimerMusicCall(this.userPage.page), { message: 'should pause the music for the attendee' })
      .toBe('pause');
    expect(await lastTimerMusicCall(this.modPage.page), 'should keep the music playing for the moderator').toBe('play');
    // the loop must not restart the music of an attendee who muted it, even near the end of the track
    const mutedNearEnd = await seekTimerMusicNearEnd(this.userPage.page, 0.05);
    await expect
      .soft(muteButton, 'should keep the button pressed near the end of the track')
      .toHaveAttribute('aria-pressed', 'true');
    expect.soft(mutedNearEnd.newPlayCalls, 'should not restart the muted music at the end of the track').toBe(0);
    expect
      .soft(await lastTimerMusicCall(this.userPage.page), 'should leave the muted music paused at the end of the track')
      .toBe('pause');
    expect.soft(mutedNearEnd.paused, 'should keep the muted music element paused').toBe(true);

    const mutedValue = await timeInSeconds(userIndicatorLocator);
    await expect
      .poll(() => timeInSeconds(userIndicatorLocator), { message: 'should keep the timer running while muted' })
      .toBeLessThan(mutedValue);

    // the moderator turns the music off and on while the timer runs
    await this.modPage.hasElementEnabled(
      e.timerMusicSwitch,
      'should let the moderator change the music while the timer runs',
    );
    await this.modPage.waitAndClick(e.timerMusicSwitch);
    await expect(modSwitch, 'should turn the timer music off while the timer runs').not.toBeChecked();
    await expect
      .poll(() => lastTimerMusicCall(this.modPage.page), { message: 'should stop the music for the moderator' })
      .toBe('pause');
    await this.userPage.wasRemoved(e.timerMusicMuteButton, 'should remove the mute button once the music is off');
    // the loop must not restart the retired track (a position other than the one the mute check left it at)
    await expect
      .poll(() => lastTimerMusicCall(this.userPage.page), {
        message: 'should pause the retired track for the attendee',
      })
      .toBe('pause');
    const retiredNearEnd = await seekTimerMusicNearEnd(this.userPage.page, 0.1);
    expect(retiredNearEnd.newPlayCalls, 'should not restart the music after it was turned off').toBe(0);
    expect(retiredNearEnd.paused, 'should keep the music element paused after it was turned off').toBe(true);

    await this.modPage.waitAndClick(e.timerMusicSwitch);
    await expect(modSwitch, 'should turn the timer music on again while the timer runs').toBeChecked();
    await expect
      .poll(() => lastTimerMusicCall(this.modPage.page), { message: 'should resume the music for the moderator' })
      .toBe('play');
    await expect(muteButton, 'should keep the music muted for the attendee').toHaveAttribute('aria-pressed', 'true');
    expect(
      await lastTimerMusicCall(this.userPage.page),
      'should not resume the music for the attendee who muted it',
    ).toBe('pause');

    // the attendee unmutes it
    await muteButton.focus();
    await this.userPage.page.keyboard.press('Space');
    await expect(muteButton, 'should mark the button as not pressed once unmuted').toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect
      .poll(() => lastTimerMusicCall(this.userPage.page), { message: 'should resume the music for the attendee' })
      .toBe('play');
  }

  async openTimerAndStopwatch() {
    await this.modPage.waitForSelector(e.whiteboard);
    await this.modPage.waitAndClick(e.timerStopwatchFeature);
    await this.modPage.hasElement(e.timerHeader, 'should display the timer panel in the sidebar content');
  }

  async checkIndicators(value: RegExp, description: string, timeout: number = ELEMENT_WAIT_TIME) {
    await this.modPage.hasText(e.timerIndicator, value, `${description} for the moderator`, timeout);
    await this.userPage.hasText(e.timerIndicator, value, `${description} for the attendee`, timeout);
  }

  // the panel sends a typed value to the server when the input loses focus
  async setTimerInput(selector: string, value: string) {
    await this.modPage.fill(selector, value);
    await this.modPage.page.locator(selector).blur();
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
  // across a three-second window, which a running counter would exceed.
  async checkTimeIsStopped(locator: Locator, description: string) {
    const valueWhenStopped = await timeInSeconds(locator);
    await this.modPage.page.waitForTimeout(3000);
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
    const backgroundColor = await this.modPage.page
      .locator(e.startStopTimer)
      .evaluate((elem) => getComputedStyle(elem).backgroundColor);
    const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) } : { r: 0, g: 0, b: 0 };
  }
}
