import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { constants as c } from '../parameters/constants';
import {
  AudioProcessingMode,
  audioProcessingModeOverrides,
  AudioProcessingModeValue,
  AudioWasmProvider,
  showAudioFiltersOverride,
} from './audioProcessingMode';

const RADIO_BY_MODE: Record<AudioProcessingModeValue, string> = {
  voiceIsolation: e.voiceIsolationRadio,
  advanced: e.advancedFilteringRadio,
  standard: e.standardFilteringRadio,
  original: e.originalAudioRadio,
};

interface Scenario {
  wasmEnabled: boolean;
  processingMode: AudioProcessingModeValue;
  expectedSelected: AudioProcessingModeValue;
  // unset means 'bbba', not the provider the server under test ships
  provider?: AudioWasmProvider;
}

// getDefaultAudioProcessingMode() (bridge/service.js) uses
// defaultSettings.audio.processingMode as-is, with two exceptions. Without
// media.audio.audioWasmProcessing.enabled, 'advanced' and 'voiceIsolation'
// fall back to 'standard'. With a provider that has no intensity parameter
// (workadventureDtln), 'voiceIsolation' falls back to 'advanced'.
const SCENARIOS: Scenario[] = [
  { wasmEnabled: true, processingMode: 'voiceIsolation', expectedSelected: 'voiceIsolation' },
  {
    wasmEnabled: true,
    processingMode: 'voiceIsolation',
    expectedSelected: 'advanced',
    provider: 'workadventureDtln',
  },
  { wasmEnabled: false, processingMode: 'voiceIsolation', expectedSelected: 'standard' },
  { wasmEnabled: true, processingMode: 'advanced', expectedSelected: 'advanced' },
  { wasmEnabled: true, processingMode: 'standard', expectedSelected: 'standard' },
  { wasmEnabled: true, processingMode: 'original', expectedSelected: 'original' },
  { wasmEnabled: false, processingMode: 'advanced', expectedSelected: 'standard' },
  { wasmEnabled: false, processingMode: 'standard', expectedSelected: 'standard' },
  { wasmEnabled: false, processingMode: 'original', expectedSelected: 'original' },
];

test.describe('Audio processing mode default', { tag: '@ci' }, () => {
  SCENARIOS.forEach(({ wasmEnabled, processingMode, expectedSelected, provider }) => {
    const providerTitle = provider ? `, provider=${provider}` : '';
    const title = `wasmEnabled=${wasmEnabled}${providerTitle}, mode=${processingMode} => ${expectedSelected} selected`;

    test(title, async ({ browser, context, page }, testInfo) => {
      const audioProcessingMode = new AudioProcessingMode(browser, context);
      // Only the settings radios are checked, so audio is not joined: joining with
      // Advanced selected needs a running AudioContext (see audioProcessingModeTrack).
      await audioProcessingMode.initModPage(page, {
        testInfo,
        joinParameter: c.autoJoin,
        shouldCloseAudioModal: false,
        clientSettingsOverrides: audioProcessingModeOverrides(
          wasmEnabled,
          processingMode,
          undefined,
          undefined,
          provider ?? 'bbba',
        ),
      });

      await audioProcessingMode.openAudioSettings();
      // always rendered: the absence checks below run on a rendered panel
      await expect(page.locator(e.standardFilteringRadio)).toBeVisible();

      // Advanced Filtering is only exposed at all when WASM processing is
      // enabled at the deployment level (isWasmProcessingConfigEnabled());
      // it's disabled-with-tooltip only when the browser itself lacks WASM
      // support (isWasmProcessorSupported()), which real browsers here do.
      if (wasmEnabled) {
        await expect(page.locator(e.advancedFilteringRadio)).toBeEnabled();
      } else {
        await expect(page.locator(e.advancedFilteringRadio)).toHaveCount(0);
      }

      // Voice Isolation is only offered with the BBBA provider
      const voiceIsolationOffered = wasmEnabled && provider !== 'workadventureDtln';
      if (voiceIsolationOffered) {
        await expect(page.locator(e.voiceIsolationRadio)).toBeEnabled();
      } else {
        await expect(page.locator(e.voiceIsolationRadio)).toHaveCount(0);
      }

      const modes = (Object.keys(RADIO_BY_MODE) as AudioProcessingModeValue[]).filter(
        (mode) => (mode !== 'advanced' || wasmEnabled) && (mode !== 'voiceIsolation' || voiceIsolationOffered),
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

test.describe('Audio processing mode - browser without WASM support', { tag: '@ci' }, () => {
  test('disables Advanced Filtering and Voice Isolation and selects Standard', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const audioProcessingMode = new AudioProcessingMode(browser, context);
    // isGenericWasmProcessingSupported() (wasmCapability.js) validates a
    // 33-byte mutable-globals module. Failing only that probe makes the
    // browser unsupported without breaking any other WebAssembly use.
    await page.addInitScript(() => {
      const validate = WebAssembly.validate.bind(WebAssembly);
      WebAssembly.validate = (bytes: BufferSource) => (bytes.byteLength === 33 ? false : validate(bytes));
    });
    await audioProcessingMode.initModPage(page, {
      testInfo,
      joinParameter: c.autoJoin,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioProcessingModeOverrides(true, 'voiceIsolation', undefined, undefined, 'bbba'),
    });

    await audioProcessingMode.openAudioSettings();

    await expect(page.locator(e.standardFilteringRadio)).toBeChecked();
    await expect(page.locator(e.advancedFilteringRadio)).toBeDisabled();
    await expect(page.locator(e.voiceIsolationRadio)).toBeDisabled();
    await expect(page.locator(e.voiceIsolationRadio)).toHaveAttribute('aria-describedby', 'voiceIsolationRadio-reason');
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
