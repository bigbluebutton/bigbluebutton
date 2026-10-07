import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import {
  AudioProcessingMode,
  audioProcessingModeOverrides,
  AudioProcessingModeValue,
  showAudioFiltersOverride,
} from './audioProcessingMode';

const RADIO_BY_MODE: Record<AudioProcessingModeValue, string> = {
  advanced: e.advancedFilteringRadio,
  standard: e.standardFilteringRadio,
  original: e.originalAudioRadio,
};

interface Scenario {
  wasmEnabled: boolean;
  processingMode: AudioProcessingModeValue;
  expectedSelected: AudioProcessingModeValue;
}

// getDefaultAudioProcessingMode() (bridge/service.js): defaultSettings.audio.
// processingMode is used as-is, EXCEPT 'advanced' falls back to 'standard'
// when media.audio.audioWasmProcessing.enabled is false - the only case
// where expectedSelected differs from processingMode.
const SCENARIOS: Scenario[] = [
  { wasmEnabled: true, processingMode: 'advanced', expectedSelected: 'advanced' },
  { wasmEnabled: true, processingMode: 'standard', expectedSelected: 'standard' },
  { wasmEnabled: true, processingMode: 'original', expectedSelected: 'original' },
  { wasmEnabled: false, processingMode: 'advanced', expectedSelected: 'standard' },
  { wasmEnabled: false, processingMode: 'standard', expectedSelected: 'standard' },
  { wasmEnabled: false, processingMode: 'original', expectedSelected: 'original' },
];

test.describe('Audio processing mode default', { tag: '@ci' }, () => {
  SCENARIOS.forEach(({ wasmEnabled, processingMode, expectedSelected }) => {
    const title = `wasmEnabled=${wasmEnabled}, mode=${processingMode} => ${expectedSelected} selected`;

    test(title, async ({ browser, context, page }, testInfo) => {
      const audioProcessingMode = new AudioProcessingMode(browser, context);
      await audioProcessingMode.initModPage(page, {
        testInfo,
        clientSettingsOverrides: audioProcessingModeOverrides(wasmEnabled, processingMode),
      });

      await audioProcessingMode.openAudioSettings();

      // Advanced Filtering is only exposed at all when WASM processing is
      // enabled at the deployment level (isWasmProcessingConfigEnabled());
      // it's disabled-with-tooltip only when the browser itself lacks WASM
      // support (isWasmProcessorSupported()), which real browsers here do.
      if (wasmEnabled) {
        await expect(page.locator(e.advancedFilteringRadio)).toBeEnabled();
      } else {
        await expect(page.locator(e.advancedFilteringRadio)).toHaveCount(0);
      }

      const modes = (Object.keys(RADIO_BY_MODE) as AudioProcessingModeValue[]).filter(
        (mode) => mode !== 'advanced' || wasmEnabled,
      );
      for (const mode of modes) {
        const locator = page.locator(RADIO_BY_MODE[mode]);
        if (mode === expectedSelected) {
          await expect(locator).toBeChecked();
        } else {
          await expect(locator).not.toBeChecked();
        }
      }
    });
  });
});

test.describe('Audio processing mode - showAudioFilters', { tag: '@ci' }, () => {
  test('leaves only the device test in the Audio tab when showAudioFilters is false', async ({ browser, context, page }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: showAudioFiltersOverride(false),
    });

    await audioProcessingMode.openAudioSettings();

    await expect(page.locator(e.audioTestInputDevice)).toBeVisible();
    await expect(page.locator(e.deviceTestAudioSection)).toHaveCount(0);
    await expect(page.locator(e.standardFilteringRadio)).toHaveCount(0);
  });
});

test.describe('Audio device test', { tag: '@ci' }, () => {
  test('tests the microphone and the speaker from the Audio tab', async ({ browser, context, page }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, { testInfo });

    await audioProcessingMode.openAudioSettings();
    // The processing section opens first, and the microphone is not opened yet.
    await expect(page.locator(e.standardFilteringRadio)).toBeVisible();
    await expect(page.locator(e.audioTestInputDevice)).toHaveCount(0);

    await page.locator(e.deviceTestAudioSection).click();

    await expect(page.locator(e.audioTestInputDevice)).toBeVisible();
    await expect(page.locator(e.audioTestOutputDevice)).toBeVisible();
    // The fake microphone beeps: the meter has to pick it up.
    await expect(page.locator(e.audioTestHasVolume)).toBeVisible();

    const hearMyselfButton = page.locator(e.audioTestHearMyselfButton);
    const startLabel = await hearMyselfButton.innerText();
    await hearMyselfButton.click();
    await expect(hearMyselfButton).not.toHaveText(startLabel);
    await hearMyselfButton.click();
    await expect(hearMyselfButton).toHaveText(startLabel);
  });

  test('mutes the user while they hear themselves', async ({ browser, context, page }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, { testInfo });
    await audioProcessingMode.joinWithMicrophone();
    await audioProcessingMode.modPage.waitAndClick(e.unmuteMicButton);
    await expect(page.locator(e.muteMicButton)).toBeAttached();

    await audioProcessingMode.openAudioSettings();
    await page.locator(e.deviceTestAudioSection).click();

    const hearMyselfButton = page.locator(e.audioTestHearMyselfButton);
    await hearMyselfButton.click();
    await expect(page.locator(e.unmuteMicButton)).toBeAttached();

    await hearMyselfButton.click();
    await expect(page.locator(e.muteMicButton)).toBeAttached();
  });
});
