import { expect } from '@playwright/test';

import { getLocalMicState, startLocalMicWatch, stopLocalMicWatch, type TestWindow } from '../audio/liveKitProbe';
import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { ClientSettingsOverrides } from '../core/page';
import { test } from '../core/setup/fixtures';
import {
  AudioProcessingMode,
  audioProcessingModeOverrides,
  CapturedAudioConstraints,
  captureGetUserMediaAudioConstraints,
  getCapturedAudioConstraints,
} from './audioProcessingMode';

// getAudioConstraints()/getConstraintsForMode() determine the raw getUserMedia
// constraints for 'standard' and 'original'. 'advanced' is verified separately:
// doGUM() overrides the real constraints to the same browser-level filters as
// 'standard' when BBBA/WASM is active ("on top of WASM"), so constraints can't
// tell the two apart - whether the WASM processor file was actually requested
// is the only reliable signal for that mode.
test.describe('Audio processing mode - actual getUserMedia constraints', { tag: ['@ci', '@media'] }, () => {
  test('applies the configured media.audio.microphoneConstraints for Standard filtering', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await captureGetUserMediaAudioConstraints(page);

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    // Mixed, non-uniform values on purpose: an all-true config would be
    // indistinguishable from the browser-default fallback (see the test
    // below), so it wouldn't actually prove the configured object is applied.
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'standard', {
        autoGainControl: false,
        echoCancellation: true,
        noiseSuppression: false,
      }),
    });

    await audioProcessingMode.joinWithMicrophone();

    const captured = await getCapturedAudioConstraints(page);
    const lastConstraints = captured[captured.length - 1];
    expect(lastConstraints).toMatchObject({
      autoGainControl: false,
      echoCancellation: true,
      noiseSuppression: false,
    });
  });

  test('falls back to the browser default for Standard filtering when microphoneConstraints is not configured', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await captureGetUserMediaAudioConstraints(page);

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      // No microphoneConstraints override - media.audio.microphoneConstraints
      // ships commented out, so getConstraintsForMode('standard') must not
      // force any browser-level filter.
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'standard'),
    });

    await audioProcessingMode.joinWithMicrophone();

    const captured = await getCapturedAudioConstraints(page);
    const lastConstraints = captured[captured.length - 1] as CapturedAudioConstraints;
    expect(lastConstraints.autoGainControl).toBeUndefined();
    expect(lastConstraints.echoCancellation).toBeUndefined();
    expect(lastConstraints.noiseSuppression).toBeUndefined();
  });

  test('transmits the raw microphone signal for Original audio', async ({ browser, context, page }, testInfo) => {
    await captureGetUserMediaAudioConstraints(page);

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'original'),
    });

    await audioProcessingMode.joinWithMicrophone();

    const captured = await getCapturedAudioConstraints(page);
    const lastConstraints = captured[captured.length - 1];
    expect(lastConstraints).toMatchObject({
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    });
  });

  test('loads the BBBA/WASM processor for Advanced filtering', async ({ browser, context, page }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.trackWasmProcessorRequests(page);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'advanced'),
    });

    await audioProcessingMode.joinWithMicrophone();

    await expect(async () => {
      expect(audioProcessingMode.wasmProcessorWasLoaded()).toBe(true);
    }).toPass();
  });

  test('applies media.audio.audioWasmProcessing.constraints, not microphoneConstraints, for Advanced filtering', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await captureGetUserMediaAudioConstraints(page);

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.trackWasmProcessorRequests(page);

    // Opposite values on purpose, so whichever config doGUM() actually reads
    // for 'advanced' is unambiguous in the captured constraints.
    const microphoneConstraintsOverride = {
      autoGainControl: true,
      echoCancellation: false,
      noiseSuppression: true,
    };
    const wasmConstraintsOverride = {
      autoGainControl: false,
      echoCancellation: true,
      noiseSuppression: false,
    };

    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(
        true,
        'advanced',
        microphoneConstraintsOverride,
        wasmConstraintsOverride,
      ),
    });

    await audioProcessingMode.joinWithMicrophone();

    await expect(async () => {
      expect(audioProcessingMode.wasmProcessorWasLoaded()).toBe(true);
    }).toPass();

    const captured = await getCapturedAudioConstraints(page);
    const lastConstraints = captured[captured.length - 1];
    expect(lastConstraints).toMatchObject(wasmConstraintsOverride);
    expect(lastConstraints).not.toMatchObject(microphoneConstraintsOverride);
  });

  test('loads the WorkAdventure/DTLN processor for Advanced filtering when configured', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.trackWasmProcessorRequests(page);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(
        true,
        'advanced',
        undefined,
        undefined,
        'workadventureDtln',
      ),
    });

    await audioProcessingMode.joinWithMicrophone();

    await expect(async () => {
      expect(audioProcessingMode.wasmProcessorWasLoaded()).toBe(true);
    }).toPass();

    // Rule out a silent fallback to bbba (which would also flip
    // wasmProcessorWasLoaded() to true via its own .wasm fetch) - confirm
    // at least one observed request is NOT one of BBBA's named files.
    const wasmUrls = audioProcessingMode.getWasmRequestUrls();
    expect(wasmUrls.some((url) => !url.toLowerCase().includes('bbba'))).toBe(true);
  });

  test('forces noiseSuppression off for Advanced filtering with the WorkAdventure/DTLN provider, even if audioWasmProcessing.constraints says otherwise', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    await captureGetUserMediaAudioConstraints(page);

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.trackWasmProcessorRequests(page);
    // Deliberately the opposite of what this provider needs - settings.yml
    // ships audioWasmProcessing.constraints.noiseSuppression: true by
    // default (tuned for BBBA), so this reproduces that exact shipped
    // default rather than a contrived override, to prove the forced
    // constraint - not just a default - is what makes this work.
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(
        true,
        'advanced',
        undefined,
        { echoCancellation: true, autoGainControl: true, noiseSuppression: true },
        'workadventureDtln',
      ),
    });

    await audioProcessingMode.joinWithMicrophone();

    await expect(async () => {
      expect(audioProcessingMode.wasmProcessorWasLoaded()).toBe(true);
    }).toPass();

    const captured = await getCapturedAudioConstraints(page);
    const lastConstraints = captured[captured.length - 1];
    expect(lastConstraints).toMatchObject({
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: false,
    });
  });
});

const hasExactConstraint = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && 'exact' in (value as Record<string, unknown>);

// Overall rationale of this test block: an audio filter change must not
// disturb the microphone publication - i.e.: no mute/unmute state flap.
test.describe('Audio processing mode - publication continuity', { tag: ['@ci', '@media'] }, () => {
  test('keeps the same microphone publication when the processing mode changes', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    test.skip(!isLiveKit, 'publication continuity is specific to the LiveKit audio bridge');

    await captureGetUserMediaAudioConstraints(page);
    await page.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'standard'),
    });

    await audioProcessingMode.joinWithMicrophone();
    await audioProcessingMode.modPage.waitAndClick(e.unmuteMicButton);
    await audioProcessingMode.modPage.hasElement(e.isTalking, 'should be unmuted after clicking unmute');

    const before = await getLocalMicState(page);
    expect(before.micPublications, 'a mic track should be published while unmuted').toBeGreaterThan(0);
    expect(before.allMuted, 'the mic track should be unmuted before the mode change').toBeFalsy();

    // Watch microphone state _across the test_; flapping may occur throughout,
    // so checking start-end is not sufficient.
    await startLocalMicWatch(page);
    await audioProcessingMode.selectProcessingMode('original');
    // Covers the ~5s unpublishOnMute window the spurious mute would arm.
    // The magic 7s may need to be changed if the unpublishOnMute defaults ever change.
    // so be aware if flakiness hits this test in the future.
    await audioProcessingMode.modPage.page.waitForTimeout(7000);
    const samples = await stopLocalMicWatch(page);

    // Guarantee audio mode actually changed
    const captured = (await getCapturedAudioConstraints(page)) as CapturedAudioConstraints[];
    expect(
      captured.some((c) => c && c.echoCancellation === false && c.noiseSuppression === false),
      'the Original-audio constraints should have reached getUserMedia',
    ).toBe(true);

    // Guarantee updateAudioConstraints/mic re-acquisition PINS the deviceId.
    // Not pinning (ie ideal) has been a source of bugs (of the selected device
    // state mismatch sort).
    const reacquired = captured.find((c) => c && c.echoCancellation === false && c.noiseSuppression === false);
    expect(reacquired?.deviceId, 'the re-acquire must pin the active input device').toBeTruthy();
    expect(
      hasExactConstraint(reacquired?.deviceId),
      'the re-acquire must pin the device with `exact`, not a bare/ideal deviceId',
    ).toBe(true);

    expect(samples.length, 'the publication should have been sampled during the change').toBeGreaterThan(0);
    expect(
      samples.filter((sample) => sample.allMuted),
      'the user must never be muted by a processing-mode change',
    ).toEqual([]);
    expect(
      samples.filter((sample) => JSON.stringify(sample.trackSids) !== JSON.stringify(before.trackSids)),
      'the microphone publication must survive a processing-mode change',
    ).toEqual([]);

    await audioProcessingMode.modPage.hasElement(e.muteMicButton, 'the user must still be unmuted');
  });

  test('keeps a muted user muted when the processing mode changes, and unmute still works', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    test.skip(!isLiveKit, 'publication continuity is specific to the LiveKit audio bridge');

    await page.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });

    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      // unpublishOnMute off on purpose: with it on, a muted user's track is gone
      // within ~5s and `micPublications > 0` below would match nothing, making the
      // assertion useless. Keeping the track published is what puts the swap on
      // the muted-and-published path this guards.
      clientSettingsOverrides: {
        ...audioProcessingModeOverrides(true, 'standard'),
        public: {
          ...(audioProcessingModeOverrides(true, 'standard').public as ClientSettingsOverrides),
          media: {
            ...((audioProcessingModeOverrides(true, 'standard').public as ClientSettingsOverrides)
              .media as ClientSettingsOverrides),
            livekit: { audio: { unpublishOnMute: false } },
          },
        },
      },
    });

    await audioProcessingMode.joinWithMicrophone();
    await audioProcessingMode.modPage.hasElement(e.unmuteMicButton, 'should join audio muted');
    // Publish the track, then mute it
    await audioProcessingMode.modPage.waitAndClick(e.unmuteMicButton);
    await audioProcessingMode.modPage.hasElement(e.isTalking, 'should be unmuted after clicking unmute');
    await audioProcessingMode.modPage.waitAndClick(e.muteMicButton);
    await audioProcessingMode.modPage.hasElement(e.unmuteMicButton, 'should be muted again');

    const beforeMuted = await getLocalMicState(page);
    expect(beforeMuted.micPublications, 'the mic track must stay published while muted').toBeGreaterThan(0);
    expect(beforeMuted.allMuted, 'the mic track should be muted before the mode change').toBeTruthy();

    await startLocalMicWatch(page);
    await audioProcessingMode.selectProcessingMode('original');
    await audioProcessingMode.modPage.page.waitForTimeout(7000);
    const samples = await stopLocalMicWatch(page);

    expect(samples.length, 'the publication should have been sampled during the change').toBeGreaterThan(0);
    expect(
      samples.filter((sample) => sample.micPublications > 0 && !sample.allMuted),
      'a muted user must never start sending audio because of a mode change',
    ).toEqual([]);
    await audioProcessingMode.modPage.hasElement(e.unmuteMicButton, 'the user must still be muted');

    await audioProcessingMode.modPage.waitAndClick(e.unmuteMicButton);
    await audioProcessingMode.modPage.hasElement(
      e.isTalking,
      'audio must come back after unmuting',
      ELEMENT_WAIT_LONGER_TIME,
    );
  });
});
