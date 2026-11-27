/* eslint-disable max-classes-per-file */
import { expect, Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { ClientSettingsOverrides } from '../core/page';
import { MultiUsers } from '../user/multiusers';

// public.app.audioCaptions.language.locale takes a BCP-47 tag, 'browserLanguage' or 'disabled'.
export function audioCaptionsOverrides(
  locale: string,
  defaultSelectLocale = true,
  speechProcessing: 'cloud' | 'local' | 'auto' = 'cloud',
  { forceLocale = false, showInSidebarNavigation = false } = {},
): ClientSettingsOverrides {
  return {
    public: {
      app: {
        audioCaptions: {
          enabled: true,
          provider: 'webspeech',
          speechProcessing,
          showInSidebarNavigation,
          language: { defaultSelectLocale, locale, forceLocale },
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
  install: { delayMs?: number; succeeds?: boolean } = {},
): Promise<void> {
  await page.addInitScript(
    ({ languages, withOnDevice, installDelayMs, installSucceeds }) => {
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
            await new Promise((resolve) => {
              setTimeout(resolve, installDelayMs);
            });
            if (installSucceeds) Object.assign(languages, { [langs[0]]: 'available' });
            return installSucceeds;
          },
        });
      }
      Object.assign(window, {
        SpeechRecognition: FakeSpeechRecognition,
        webkitSpeechRecognition: FakeSpeechRecognition,
        speechRecognitionShim: record,
      });
    },
    {
      languages: availability,
      withOnDevice: onDevice,
      installDelayMs: install.delayMs ?? 0,
      installSucceeds: install.succeeds ?? true,
    },
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

// Whether a graphql message sets speechLocale to `locale`, as a whole row or as a patch.
function setsSpeechLocale(node: unknown, locale: string): boolean {
  if (!node || typeof node !== 'object') return false;
  const fields = node as Record<string, unknown>;
  if (fields.speechLocale === locale) return true;
  if (typeof fields.path === 'string' && fields.path.endsWith('/speechLocale') && fields.value === locale) return true;
  return Object.values(fields).some((value) => setsSpeechLocale(value, locale));
}

// Makes the configured language reach the page only after the user has chosen another one, as
// on a slow server: the current user's updates are held back from when the client sends the
// configured language until the user chooses, and the choice is held back until the server has
// published the configured language, so the server takes them in that order. `delivered`
// resolves once both have gone through. Call before initModPage().
export async function deliverDefaultLocaleAfterChoice(
  page: PlaywrightPage,
  defaultLocale: string,
): Promise<{ delivered: Promise<void> }> {
  let markDelivered = () => {};
  const delivered = new Promise<void>((resolve) => {
    markDelivered = resolve;
  });
  await page.routeWebSocket(/\/graphql$/, (pageSide) => {
    const serverSide = pageSide.connectToServer();
    const currentUserIds = new Set<string>();
    let defaultPublished = false;
    let choice: string | undefined;
    let held: string[] | undefined;
    const release = () => {
      if (!defaultPublished || choice === undefined || !held) return;
      serverSide.send(choice);
      held.forEach((message) => pageSide.send(message));
      held = undefined;
      markDelivered();
    };
    pageSide.onMessage((message) => {
      const locale =
        typeof message === 'string' &&
        message.includes('SetSpeechLocale') &&
        JSON.parse(message).payload?.variables?.locale;
      if (locale === defaultLocale && !defaultPublished && !held) {
        held = [];
      } else if (typeof locale === 'string' && held) {
        choice = message as string;
        release();
        return;
      }
      serverSide.send(message);
    });
    serverSide.onMessage((message) => {
      const { id, payload } = typeof message === 'string' ? JSON.parse(message) : {};
      if (payload?.data?.user_current) currentUserIds.add(id);
      if (!held || !currentUserIds.has(id)) {
        pageSide.send(message);
        return;
      }
      held.push(message as string);
      if (setsSpeechLocale(payload, defaultLocale)) {
        defaultPublished = true;
        release();
      }
    });
  });
  return { delivered };
}

export class AudioCaptions extends MultiUsers {
  // The device settings step of the audio modal, where the "Automatic transcription" select is.
  async openAudioSettings(): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    await this.modPage.waitForSelector(e.audioModal);
    await this.modPage.clickMicrophoneButton();
    await this.modPage.waitForSelector(e.stopHearingButton);
  }

  // The transcription switch of the transcription and captions panel (showInSidebarNavigation).
  // It can already be on: the audio modal's select applies a forced or default-selected locale
  // when it mounts, which depends on the audio bridge's join flow
  async turnTranscriptionOnInPanel(): Promise<void> {
    if (!this?.modPage) throw new Error('modPage not initialized');
    await this.modPage.waitAndClick(e.audioCaptionsSidebarButton);
    await this.modPage.hasElement(e.audioCaptionsPanel, 'should open the transcription and captions panel');
    await this.modPage.page.locator(e.transcriptionToggle).check();
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
