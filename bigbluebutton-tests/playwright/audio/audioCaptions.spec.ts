import { test } from '../core/setup/fixtures';
import { AudioCaptions, audioCaptionsOverrides, shimSpeechSynthesisVoices } from './audioCaptions';

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
