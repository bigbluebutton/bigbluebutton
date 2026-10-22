import { expect } from '@playwright/test';

import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import {
  AudioCaptions,
  audioCaptionsOverrides,
  shimSpeechRecognition,
  shimSpeechSynthesisVoices,
} from './audioCaptions';

const VOICES = ['en-US', 'es-ES', 'fr-FR', 'pt-BR'];
const NO_WEBSPEECH = 'Firefox has no SpeechRecognition API, so the client never renders the webspeech language select';

test.describe('Audio captions - default transcription language', { tag: ['@ci', '@media'] }, () => {
  test('pre-selects the configured locale in the audio settings when defaultSelectLocale is on', async ({
    browser,
    browserName,
    context,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', NO_WEBSPEECH);
    await shimSpeechSynthesisVoices(page, VOICES);
    const audioCaptions = new AudioCaptions(browser, context);
    await audioCaptions.initModPage(page, {
      testInfo,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioCaptionsOverrides('en-US'),
    });

    await audioCaptions.openAudioSettings();
    await audioCaptions.hasTranscriptionLocale(
      'en-US',
      'English (USA)',
      'should open the audio settings with the configured transcription language selected',
    );
  });

  test('keeps transcription disabled when the configured locale is disabled', async ({
    browser,
    browserName,
    context,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', NO_WEBSPEECH);
    await shimSpeechSynthesisVoices(page, VOICES);
    const audioCaptions = new AudioCaptions(browser, context);
    await audioCaptions.initModPage(page, {
      testInfo,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioCaptionsOverrides('disabled'),
    });

    await audioCaptions.openAudioSettings();
    await audioCaptions.keepsTranscriptionLocale(
      '',
      'Disabled',
      'should open the audio settings with transcription disabled and leave it so',
    );
  });
});

test.describe('Audio captions - on-device transcription (processLocally)', { tag: ['@ci', '@media'] }, () => {
  const AVAILABILITY = {
    'en-US': 'available',
    'pt-BR': 'downloadable',
    'es-ES': 'unavailable',
    'fr-FR': 'unavailable',
  } as const;

  test('offers only the languages the browser can transcribe on the device', async ({
    browser,
    browserName,
    context,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', NO_WEBSPEECH);
    await shimSpeechSynthesisVoices(page, VOICES);
    await shimSpeechRecognition(page, AVAILABILITY);
    const audioCaptions = new AudioCaptions(browser, context);
    await audioCaptions.initModPage(page, {
      testInfo,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioCaptionsOverrides('en-US', true, true),
    });

    await audioCaptions.openAudioSettings();
    await audioCaptions.hasTranscriptionLocales(
      ['', 'en-US', 'pt-BR'],
      'should list Disabled plus the languages that are available or downloadable on the device',
    );
  });

  test('shows transcription as unsupported when the browser has no on-device recognition', async ({
    browser,
    browserName,
    context,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', NO_WEBSPEECH);
    await shimSpeechSynthesisVoices(page, VOICES);
    await shimSpeechRecognition(page, AVAILABILITY, false);
    const audioCaptions = new AudioCaptions(browser, context);
    await audioCaptions.initModPage(page, {
      testInfo,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioCaptionsOverrides('en-US', true, true),
    });

    await audioCaptions.openAudioSettings();
    await audioCaptions.modPage.hasElement(
      e.speechRecognitionUnsupported,
      'should show transcription as unsupported instead of falling back to a speech recognition service',
    );
  });

  test('waits for the language data download before joining audio with transcription', async ({
    browser,
    browserName,
    context,
    page,
  }, testInfo) => {
    test.skip(browserName === 'firefox', NO_WEBSPEECH);
    await shimSpeechSynthesisVoices(page, VOICES);
    await shimSpeechRecognition(page, { ...AVAILABILITY, 'en-US': 'downloadable' });
    const audioCaptions = new AudioCaptions(browser, context);
    await audioCaptions.initModPage(page, {
      testInfo,
      shouldCloseAudioModal: false,
      clientSettingsOverrides: audioCaptionsOverrides('en-US', true, true),
    });
    const { modPage } = audioCaptions;

    await audioCaptions.openAudioSettings();
    await modPage.hasElement(e.onDeviceLanguageDownloadable, 'should tell that the language data must be downloaded');
    await modPage.hasElementDisabled(
      e.joinEchoTestButton,
      'should not join audio with transcription before the language data is downloaded',
    );
    await modPage.page.selectOption(e.speechRecognition, '');
    await modPage.hasElementEnabled(e.joinEchoTestButton, 'should join audio right away with transcription disabled');
    await modPage.page.selectOption(e.speechRecognition, 'en-US');
    await modPage.hasElementDisabled(e.joinEchoTestButton, 'should wait for the download again with a language');
    expect(
      (await audioCaptions.getSpeechRecognitionShimRecord()).installs,
      'should not download anything before the user asks to',
    ).toEqual([]);

    await modPage.waitAndClick(e.onDeviceLanguageDownload);
    await modPage.hasElement(e.onDeviceLanguageAvailable, 'should tell that the language is transcribed on the device');
    await modPage.hasElementEnabled(e.joinEchoTestButton, 'should join audio once the language data is downloaded');
    await modPage.waitAndClick(e.joinEchoTestButton);
    await modPage.hasElement(e.unmuteMicButton, 'should display the unmute mic button after joining microphone');
    await modPage.waitAndClick(e.unmuteMicButton);
    await expect
      .poll(async () => audioCaptions.getSpeechRecognitionShimRecord(), {
        message: 'should start an on-device recognition for en-US after the en-US download',
      })
      .toMatchObject({ installs: ['en-US'], starts: [{ lang: 'en-US', processLocally: true }] });
  });
});
