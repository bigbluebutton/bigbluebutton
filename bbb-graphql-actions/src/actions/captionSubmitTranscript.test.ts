import { test } from 'node:test';
import assert from 'node:assert';
import buildRedisMessage from './captionSubmitTranscript';
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

const MODERATOR = {
  'x-hasura-meetingid': 'meeting-1',
  'x-hasura-userid': 'w_abcdefghijkl',
  'x-hasura-moderatorinmeeting': 'meeting-1',
};

const UUID = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';

const input = (overrides: Record<string, unknown> = {}) => ({
  transcriptId: UUID,
  transcript: 'hello',
  locale: 'en-US',
  captionType: 'TYPED',
  ...overrides,
});

const submit = (overrides: Record<string, unknown> = {}) => () => buildRedisMessage(MODERATOR, input(overrides));

test('captionSubmitTranscript builds the expected redis message', () => {
  const msg = buildRedisMessage(MODERATOR, input());

  assert.strictEqual(msg.eventName, 'CaptionSubmitTranscriptPubMsg');
  assert.deepStrictEqual(msg.routing, { meetingId: 'meeting-1', userId: 'w_abcdefghijkl' });
  assert.deepStrictEqual(msg.body, {
    transcriptId: UUID,
    transcript: 'hello',
    locale: 'en-US',
    captionType: 'TYPED',
  });
});

test('captionSubmitTranscript is moderator-only', () => {
  rejects(() => buildRedisMessage({ ...MODERATOR, 'x-hasura-moderatorinmeeting': '' }, input()), 403);
});

// Same regression as captionSubmitText: both actions must share one ceiling.
test('captionSubmitTranscript accepts a transcript above the old 8192 limit', () => {
  const long = 'x'.repeat(16384);
  assert.ok(MAX_TRANSCRIPT_LENGTH >= 16384, 'ceiling must leave room above the old 8192 limit');

  const msg = buildRedisMessage(MODERATOR, input({ transcript: long }));
  assert.strictEqual(msg.body.transcript, long);
});

test('captionSubmitTranscript enforces the shared ceiling and id cap', () => {
  accepts(submit({ transcript: 'x'.repeat(MAX_TRANSCRIPT_LENGTH) }));
  rejects(submit({ transcript: 'x'.repeat(MAX_TRANSCRIPT_LENGTH + 1) }));

  accepts(submit({ transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH) }));
  rejects(submit({ transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH + 1) }));
});

test('captionSubmitTranscript rejects malformed locales', () => {
  accepts(submit({ locale: 'pt-BR' }));
  rejects(submit({ locale: '' }));
  rejects(submit({ locale: 'en;rm -rf /' }));
});

test('captionSubmitTranscript requires every documented parameter', () => {
  for (const name of ['transcriptId', 'transcript', 'locale', 'captionType']) {
    const partial = input();
    delete (partial as Record<string, unknown>)[name];
    rejects(() => buildRedisMessage(MODERATOR, partial), 403);
  }
});
