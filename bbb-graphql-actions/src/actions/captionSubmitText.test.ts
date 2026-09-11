import { test } from 'node:test';
import assert from 'node:assert';
import buildRedisMessage from './captionSubmitText';
import { MAX_TRANSCRIPT_ID_LENGTH, MAX_TRANSCRIPT_LENGTH } from '../imports/captionLimits';
import { ValidationError } from '../types/ValidationError';

const accepts = (fn: () => void) => assert.doesNotThrow(fn);
const rejects = (fn: () => void, status: number = 400) => {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `expected ValidationError, got ${err}`);
    assert.strictEqual(err.status, status);
    return true;
  });
};

const SESSION = {
  'x-hasura-meetingid': 'meeting-1',
  'x-hasura-userid': 'w_abcdefghijkl',
};

const UUID = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';

const input = (overrides: Record<string, unknown> = {}) => ({
  transcriptId: UUID,
  start: 0,
  end: 0,
  text: 'hello',
  transcript: 'hello',
  locale: 'en-US',
  isFinal: false,
  ...overrides,
});

const submit = (overrides: Record<string, unknown> = {}) => () => buildRedisMessage(SESSION, input(overrides));

test('captionSubmitText builds the expected redis message', () => {
  const msg = buildRedisMessage(SESSION, input({ start: 2, end: 5, isFinal: true }));

  assert.strictEqual(msg.eventName, 'UpdateTranscriptPubMsg');
  assert.deepStrictEqual(msg.routing, { meetingId: 'meeting-1', userId: 'w_abcdefghijkl' });
  assert.deepStrictEqual(msg.header, {
    name: 'UpdateTranscriptPubMsg',
    meetingId: 'meeting-1',
    userId: 'w_abcdefghijkl',
  });
  assert.deepStrictEqual(msg.body, {
    transcriptId: UUID,
    start: 2,
    end: 5,
    text: 'hello',
    transcript: 'hello',
    locale: 'en-US',
    result: true,
  });
});

// The regression this fix is about: the action used to hardcode 8192, so a
// meeting configured with a higher public.captions.maxTextLength had its valid
// submissions rejected here before akka-apps ever saw them.
test('captionSubmitText accepts text above the old hardcoded 8192 limit', () => {
  const long = 'x'.repeat(16384);
  assert.ok(MAX_TRANSCRIPT_LENGTH >= 16384, 'ceiling must leave room above the old 8192 limit');

  const msg = buildRedisMessage(SESSION, input({ text: long, transcript: long }));
  assert.strictEqual(msg.body.text, long);
  assert.strictEqual(msg.body.transcript, long);
});

test('captionSubmitText enforces the transport ceiling on text and transcript', () => {
  const atCeiling = 'x'.repeat(MAX_TRANSCRIPT_LENGTH);
  const overCeiling = 'x'.repeat(MAX_TRANSCRIPT_LENGTH + 1);

  accepts(submit({ text: atCeiling, transcript: atCeiling }));
  rejects(submit({ text: overCeiling }));
  rejects(submit({ transcript: overCeiling }));
});

test('captionSubmitText enforces the transcriptId length cap', () => {
  accepts(submit({ transcriptId: UUID }));
  accepts(submit({ transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH) }));
  rejects(submit({ transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH + 1) }));
});

test('captionSubmitText rejects out-of-range and inverted offsets', () => {
  accepts(submit({ start: 0, end: MAX_TRANSCRIPT_LENGTH }));
  rejects(submit({ start: -1, end: 0 }));
  rejects(submit({ start: 0, end: MAX_TRANSCRIPT_LENGTH + 1 }));
  rejects(submit({ start: 5, end: 2 }));
});

test('captionSubmitText rejects malformed locales', () => {
  accepts(submit({ locale: 'en' }));
  rejects(submit({ locale: '' }));
  rejects(submit({ locale: 'en_US' }));
  rejects(submit({ locale: '../..' }));
});

test('captionSubmitText requires every documented parameter', () => {
  for (const name of ['transcriptId', 'start', 'end', 'text', 'transcript', 'locale', 'isFinal']) {
    const partial = input();
    delete (partial as Record<string, unknown>)[name];
    rejects(() => buildRedisMessage(SESSION, partial), 403);
  }
});
