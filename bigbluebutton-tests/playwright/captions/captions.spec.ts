import { expect } from '@playwright/test';

import { linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import {
  captionRows,
  Captions,
  countSentence,
  joinWithTranscription,
  SENTENCES,
  speak,
  submitTranscript,
  submitTypedCaption,
  textBySpeaker,
} from './captions';
import { emitEndOfUtterance } from './fakeSpeechRecognition';

// Live captions (webspeech transcription) and their recording.
// Tracking issue: https://github.com/bigbluebutton/bigbluebutton/issues/19700

test.describe.parallel('Captions', { tag: '@ci' }, () => {
  test('Two speakers in the same language are recorded as separate labelled utterances', async ({
    browser,
    context,
  }, testInfo) => {
    linkIssue(19700);
    test.setTimeout(8 * 60 * 1000);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo);
    await joinWithTranscription(captions.modPage, 'en-US');
    await joinWithTranscription(captions.userPage, 'en-US');
    await captions.startRecording();

    // overlapping speech: the interim results of both speakers interleave
    await Promise.all([speak(captions.modPage, SENTENCES.alice1), speak(captions.userPage, SENTENCES.bob1)]);
    await Promise.all([speak(captions.modPage, SENTENCES.alice2), speak(captions.userPage, SENTENCES.bob2)]);

    // live captions are per utterance and per user
    await expect
      .poll(async () =>
        (await captionRows(captions.modPage)).map((row) => `${row.user.name}: ${row.captionText.trim()}`).sort(),
      )
      .toEqual(
        [
          `Alice: ${SENTENCES.alice1}`,
          `Bob: ${SENTENCES.bob1}`,
          `Alice: ${SENTENCES.alice2}`,
          `Bob: ${SENTENCES.bob2}`,
        ].sort(),
      );

    await captions.endMeeting();
    const tracks = await captions.recordedTracks();
    expect(Object.keys(tracks), 'the recording should have one caption track, for en-US').toEqual(['en-US']);
    const text = tracks['en-US'];
    for (const sentence of [SENTENCES.alice1, SENTENCES.bob1, SENTENCES.alice2, SENTENCES.bob2]) {
      expect(
        countSentence(text, sentence),
        `"${sentence}" should appear exactly once in the recorded captions: ${text}`,
      ).toBe(1);
    }
    // every utterance sits under its speaker's label
    const bySpeaker = textBySpeaker(text, ['Alice', 'Bob']);
    expect(Object.keys(bySpeaker).sort(), `the captions should start with a speaker label: ${text}`).toEqual([
      'Alice',
      'Bob',
    ]);
    for (const sentence of [SENTENCES.alice1, SENTENCES.alice2]) {
      expect(countSentence(bySpeaker.Alice, sentence), `"${sentence}" should be attributed to Alice: ${text}`).toBe(1);
    }
    for (const sentence of [SENTENCES.bob1, SENTENCES.bob2]) {
      expect(countSentence(bySpeaker.Bob, sentence), `"${sentence}" should be attributed to Bob: ${text}`).toBe(1);
    }
  });

  test('Speaker labels follow the chat anonymization of the recording', async ({ browser, context }, testInfo) => {
    linkIssue(19700);
    test.setTimeout(8 * 60 * 1000);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo, { createParameter: 'meta_bbb-anonymize-chat=true' });
    await joinWithTranscription(captions.modPage, 'en-US');
    await joinWithTranscription(captions.userPage, 'en-US');
    await captions.startRecording();
    await speak(captions.modPage, SENTENCES.alice1);
    await speak(captions.userPage, SENTENCES.bob1);
    await expect.poll(async () => (await captionRows(captions.modPage)).length).toBe(2);

    await captions.endMeeting();
    const text = (await captions.recordedTracks())['en-US'];
    // like the chat: viewers are anonymized, moderators keep their name
    const bySpeaker = textBySpeaker(text, ['Alice', 'Viewer 1', 'Bob']);
    expect(Object.keys(bySpeaker).sort(), `speaker labels in: ${text}`).toEqual(['Alice', 'Viewer 1']);
    expect(countSentence(bySpeaker.Alice, SENTENCES.alice1)).toBe(1);
    expect(countSentence(bySpeaker['Viewer 1'], SENTENCES.bob1)).toBe(1);
    expect(text, 'the viewer name must not be in the recorded captions').not.toContain('Bob');
  });

  test('Transcripts in two languages are recorded as separate tracks', async ({ browser, context }, testInfo) => {
    linkIssue(19700);
    test.setTimeout(8 * 60 * 1000);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo);
    await joinWithTranscription(captions.modPage, 'en-US');
    await joinWithTranscription(captions.userPage, 'pt-BR');
    await captions.startRecording();
    await Promise.all([speak(captions.modPage, SENTENCES.alice1), speak(captions.userPage, SENTENCES.bobPt)]);
    await expect.poll(async () => (await captionRows(captions.modPage)).length).toBe(2);

    await captions.endMeeting();
    const tracks = await captions.recordedTracks();
    expect(Object.keys(tracks).sort(), 'one track per language').toEqual(['en-US', 'pt-BR']);
    expect(countSentence(tracks['en-US'], SENTENCES.alice1)).toBe(1);
    expect(countSentence(tracks['en-US'], SENTENCES.bobPt)).toBe(0);
    expect(countSentence(tracks['pt-BR'], SENTENCES.bobPt)).toBe(1);
    expect(countSentence(tracks['pt-BR'], SENTENCES.alice1)).toBe(0);
  });

  test('Typed captions are recorded', async ({ browser, context }, testInfo) => {
    linkIssue(19700);
    test.setTimeout(8 * 60 * 1000);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo, { withViewer: false });
    await joinWithTranscription(captions.modPage, 'en-US');
    await captions.startRecording();

    // caption ids are a global primary key: keep them unique across meetings
    const typedId = `typed-${captions.modPage.meetingId}`;
    expect(await submitTypedCaption(captions.modPage, `${typedId}-1`, SENTENCES.typed1, 'en-US')).toEqual([]);
    expect(await submitTypedCaption(captions.modPage, `${typedId}-2`, SENTENCES.typed2, 'en-US')).toEqual([]);
    await speak(captions.modPage, SENTENCES.alice1);
    await expect
      .poll(async () =>
        (await captionRows(captions.modPage)).map((row) => `${row.captionType}: ${row.captionText.trim()}`).sort(),
      )
      .toEqual(
        [`TYPED: ${SENTENCES.typed1}`, `TYPED: ${SENTENCES.typed2}`, `AUDIO_TRANSCRIPTION: ${SENTENCES.alice1}`].sort(),
      );

    await captions.endMeeting();
    const tracks = await captions.recordedTracks();
    expect(Object.keys(tracks)).toEqual(['en-US']);
    const text = tracks['en-US'];
    expect(countSentence(text, SENTENCES.typed1), `typed captions should be in the recording: ${text}`).toBe(1);
    expect(countSentence(text, SENTENCES.typed2), `typed captions should be in the recording: ${text}`).toBe(1);
    expect(countSentence(text, SENTENCES.alice1)).toBe(1);
  });

  test('A late interim result does not truncate the final transcript', async ({ browser, context }, testInfo) => {
    linkIssue(19700);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo, { withViewer: false, record: false });
    await joinWithTranscription(captions.modPage, 'en-US');

    // Browsers deliver the final result right after the last interim one. The client
    // debounces interim results, so a pending interim must not be sent after the final.
    const shortInterim = 'it is easy to tell the depth';
    const longerInterim = 'it is easy to tell the depth over';
    const finalText = 'it is easy to tell the depth over well';
    await emitEndOfUtterance(captions.modPage.page, [shortInterim, longerInterim, finalText]);

    await expect
      .poll(async () => (await captionRows(captions.modPage)).map((row) => row.captionText.trim()))
      .toEqual([finalText]);
    // nothing arrives later that shortens the caption again
    await captions.modPage.page.waitForTimeout(1500);
    expect((await captionRows(captions.modPage)).map((row) => row.captionText.trim())).toEqual([finalText]);
  });

  test('Transcripts with an invalid locale are rejected', async ({ browser, context }, testInfo) => {
    linkIssue(19178);
    const captions = new Captions(browser, context);
    await captions.initCaptionPages(testInfo, { withViewer: false, record: false });
    await joinWithTranscription(captions.modPage, 'en-US');

    // caption ids are a global primary key: keep them unique across meetings
    const probeId = `probe-${captions.modPage.meetingId}`;
    const invalidLocales = ['', 'en_US', 'en-us', '../../etc', 'en-US<script>', 'x'.repeat(250)];
    for (const locale of invalidLocales) {
      const errors = await submitTranscript(captions.modPage, {
        transcriptId: `${probeId}-${invalidLocales.indexOf(locale)}`,
        locale,
        transcript: 'probe',
      });
      expect(errors.length, `locale ${JSON.stringify(locale.slice(0, 20))} should be rejected`).toBeGreaterThan(0);
    }
    expect(
      await submitTranscript(captions.modPage, {
        transcriptId: `${probeId}-ok`,
        locale: 'en-US',
        transcript: 'probe ok',
      }),
    ).toEqual([]);
    await expect.poll(async () => (await captionRows(captions.modPage)).map((row) => row.locale)).toEqual(['en-US']);
  });
});
