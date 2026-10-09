import type { BrowserContext, Page as PlaywrightPage } from '@playwright/test';

/* eslint-disable no-underscore-dangle */

// A stand-in for the browser's Web Speech API, installed before the client loads.
//
// The webspeech transcription provider (audio-captions/speech/component.tsx) drives
// `window.SpeechRecognition` / `window.webkitSpeechRecognition`: it creates an instance,
// sets `lang`, calls `start()` once the user is unmuted and reads `onresult` events
// (`results[resultIndex][0].transcript`, `results[resultIndex].isFinal`, `target.lang`).
// Headless Chromium has no speech backend, so the spec supplies the results itself through
// `window.__fakeSpeech.emit(...)`; everything downstream (debouncing, diffing, the
// captionSubmitText mutation, akka, the recording) is the real code path.

type FakeSpeechWindow = Window & {
  __fakeSpeech?: {
    isRunning: () => boolean;
    lang: () => string | undefined;
    emit: (transcript: string, isFinal: boolean) => void;
  };
};

export const installFakeSpeechRecognition = (context: BrowserContext): Promise<void> =>
  context.addInitScript(() => {
    type Handler = ((event: object) => void) | null;
    class FakeSpeechRecognition {
      static instances: FakeSpeechRecognition[] = [];

      static active: FakeSpeechRecognition | null = null;

      lang = '';

      continuous = false;

      interimResults = false;

      onstart: Handler = null;

      onresult: Handler = null;

      onend: Handler = null;

      onerror: Handler = null;

      started = false;

      constructor() {
        FakeSpeechRecognition.instances.push(this);
      }

      start() {
        if (this.started) throw new DOMException('recognition has already started', 'InvalidStateError');
        this.started = true;
        FakeSpeechRecognition.active = this;
        setTimeout(() => this.onstart?.({}), 0);
      }

      stop() {
        this.finish();
      }

      abort() {
        this.finish();
      }

      private finish() {
        if (!this.started) return;
        this.started = false;
        if (FakeSpeechRecognition.active === this) FakeSpeechRecognition.active = null;
        setTimeout(() => this.onend?.({}), 0);
      }
    }

    (window as FakeSpeechWindow).__fakeSpeech = {
      isRunning: () => !!FakeSpeechRecognition.active?.started,
      lang: () => FakeSpeechRecognition.active?.lang,
      emit: (transcript: string, isFinal: boolean) => {
        const recognition = FakeSpeechRecognition.active;
        if (!recognition?.started) throw new Error('fake speech recognition is not running');
        const result = Object.assign([{ transcript, confidence: 1 }], { isFinal });
        recognition.onresult?.({ resultIndex: 0, results: [result], target: recognition });
      },
    };
    Object.assign(window, {
      SpeechRecognition: FakeSpeechRecognition,
      webkitSpeechRecognition: FakeSpeechRecognition,
    });
  });

export const waitForRecognizer = (page: PlaywrightPage, timeout: number): Promise<unknown> =>
  page.waitForFunction(() => (window as FakeSpeechWindow).__fakeSpeech?.isRunning() === true, undefined, { timeout });

export const emitSpeech = (page: PlaywrightPage, transcript: string, isFinal: boolean): Promise<void> =>
  page.evaluate(([text, final]) => (window as FakeSpeechWindow).__fakeSpeech!.emit(text as string, final as boolean), [
    transcript,
    isFinal,
  ] as const);

// Two interim results and the final one in quick succession, as browsers deliver the end
// of an utterance: the second interim and the final arrive together, `delayMs` after the first.
export const emitEndOfUtterance = (
  page: PlaywrightPage,
  [firstInterim, lastInterim, finalText]: [string, string, string],
  delayMs = 50,
): Promise<void> =>
  page.evaluate(
    ([first, last, final, delay]) => {
      const speech = (window as FakeSpeechWindow).__fakeSpeech!;
      speech.emit(first as string, false);
      setTimeout(() => {
        speech.emit(last as string, false);
        speech.emit(final as string, true);
      }, delay as number);
    },
    [firstInterim, lastInterim, finalText, delayMs] as const,
  );
