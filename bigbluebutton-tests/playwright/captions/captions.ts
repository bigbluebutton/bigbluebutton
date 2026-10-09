import { expect, type TestInfo } from '@playwright/test';
import axios from 'axios';

import {
  field,
  isApolloClientExposed,
  queryDocument,
  runMutation,
  runQuery,
  stringVarMutation,
  typedVarMutation,
} from '../core/apolloProbe';
import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { apiCall } from '../core/helpers';
import { Page } from '../core/page';
import { MultiUsers } from '../user/multiusers';
import { emitSpeech, installFakeSpeechRecognition, waitForRecognizer } from './fakeSpeechRecognition';

// Live transcription is off by default (public.app.audioCaptions.enabled) and the probe
// needs the Apollo client exposed: both are switched on for the test meeting only.
const CAPTIONS_SETTINGS_MODULE = [
  '<modules><module name="clientSettingsOverride"><![CDATA[',
  JSON.stringify({ public: { app: { enableApolloDevTools: true, audioCaptions: { enabled: true } } } }),
  ']]></module></modules>',
].join('');

const RECORDED_MEETING = 'record=true';
const RECORDING_PUBLISH_TIMEOUT = 6 * 60 * 1000;

export const SENTENCES = {
  alice1: 'the birch canoe slid on the smooth planks',
  bob1: 'glue the sheet to the dark blue background',
  alice2: 'it is easy to tell the depth of a well',
  bob2: 'these days a chicken leg is a rare dish',
  bobPt: 'o rato roeu a roupa do rei de roma',
  typed1: 'typed caption number one',
  typed2: 'typed caption number two',
};

export interface CaptionRow {
  captionId: string;
  captionText: string;
  captionType: string;
  locale: string;
  user: { name: string };
}

export interface TextTrack {
  href: string;
  kind: string;
  label: string;
  lang: string;
  source: string;
}

// Cue text of a WebVTT file as one whitespace-normalised line, cue after cue.
export const vttText = (vtt: string): string =>
  vtt
    .split('\n')
    // cue timings may omit the hours (ffmpeg writes "00:01.000 --> 00:03.000")
    .filter((line) => line.trim() !== '' && !line.startsWith('WEBVTT') && !/^(\d+:)?\d\d:\d\d\.\d{3} --> /.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-word occurrences: a sentence glued to its neighbour ("planksglue the sheet")
// does not count, and a sentence re-appended by the server counts twice.
export const countSentence = (text: string, sentence: string): number =>
  (text.match(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(sentence)}(?![\\p{L}\\p{N}])`, 'gu')) ?? []).length;

// The recorded text split by speaker: a cue names its speaker ("Alice: ...") when the
// speaker changes, unlabelled text continues the previous speaker. Text before the first
// label is kept under ''.
export const textBySpeaker = (text: string, speakers: string[]): Record<string, string> => {
  const labels = new RegExp(`(?:^|\\s)(${speakers.map(escapeRegExp).join('|')}): `, 'g');
  const result: Record<string, string> = {};
  let speaker = '';
  let last = 0;
  const append = (chunk: string) => {
    result[speaker] = `${result[speaker] ?? ''} ${chunk}`.replace(/\s+/g, ' ').trim();
  };
  for (const match of text.matchAll(labels)) {
    append(text.slice(last, match.index));
    [, speaker] = match;
    last = (match.index ?? 0) + match[0].length;
  }
  append(text.slice(last));
  if (result[''] === '') delete result[''];
  return result;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Join the microphone and pick a transcription language the way the language selector
// does (userSetSpeechLocale), then wait for the client to start the recognizer.
export async function joinWithTranscription(page: Page, locale: string): Promise<void> {
  await page.joinMicrophone();
  expect(
    await isApolloClientExposed(page.page, ELEMENT_WAIT_LONGER_TIME),
    'the Apollo client should be exposed (enableApolloDevTools)',
  ).toBeTruthy();
  const { errors } = await runMutation(
    page.page,
    stringVarMutation('userSetSpeechLocale', { locale, provider: 'webspeech' }),
  );
  expect(errors, 'userSetSpeechLocale should be accepted').toEqual([]);
  await waitForRecognizer(page.page, ELEMENT_WAIT_EXTRA_LONG_TIME);
}

// One utterance as a browser produces it: growing interim results, then the final one.
// The pace stays above the client's 200 ms interim debounce so that every interim is
// sent; the race between a pending interim and the final has its own test.
export async function speak(page: Page, sentence: string, { stepMs = 300 } = {}): Promise<void> {
  const words = sentence.split(' ');
  for (let i = 1; i < words.length; i += 1) {
    await emitSpeech(page.page, words.slice(0, i).join(' '), false);
    await sleep(stepMs);
  }
  await emitSpeech(page.page, sentence, true);
}

// The live caption rows of the meeting (caption_history), oldest first.
export async function captionRows(page: Page): Promise<CaptionRow[]> {
  const data = await runQuery(
    page.page,
    queryDocument([
      field('caption_history', [
        field('captionId'),
        field('captionText'),
        field('captionType'),
        field('locale'),
        field('createdAt'),
        field('user', [field('name')]),
      ]),
    ]),
  );
  const rows = (data.caption_history as (CaptionRow & { createdAt: string })[]) ?? [];
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// captionSubmitText as the webspeech client sends it; returns the errors, if any.
export async function submitTranscript(
  page: Page,
  args: {
    transcriptId: string;
    locale: string;
    transcript: string;
    start?: number;
    end?: number;
    text?: string;
    isFinal?: boolean;
  },
): Promise<string[]> {
  // a rejected action reaches Apollo as a transport error (thrown), not as `errors`
  try {
    const { errors } = await runMutation(
      page.page,
      typedVarMutation('captionSubmitText', {
        transcriptId: { type: 'String', value: args.transcriptId },
        start: { type: 'Int', value: args.start ?? 0 },
        end: { type: 'Int', value: args.end ?? 0 },
        text: { type: 'String', value: args.text ?? args.transcript },
        transcript: { type: 'String', value: args.transcript },
        locale: { type: 'String', value: args.locale },
        isFinal: { type: 'Boolean', value: args.isFinal ?? true },
      }),
    );
    return errors;
  } catch (error) {
    return [(error as Error).message];
  }
}

// A typed caption, as plugins submit them (captionSubmitTranscript, captionType TYPED).
export async function submitTypedCaption(
  page: Page,
  transcriptId: string,
  transcript: string,
  locale: string,
): Promise<string[]> {
  const { errors } = await runMutation(
    page.page,
    stringVarMutation('captionSubmitTranscript', { transcriptId, transcript, locale, captionType: 'TYPED' }),
  );
  return errors;
}

export async function textTracks(recordId: string): Promise<TextTrack[]> {
  const { data } = await apiCall<{ response: { returncode: string; tracks: TextTrack[] } }>('getRecordingTextTracks', {
    recordID: recordId,
  });
  expect(data.response.returncode, 'getRecordingTextTracks should succeed').toEqual('SUCCESS');
  return data.response.tracks;
}

export async function trackText(track: TextTrack): Promise<string> {
  const response = await axios.get<string>(track.href, { adapter: 'http', responseType: 'text' });
  expect(response.status, `caption track ${track.href} should be downloadable`).toEqual(200);
  return vttText(response.data);
}

export class Captions extends MultiUsers {
  // Moderator "Alice" and, optionally, viewer "Bob", each in their own context with the fake
  // Web Speech API installed, in a meeting that can be recorded (see startRecording).
  async initCaptionPages(
    testInfo: TestInfo,
    { withViewer = true, record = true, createParameter = '' } = {},
  ): Promise<void> {
    const modContext = await this.browser.newContext();
    await installFakeSpeechRecognition(modContext);
    const modPage = await modContext.newPage();
    this.modPage = new Page(this.browser, modPage, testInfo);
    await this.modPage.init(true, {
      fullName: 'Alice',
      createParameter: [record ? RECORDED_MEETING : '', createParameter].filter(Boolean).join('&') || undefined,
      createModules: CAPTIONS_SETTINGS_MODULE,
      shouldCloseAudioModal: false,
      testInfo,
    });
    if (!withViewer) return;
    const userContext = await this.browser.newContext();
    await installFakeSpeechRecognition(userContext);
    const userPage = await userContext.newPage();
    this.userPage = new Page(this.browser, userPage, testInfo);
    await this.userPage.init(false, {
      fullName: 'Bob',
      meetingId: this.modPage.meetingId,
      shouldCloseAudioModal: false,
      testInfo,
    });
  }

  // The moderator starts the recording from the indicator (confirmation toast).
  async startRecording(): Promise<void> {
    const indicatorButton = this.modPage.page.locator(`${e.recordingIndicator} button`);
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await expect(indicatorButton, 'the recording indicator should show the recording as running').toHaveCSS(
      'border-top-style',
      'solid',
    );
  }

  async endMeeting(): Promise<void> {
    const { data } = await apiCall<{ response: { returncode: string[] } }>('end', {
      meetingID: this.modPage.meetingId,
    });
    expect(data.response.returncode[0], 'end API call should succeed').toEqual('SUCCESS');
  }

  // Waits for the presentation format to be published and returns the recordID.
  async waitForPublishedRecording(): Promise<string> {
    let recordId = '';
    await expect
      .poll(
        async () => {
          const { data } = await apiCall<{
            response: { recordings?: { recording?: { recordID: string[]; state: string[] }[] }[] };
          }>('getRecordings', { meetingID: this.modPage.meetingId });
          const recording = data.response.recordings?.[0]?.recording?.[0];
          if (!recording) return 'not-yet-archived';
          [recordId] = recording.recordID;
          return recording.state[0];
        },
        { message: 'the recording should be published', timeout: RECORDING_PUBLISH_TIMEOUT, intervals: [5000] },
      )
      .toBe('published');
    return recordId;
  }

  // The caption tracks of the published recording, as getRecordingTextTracks serves them:
  // cue text per language.
  async recordedTracks(): Promise<Record<string, string>> {
    const recordId = await this.waitForPublishedRecording();
    const tracks = await textTracks(recordId);
    const texts: Record<string, string> = {};
    for (const track of tracks) {
      texts[track.lang] = await trackText(track);
    }
    return texts;
  }
}
