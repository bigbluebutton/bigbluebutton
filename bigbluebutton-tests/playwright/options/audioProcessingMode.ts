import { Page as PlaywrightPage } from '@playwright/test';

import { connectMicrophone } from '../audio/util';
import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

export type CapturedAudioConstraint = boolean | string | { exact?: boolean; ideal?: boolean };

export interface CapturedAudioConstraints {
  autoGainControl?: CapturedAudioConstraint;
  echoCancellation?: CapturedAudioConstraint;
  noiseSuppression?: CapturedAudioConstraint;
  [key: string]: unknown;
}

declare global {
  interface Window {
    capturedAudioConstraints?: Array<CapturedAudioConstraints | boolean | null>;
  }
}

// Must run before initModPage()/page.goto() (like Page.applyClientSettingsOverrides)
// so it wraps navigator.mediaDevices.getUserMedia before the app or the LiveKit SDK
// ever calls it. Both bridges (FreeSWITCH and LiveKit) build their audio constraints
// via getAudioConstraints() and eventually call the real getUserMedia, so this
// captures what was actually applied regardless of which bridge is active.
export async function captureGetUserMediaAudioConstraints(page: PlaywrightPage): Promise<void> {
  await page.addInitScript(() => {
    window.capturedAudioConstraints = [];
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints?: MediaStreamConstraints) => {
      window.capturedAudioConstraints!.push(
        constraints && constraints.audio !== undefined ? (constraints.audio as CapturedAudioConstraints) : null,
      );
      return original(constraints);
    };
  });
}

export async function getCapturedAudioConstraints(
  page: PlaywrightPage,
): Promise<Array<CapturedAudioConstraints | boolean | null>> {
  return page.evaluate(() => window.capturedAudioConstraints ?? []);
}

export type AudioProcessingModeValue = 'advanced' | 'standard' | 'original';

// Deep-merged into window.meetingClientSettings before the client boots (see
// Page.applyClientSettingsOverrides) - lets a test pin the deployment
// capability flag (media.audio.audioWasmProcessing.enabled), the configured
// default (defaultSettings.audio.processingMode) and, optionally, the
// 'standard' mode browser-level filters (media.audio.microphoneConstraints)
// and the 'advanced'/WASM ones (media.audio.audioWasmProcessing.constraints),
// regardless of what the server under test actually ships.
export function audioProcessingModeOverrides(
  wasmEnabled: boolean,
  processingMode: AudioProcessingModeValue,
  microphoneConstraints?: ClientSettingsOverrides,
  wasmConstraints?: ClientSettingsOverrides,
): ClientSettingsOverrides {
  return {
    public: {
      media: {
        audio: {
          audioWasmProcessing: {
            enabled: wasmEnabled,
            ...(wasmConstraints ? { constraints: wasmConstraints } : {}),
          },
          ...(microphoneConstraints ? { microphoneConstraints } : {}),
        },
      },
      app: {
        defaultSettings: {
          audio: { processingMode },
        },
      },
    },
  };
}

// public.app.showAudioFilters gates the whole Audio tab (selector + panel),
// not just the Advanced Filtering option within it - see getSettingsTabs().
export function showAudioFiltersOverride(enabled: boolean): ClientSettingsOverrides {
  return {
    public: {
      app: {
        showAudioFilters: enabled,
      },
    },
  };
}

export class AudioProcessingMode extends MultiUsers {
  private wasmRequestUrls: string[] = [];

  // 'advanced' overrides the real getUserMedia constraints to the same
  // browser-level filters as 'standard' (doGUM applies media.audio.
  // audioWasmProcessing.constraints "on top of WASM") - constraints alone
  // can't tell advanced apart from standard. Whether BBBA/WASM actually
  // loaded is the only reliable signal, so track its file requests
  // (loadWasmProcessorFiles() in audio-processor/service.js) instead. Must
  // be registered before initModPage() too, so it's armed before the join.
  async trackWasmProcessorRequests(page: PlaywrightPage): Promise<void> {
    page.on('request', (request) => {
      if (request.url().toLowerCase().endsWith('.wasm')) {
        this.wasmRequestUrls.push(request.url());
      }
    });
  }

  wasmProcessorWasLoaded(): boolean {
    return this.wasmRequestUrls.length > 0;
  }

  async openSettings(): Promise<void> {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
  }

  async openAudioSettings(): Promise<void> {
    await this.openSettings();
    await this.modPage.waitAndClick(e.audioTab);
  }

  async joinWithMicrophone(): Promise<void> {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
  }
}
