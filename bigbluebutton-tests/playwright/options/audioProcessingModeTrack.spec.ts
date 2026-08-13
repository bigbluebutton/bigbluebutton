import { expect } from '@playwright/test';

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
});
