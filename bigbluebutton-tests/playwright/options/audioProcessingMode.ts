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

// Advanced filtering runs the microphone through an AudioWorklet, so it needs an
// AudioContext that actually starts. Headless Firefox on a host without an audio
// output device (no PulseAudio) never starts one: resume() neither resolves nor
// rejects. Call before initModPage(), while the page is still blank.
export async function canStartAudioContext(page: PlaywrightPage, timeoutMs = 3000): Promise<boolean> {
  return page.evaluate(async (timeout) => {
    const audioContext = new AudioContext();
    const started = await Promise.race([
      audioContext.resume().then(() => audioContext.state === 'running'),
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), timeout);
      }),
    ]);
    audioContext.close().catch(() => {});
    return started;
  }, timeoutMs);
}

export type AudioProcessingModeValue = 'advanced' | 'standard' | 'original';

// Deep-merged into window.meetingClientSettings before the client boots (see
// Page.applyClientSettingsOverrides) - lets a test pin the deployment
// capability flag (media.audio.audioWasmProcessing.enabled), the configured
// default (defaultSettings.audio.processingMode) and, optionally, the
// 'standard' mode browser-level filters (media.audio.microphoneConstraints)
// and the 'advanced'/WASM ones (media.audio.audioWasmProcessing.constraints),
// regardless of what the server under test actually ships.
export type AudioWasmProvider = 'bbba' | 'workadventureDtln';

export function audioProcessingModeOverrides(
  wasmEnabled: boolean,
  processingMode: AudioProcessingModeValue,
  microphoneConstraints?: ClientSettingsOverrides,
  wasmConstraints?: ClientSettingsOverrides,
  provider?: AudioWasmProvider,
): ClientSettingsOverrides {
  return {
    public: {
      media: {
        audio: {
          audioWasmProcessing: {
            enabled: wasmEnabled,
            ...(provider ? { provider } : {}),
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
      // assetUrl() appends ?v=html5ClientBuild - strip the query before matching.
      const url = request.url().split('?')[0].toLowerCase();
      if (url.endsWith('.wasm')) {
        this.wasmRequestUrls.push(request.url());
      }
    });
  }

  wasmProcessorWasLoaded(): boolean {
    return this.wasmRequestUrls.length > 0;
  }

  getWasmRequestUrls(): string[] {
    return [...this.wasmRequestUrls];
  }

  async openSettings(): Promise<void> {
    await this.modPage.waitAndClick(e.settingsSidebarButton);
  }

  async openAudioSettings(): Promise<void> {
    await this.openSettings();
    await this.modPage.waitAndClick(e.audioTab);
  }

  async selectProcessingMode(mode: AudioProcessingModeValue): Promise<void> {
    const radio = {
      advanced: e.advancedFilteringRadio,
      standard: e.standardFilteringRadio,
      original: e.originalAudioRadio,
    }[mode];

    await this.openAudioSettings();
    await this.modPage.waitAndClick(radio);
    await this.modPage.waitAndClick(e.saveSettingsButton);
  }

  async joinWithMicrophone(): Promise<void> {
    await this.modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(this.modPage);
  }
}
