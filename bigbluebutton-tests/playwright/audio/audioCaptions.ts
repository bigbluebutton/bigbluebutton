/* eslint-disable max-classes-per-file */
import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// public.app.audioCaptions.language.locale takes a BCP-47 tag, 'browserLanguage' or 'disabled'.
export function audioCaptionsOverrides(
  locale: string,
  defaultSelectLocale = true,
  processLocally = false,
): ClientSettingsOverrides {
  return {
    public: {
      app: {
        audioCaptions: {
          enabled: true,
          provider: 'webspeech',
          processLocally,
          language: { defaultSelectLocale, locale },
        },
      },
    },
  };
}

export type OnDeviceAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface SpeechRecognitionShimRecord {
  starts: { lang: string; processLocally: boolean }[];
  installs: string[];
}

// Replaces SpeechRecognition with a recorder, so that the client side of on-device recognition
// can be checked without Chrome's speech engine (absent in the Playwright browsers). With
// onDevice false it has no available()/install(), like a browser without on-device recognition.
// The record is in window.speechRecognitionShim. Call before initModPage().
export async function shimSpeechRecognition(
  page: PlaywrightPage,
  availability: Record<string, OnDeviceAvailability>,
  onDevice = true,
): Promise<void> {
  await page.addInitScript(
    ({ languages, withOnDevice }) => {
      const record: SpeechRecognitionShimRecord = { starts: [], installs: [] };
      class FakeSpeechRecognition {
        lang = '';

        continuous = false;

        interimResults = false;

        processLocally = false;

        onend: (() => void) | null = null;

        onerror: (() => void) | null = null;

        onresult: (() => void) | null = null;

        start() {
          record.starts.push({ lang: this.lang, processLocally: this.processLocally });
        }

        // eslint-disable-next-line class-methods-use-this
        stop() {}

        // eslint-disable-next-line class-methods-use-this
        abort() {}
      }
      if (withOnDevice) {
        Object.assign(FakeSpeechRecognition, {
          available: async ({ langs }: { langs: string[] }) => languages[langs[0]] ?? 'unavailable',
          install: async ({ langs }: { langs: string[] }) => {
            record.installs.push(langs[0]);
            Object.assign(languages, { [langs[0]]: 'available' });
            return true;
          },
        });
      }
      Object.assign(window, {
        SpeechRecognition: FakeSpeechRecognition,
        webkitSpeechRecognition: FakeSpeechRecognition,
        speechRecognitionShim: record,
      });
    },
    { languages: availability, withOnDevice: onDevice },
  );
}

// With the webspeech provider the client only lists a language when speechSynthesis.getVoices()
// has a voice for it (getSpeechVoices() in audio-captions/service.ts). Headless Chromium on Linux
// has no voices at all, so it would show "Your browser doesn't support speech recognition" instead
// of the select. Call before initModPage(), while the page is still blank.
export async function shimSpeechSynthesisVoices(page: PlaywrightPage, langs: string[]): Promise<void> {
  await page.addInitScript((voiceLangs: string[]) => {
    const voices = voiceLangs.map((lang) => ({
      lang,
      name: `Fake ${lang}`,
      default: lang === voiceLangs[0],
      localService: true,
      voiceURI: `fake-${lang}`,
    })) as SpeechSynthesisVoice[];
    window.speechSynthesis.getVoices = () => voices;
  }, langs);
}

export class AudioCaptions extends MultiUsers {
  // The device settings step of the audio modal, where the "Automatic transcription" select is.
  async openAudioSettings(): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    await this.modPage.waitForSelector(e.audioModal);
    await this.modPage.clickMicrophoneButton();
    await this.modPage.waitForSelector(e.stopHearingButton);
  }

  async hasTranscriptionLocale(value: string, label: string, description: string): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    const select = this.modPage.page.locator(e.speechRecognition);
    await expect(select, description).toHaveValue(value);
    await expect(select.locator('option:checked'), description).toHaveText(label);
  }

  async hasTranscriptionLocales(values: string[], description: string): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    const options = this.modPage.page.locator(`${e.speechRecognition} option`);
    await expect
      .poll(async () => options.evaluateAll((list) => list.map((option) => (option as HTMLOptionElement).value)), {
        message: description,
      })
      .toEqual(values);
  }

  async getSpeechRecognitionShimRecord(): Promise<SpeechRecognitionShimRecord> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    return this.modPage.page.evaluate(
      () => (window as unknown as { speechRecognitionShim: SpeechRecognitionShimRecord }).speechRecognitionShim,
    );
  }

  // A negative check: the value must not change after the select has rendered, so it is sampled
  // for a while instead of asserted once.
  async keepsTranscriptionLocale(value: string, label: string, description: string, forMs = 3000): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    const select = this.modPage.page.locator(e.speechRecognition);
    await expect(select, description).toHaveValue(value);
    const deadline = Date.now() + forMs;
    while (Date.now() < deadline) {
      await this.modPage.page.waitForTimeout(500);
      expect(await select.inputValue(), description).toBe(value);
    }
    await expect(select.locator('option:checked'), description).toHaveText(label);
  }
}
