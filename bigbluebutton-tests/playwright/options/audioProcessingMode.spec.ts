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
  test('hides the Audio tab entirely when showAudioFilters is false', async ({ browser, context, page }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    await audioProcessingMode.initModPage(page, {
      testInfo,
      clientSettingsOverrides: showAudioFiltersOverride(false),
    });

    await audioProcessingMode.openSettings();

    await expect(page.locator(e.audioTab)).toHaveCount(0);
  });
});
