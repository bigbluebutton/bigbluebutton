import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// public.app.audioCaptions.language.locale takes a BCP-47 tag, 'browserLanguage' or 'disabled'.
export function audioCaptionsOverrides(locale: string, defaultSelectLocale = true): ClientSettingsOverrides {
  return {
    public: {
      app: {
        audioCaptions: {
          enabled: true,
          provider: 'webspeech',
          language: { defaultSelectLocale, locale },
        },
      },
    },
  };
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
