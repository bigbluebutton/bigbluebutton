import { expect, Page as PlaywrightPage, test } from '@playwright/test';

import { openPublicChat } from '../chat/util';
import {
  ELEMENT_WAIT_EXTRA_LONG_TIME,
  ELEMENT_WAIT_LONGER_TIME,
  ELEMENT_WAIT_TIME,
  RECORDING_PROCESSING_WAIT_TIME,
} from '../core/constants';
import { elements as e, playbackElements } from '../core/elements';
import { getRecordings } from '../core/endpoints';
import { answerPollOption, openPoll } from '../polling/util';
import { startScreenshare } from '../screenshare/util';
import { getBlockNoteEditorLocator, startSharedNotesBlockNote } from '../sharednotes/blocknote/util';
import { dragAcrossWhiteboard } from '../whiteboard/util';
import { findPlaybackFormat, Recording, RecordingPlaybackFormat } from './recording';

// Formats the server under test publishes, e.g. RECORDING_FORMATS=presentation,podcast,video
// A default install publishes only presentation; a test of another format skips unless it is listed.
export const RECORDING_FORMATS: string[] = (process.env.RECORDING_FORMATS || 'presentation')
  .split(',')
  .map((format) => format.trim())
  .filter(Boolean);

// How far a recorded length may be from the time the moderator's client saw the recording
// run: each start, pause and resume shows there a round trip after the server took it, the
// end is timed at the click, and the media is cut to whole frames and audio packets.
// Measured, the two differed by under a second, under load.
export const RECORDED_LENGTH_TOLERANCE = 4;

const MEDIA_RECORDING_SECONDS = 20;
const SCREENSHARE_START_SECONDS = 8;
const SHAPE_START_SECONDS = 4;
const PAUSE_SECONDS = 15;
const RESUMED_SECONDS = 6;
const RECORDING_POLL_INTERVAL = 10000;
// The recorded fake speech has an RMS of about 0.09 (-21 dBFS); a recording without a
// microphone has digital silence, about 0.00003 (-91 dBFS).
const MIN_SPEECH_RMS = 0.01;
// Standard deviation of the luma of one frame: about 60 for the fake camera, 0.01 for
// the black canvas a recording without webcams also gets.
const MIN_FRAME_LUMA_DEVIATION = 10;

export const pollQuestion = 'Is this poll in the recording?';
export const messageBeforePause = 'Recorded before the pause';
export const messageWhilePaused = 'Sent while the recording was paused';
export const messageAfterResume = 'Recorded after resuming';

type RecordingData = {
  recordID?: string[];
  isBreakout?: string[];
  breakout?: { parentId?: string[]; sequence?: string[] }[];
  playback?: { format?: RecordingPlaybackFormat[] }[];
};

export interface RecordedMeeting {
  meetingId: string;
  recordId: string;
  recording: RecordingData;
  // seconds the recording ran, as seen by the moderator's client
  recordedSeconds: number;
  // seconds into the recorded timeline at which something happened
  marks: Record<string, number>;
}

export interface DecodedAudio {
  duration: number;
  rms: number;
  peak: number;
}

const secondsSince = (start: number) => (Date.now() - start) / 1000;

// Walks the MP4 boxes to the movie header: the browsers Playwright ships cannot decode
// the H.264 of the video format, so its duration is read from the file instead.
export function mp4Duration(data: Buffer): number {
  const findBox = (start: number, end: number, type: string) => {
    let offset = start;
    while (offset + 8 <= end) {
      let size = data.readUInt32BE(offset);
      let header = 8;
      if (size === 1) {
        size = Number(data.readBigUInt64BE(offset + 8));
        header = 16;
      } else if (size === 0) {
        size = end - offset;
      }
      if (data.toString('latin1', offset + 4, offset + 8) === type) {
        return { start: offset + header, end: offset + size };
      }
      if (size < header) return null;
      offset += size;
    }
    return null;
  };
  const moov = findBox(0, data.length, 'moov');
  const mvhd = moov && findBox(moov.start, moov.end, 'mvhd');
  if (!mvhd) throw new Error('the file has no moov/mvhd box');
  const version = data[mvhd.start];
  const timescale = data.readUInt32BE(mvhd.start + (version === 1 ? 20 : 12));
  const duration = version === 1 ? Number(data.readBigUInt64BE(mvhd.start + 24)) : data.readUInt32BE(mvhd.start + 16);
  return duration / timescale;
}

// Decodes the audio of a media file of the page's origin.
export const decodeAudio = (page: PlaywrightPage, url: string): Promise<DecodedAudio> =>
  page.evaluate(async (mediaUrl) => {
    const response = await fetch(mediaUrl);
    if (!response.ok) throw new Error(`${mediaUrl} answered HTTP ${response.status}`);
    const buffer = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(await response.arrayBuffer());
    const samples = buffer.getChannelData(0);
    let sum = 0;
    let peak = 0;
    samples.forEach((sample) => {
      sum += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    });
    return { duration: buffer.duration, rms: Math.sqrt(sum / samples.length), peak };
  }, url);

// Metadata of a media file of the page's origin, as a video element loads it.
export const probeVideo = (page: PlaywrightPage, url: string) =>
  page.evaluate(
    (mediaUrl) =>
      new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'metadata';
        video.onloadedmetadata = () =>
          resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
        video.onerror = () => reject(new Error(`${mediaUrl} could not be loaded: ${video.error?.message}`));
        video.src = mediaUrl;
      }),
    url,
  );

const annotate = (type: string, values: object) =>
  test.info().annotations.push({ type, description: JSON.stringify(values) });

const unpublishedFormats = (recording: RecordingData | undefined, types: string[]) =>
  types.filter((type) => !findPlaybackFormat(recording, type));

function expectRecordedLength(actual: number, recorded: RecordedMeeting, description: string) {
  annotate(description, { actual, recordedSeconds: recorded.recordedSeconds, recordId: recorded.recordId });
  expect(
    Math.abs(actual - recorded.recordedSeconds),
    `${description}: ${actual.toFixed(1)} s, the recording ran ${recorded.recordedSeconds.toFixed(1)} s ` +
      `(record ${recorded.recordId})`,
  ).toBeLessThanOrEqual(RECORDED_LENGTH_TOLERANCE);
}

// The format is listed for the recording; returns its URL.
function formatUrl(recorded: RecordedMeeting, type: string): string {
  test.skip(!RECORDING_FORMATS.includes(type), `RECORDING_FORMATS does not list the ${type} format`);
  const url = findPlaybackFormat(recorded.recording, type)?.url?.[0];
  expect(url, `the recording should list the ${type} format (record ${recorded.recordId})`).toBeTruthy();
  return url!;
}

// Waits until the meeting's recording is published in the presentation format and in those
// of the given formats that RECORDING_FORMATS lists. A format that never shows up is left
// for its own test to report.
export async function waitForPublishedRecording(
  page: PlaywrightPage,
  meetingId: string,
  formats: string[] = [],
): Promise<{ recordId: string; recording: RecordingData }> {
  const expected = ['presentation', ...formats.filter((format) => RECORDING_FORMATS.includes(format))];
  const deadline = Date.now() + RECORDING_PROCESSING_WAIT_TIME;
  let recording: RecordingData | undefined;
  do {
    await page.waitForTimeout(RECORDING_POLL_INTERVAL);
    const { data } = await getRecordings(meetingId);
    recording = data.response.recordings?.[0]?.recording?.[0];
  } while (Date.now() < deadline && unpublishedFormats(recording, expected).length > 0);
  const recordId = recording?.recordID?.[0];
  if (!recordId || !findPlaybackFormat(recording, 'presentation')) {
    throw new Error(
      `meeting ${meetingId} (record ${recordId}) was not published in the presentation format ` +
        `within ${RECORDING_PROCESSING_WAIT_TIME / 1000} s`,
    );
  }
  return { recordId, recording: recording! };
}

export class RecordedPlayback extends Recording {
  private get recordingButton() {
    return this.modPage.page.locator(`${e.recordingIndicator} button`);
  }

  // Confirms the start, pause or resume the toast offers; returns when the client shows the new state.
  private async toggleRecording(expectedLabel: string, description: string): Promise<number> {
    await this.modPage.waitAndClick(e.recordingIndicator);
    await this.modPage.waitAndClick(e.confirmRecordingButton);
    await expect(this.recordingButton, description).toHaveAttribute('aria-label', expectedLabel, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    return Date.now();
  }

  private async endRecordedMeeting(): Promise<number> {
    await this.modPage.waitAndClick(e.leaveMeetingDropdown);
    await this.modPage.waitAndClick(e.endMeetingButton);
    await this.modPage.hasElement(e.simpleModal, 'should display the confirm meeting end modal');
    await this.modPage.waitAndClick(e.confirmEndMeetingButton);
    const endedAt = Date.now();
    await this.modPage.hasElement(e.meetingEndedModal, 'should display the meeting ended modal for the moderator');
    return endedAt;
  }

  // The moderator talks (fake speech) with the camera on through about 20 s of recording,
  // and shares the screen from about 8 s in.
  async recordMeetingWithMedia(): Promise<RecordedMeeting> {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.joinMicrophone();
    await this.modPage.shareWebcam();

    const startedAt = await this.toggleRecording('Pause recording', 'the recording should start');
    await this.modPage.page.waitForTimeout(SCREENSHARE_START_SECONDS * 1000);
    const screenshareRequested = secondsSince(startedAt);
    await startScreenshare(this.modPage);
    const screenshareStarted = secondsSince(startedAt);
    await this.modPage.page.waitForTimeout(Math.max(0, (MEDIA_RECORDING_SECONDS - screenshareStarted) * 1000));
    await this.modPage.hasElement(e.isTalking, 'the moderator should still be talking at the end of the recording');
    const endedAt = await this.endRecordedMeeting();

    const { recordId, recording } = await waitForPublishedRecording(this.modPage.page, this.modPage.meetingId, [
      'podcast',
      'video',
      'screenshare',
    ]);
    return {
      meetingId: this.modPage.meetingId,
      recordId,
      recording,
      recordedSeconds: (endedAt - startedAt) / 1000,
      marks: { screenshareRequested, screenshareStarted },
    };
  }

  private async sendPublicMessage(message: string) {
    if (!(await this.modPage.checkElement(e.chatBox))) await this.modPage.waitAndClick(e.messagesSidebarButton);
    await openPublicChat(this.modPage);
    await this.modPage.fill(e.chatBox, message);
    await this.modPage.waitAndClick(e.sendButton);
    await this.modPage.hasText(e.chatMessages, message, `should send the chat message "${message}"`);
  }

  // A chat message, a shape and a published poll are recorded, the recording is paused
  // for 15 s (with a chat message sent meanwhile), then resumed for a chat message and
  // shared notes.
  async recordMeetingWithContentAndPause(): Promise<RecordedMeeting> {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const startedAt = await this.toggleRecording('Pause recording', 'the recording should start');
    await this.sendPublicMessage(messageBeforePause);

    await this.modPage.page.waitForTimeout(Math.max(0, (SHAPE_START_SECONDS - secondsSince(startedAt)) * 1000));
    await this.modPage.waitAndClick(e.wbRectangleShape);
    const shapeStarted = secondsSince(startedAt);
    await dragAcrossWhiteboard(this.modPage, 0.3, 0.6);
    await this.userPage.hasElement(e.wbDrawnShape, 'the viewer should see the rectangle the moderator drew');
    const shapeDrawn = secondsSince(startedAt);

    await openPoll(this.modPage);
    await this.modPage.fill(e.pollQuestionArea, pollQuestion);
    await this.modPage.waitAndClick(e.startPoll);
    await answerPollOption(this.userPage, 'A');
    await this.modPage.waitAndClick(e.publishPollingLabel);
    await this.userPage.hasElement(e.wbPollShape, 'the viewer should see the published poll result');
    const pollPublished = secondsSince(startedAt);

    const pausedAt = await this.toggleRecording('Resume recording', 'the recording should pause');
    await this.sendPublicMessage(messageWhilePaused);
    await this.modPage.page.waitForTimeout(Math.max(0, (PAUSE_SECONDS - secondsSince(pausedAt)) * 1000));

    const resumedAt = await this.toggleRecording('Pause recording', 'the recording should resume');
    await this.sendPublicMessage(messageAfterResume);
    await startSharedNotesBlockNote(this.modPage);
    const notesLocator = getBlockNoteEditorLocator(this.modPage);
    await notesLocator.click();
    await notesLocator.pressSequentially(e.testMessage);
    await expect(notesLocator, 'should contain the typed text on shared notes').toContainText(e.testMessage, {
      timeout: ELEMENT_WAIT_TIME,
    });
    await this.modPage.page.waitForTimeout(Math.max(0, (RESUMED_SECONDS - secondsSince(resumedAt)) * 1000));
    const endedAt = await this.endRecordedMeeting();

    const { recordId, recording } = await waitForPublishedRecording(this.modPage.page, this.modPage.meetingId, [
      'notes',
    ]);
    const firstSegment = (pausedAt - startedAt) / 1000;
    return {
      meetingId: this.modPage.meetingId,
      recordId,
      recording,
      recordedSeconds: firstSegment + (endedAt - resumedAt) / 1000,
      marks: { shapeStarted, shapeDrawn, pollPublished, firstSegment, paused: (resumedAt - pausedAt) / 1000 },
    };
  }

  async openPlayback(recorded: RecordedMeeting) {
    const url = findPlaybackFormat(recorded.recording, 'presentation')!.url![0];
    const response = await this.playbackPage.page.goto(url);
    expect(response?.ok(), 'playback URL should be accessible').toBeTruthy();
    await expect
      .poll(
        () =>
          this.playbackPage.page
            .locator(playbackElements.webcamsVideo)
            .evaluate((video: HTMLVideoElement) => video.readyState)
            .catch(() => 0),
        { message: 'the playback media should load', timeout: ELEMENT_WAIT_EXTRA_LONG_TIME },
      )
      .toBeGreaterThanOrEqual(1); // HAVE_METADATA
  }

  async playbackDuration(): Promise<number> {
    return this.playbackPage.page
      .locator(playbackElements.webcamsVideo)
      .evaluate((video: HTMLVideoElement) => video.duration);
  }

  // Moves the playback to a time, as the seek bar does.
  async seekPlayback(seconds: number) {
    await this.playbackPage.page.locator(playbackElements.webcamsVideo).evaluate(
      (video: HTMLVideoElement, time) =>
        new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
          // eslint-disable-next-line no-param-reassign
          video.currentTime = time;
        }),
      seconds,
    );
  }

  // Standard deviation of the luma of the frame the webcams video shows.
  async webcamsFrameLumaDeviation(): Promise<number> {
    return this.playbackPage.page.locator(playbackElements.webcamsVideo).evaluate((video: HTMLVideoElement) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(video, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      let sumOfSquares = 0;
      const pixels = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += luma;
        sumOfSquares += luma * luma;
      }
      const mean = sum / pixels;
      return Math.sqrt(sumOfSquares / pixels - mean * mean);
    });
  }

  async webcamsVideo(recorded: RecordedMeeting) {
    await this.openPlayback(recorded);
    const { width, height } = await this.playbackPage.page
      .locator(playbackElements.webcamsVideo)
      .evaluate((video: HTMLVideoElement) => ({ width: video.videoWidth, height: video.videoHeight }));
    expect(width, `the playback should have a webcams video (record ${recorded.recordId})`).toBeGreaterThan(0);
    expect(height, `the playback should have a webcams video (record ${recorded.recordId})`).toBeGreaterThan(0);
    expectRecordedLength(await this.playbackDuration(), recorded, 'webcams video duration');

    await this.seekPlayback(recorded.recordedSeconds / 2);
    const deviation = await this.webcamsFrameLumaDeviation();
    annotate('webcams frame luma deviation', { deviation });
    expect(
      deviation,
      `the webcams video should show the shared camera, not an empty canvas (record ${recorded.recordId})`,
    ).toBeGreaterThan(MIN_FRAME_LUMA_DEVIATION);
  }

  async screenshareAfterSeeking(recorded: RecordedMeeting) {
    const { screenshareRequested, screenshareStarted } = recorded.marks;
    await this.openPlayback(recorded);
    const screenshareVideo = this.playbackPage.page.locator(playbackElements.screenshareVideo);

    await this.seekPlayback(screenshareRequested / 2);
    await expect(screenshareVideo, 'the screenshare should not show before it was started').toBeHidden();

    await this.seekPlayback(screenshareStarted + 3);
    await expect(
      screenshareVideo,
      `the screenshare should show once the playback is past its start (record ${recorded.recordId})`,
    ).toBeVisible({ timeout: ELEMENT_WAIT_LONGER_TIME });
    await expect
      .poll(() => screenshareVideo.evaluate((video: HTMLVideoElement) => video.videoWidth), {
        message: 'the screenshare video should have a decoded size',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBeGreaterThan(0);
  }

  async recordedAudioIsNotSilent(recorded: RecordedMeeting) {
    await this.openPlayback(recorded);
    const mediaUrl = await this.playbackPage.page
      .locator(playbackElements.webcamsVideo)
      .evaluate((video: HTMLVideoElement) => video.currentSrc);
    const audio = await decodeAudio(this.playbackPage.page, mediaUrl);
    annotate('recorded audio', { mediaUrl, ...audio });
    expectRecordedLength(audio.duration, recorded, 'recorded audio duration');
    expect(
      audio.rms,
      `the recorded audio should carry the moderator's speech, not silence (record ${recorded.recordId})`,
    ).toBeGreaterThan(MIN_SPEECH_RMS);
  }

  async shapeAfterSeeking(recorded: RecordedMeeting) {
    const { shapeStarted, shapeDrawn } = recorded.marks;
    await this.openPlayback(recorded);
    const shapes = this.playbackPage.page.locator(playbackElements.presentationShape);

    await this.seekPlayback(shapeStarted / 2);
    await expect(shapes, 'the rectangle should not show before it was drawn').toHaveCount(0);

    await this.seekPlayback(shapeDrawn + 2);
    await expect(
      shapes,
      `the rectangle should show once the playback is past the time it was drawn (record ${recorded.recordId})`,
    ).toHaveCount(1, { timeout: ELEMENT_WAIT_LONGER_TIME });
  }

  async pollResultInChat(recorded: RecordedMeeting) {
    await this.openPlayback(recorded);
    await this.playbackPage.hasText(
      playbackElements.pollQuestion,
      pollQuestion,
      `the playback chat should show the published poll (record ${recorded.recordId})`,
    );
    await this.playbackPage.hasText(
      playbackElements.pollResult,
      /1\s*:\s*1\D[^%]*100(\.0+)?%/,
      'the playback chat should show the one vote for the first option',
    );
  }

  async pauseIsLeftOut(recorded: RecordedMeeting) {
    const { firstSegment, paused } = recorded.marks;
    await this.openPlayback(recorded);
    const duration = await this.playbackDuration();
    annotate('segments', { firstSegment, paused, duration });
    expect(
      duration,
      `the playback should not include the ${paused.toFixed(1)} s pause (record ${recorded.recordId})`,
    ).toBeLessThan(recorded.recordedSeconds + paused / 2);
    expectRecordedLength(duration, recorded, 'duration of the recorded segments');

    await this.playbackPage.hasText(
      playbackElements.chatContentArea,
      messageBeforePause,
      'the playback chat should have the message sent before the pause',
    );
    await this.playbackPage.hasText(
      playbackElements.chatContentArea,
      messageAfterResume,
      'the playback chat should have the message sent after resuming',
    );
    await expect(
      this.playbackPage.page.locator(playbackElements.chatContentArea),
      `the playback chat should not have the message sent while paused (record ${recorded.recordId})`,
    ).not.toContainText(messageWhilePaused);
  }

  // The media file a format's page plays.
  async formatMediaUrl(pageUrl: string): Promise<string> {
    const response = await this.playbackPage.page.request.get(pageUrl);
    expect(response.ok(), `${pageUrl} should be retrievable`).toBeTruthy();
    const source = (await response.text()).match(/<source\s+src="([^"]+)"/);
    expect(source, `${pageUrl} should name its media file`).toBeTruthy();
    return new URL(source![1], pageUrl).href;
  }

  async podcastFormat(recorded: RecordedMeeting) {
    const url = formatUrl(recorded, 'podcast');
    await this.playbackPage.page.goto(new URL('/', url).href);
    const audio = await decodeAudio(this.playbackPage.page, url);
    annotate('podcast audio', { url, ...audio });
    expectRecordedLength(audio.duration, recorded, 'podcast audio duration');
  }

  async videoFormat(recorded: RecordedMeeting) {
    const mediaUrl = await this.formatMediaUrl(formatUrl(recorded, 'video'));
    const response = await this.playbackPage.page.request.get(mediaUrl);
    expect(response.ok(), `${mediaUrl} should be retrievable`).toBeTruthy();
    expectRecordedLength(mp4Duration(await response.body()), recorded, 'video format duration');
  }

  async screenshareFormat(recorded: RecordedMeeting) {
    const mediaUrl = await this.formatMediaUrl(formatUrl(recorded, 'screenshare'));
    await this.playbackPage.page.goto(new URL('/', mediaUrl).href);
    const video = await probeVideo(this.playbackPage.page, mediaUrl);
    annotate('screenshare format video', { mediaUrl, ...video });
    expect(video.width, `${mediaUrl} should have a video track`).toBeGreaterThan(0);
    expectRecordedLength(video.duration, recorded, 'screenshare format duration');
  }

  async notesFormat(recorded: RecordedMeeting) {
    const url = formatUrl(recorded, 'notes');
    const response = await this.playbackPage.page.request.get(url);
    expect(response.ok(), `${url} should be retrievable`).toBeTruthy();
    expect(response.headers()['content-type'], 'the notes should be served as a PDF').toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString('latin1'), 'the notes file should be a PDF').toBe('%PDF-');
  }
}
