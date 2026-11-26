import { test } from 'node:test';
import assert from 'node:assert';
import buildRedisMessage from './meetingLayoutSetProps';
import { ValidationError } from '../types/ValidationError';

const rejects = (fn: () => void, status: number) => {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `expected ValidationError, got ${err}`);
    assert.strictEqual(err.status, status);
    return true;
  });
};

const PRESENTER = {
  'x-hasura-meetingid': 'meeting-1',
  'x-hasura-userid': 'w_abcdefghijkl',
  'x-hasura-presenterinmeeting': 'meeting-1',
};

const input = (overrides: Record<string, unknown> = {}) => ({
  layout: 'CUSTOM_LAYOUT',
  syncWithPresenterLayout: true,
  presentationIsOpen: true,
  cameraPosition: 'contentTop',
  focusedCamera: 'none',
  cameraDockSize: 0.35,
  ...overrides,
});

test('meetingLayoutSetProps sends the dock size as a fraction of its area', () => {
  const msg = buildRedisMessage(PRESENTER, input());
  assert.strictEqual(msg.eventName, 'BroadcastLayoutMsg');
  assert.deepStrictEqual(msg.routing, { meetingId: 'meeting-1', userId: 'w_abcdefghijkl' });
  assert.deepStrictEqual(msg.body, {
    layout: 'CUSTOM_LAYOUT',
    pushLayout: true,
    presentationIsOpen: true,
    cameraPosition: 'contentTop',
    focusedCamera: 'none',
    cameraDockSize: 0.35,
  });
});

test('meetingLayoutSetProps no longer carries isResizing or presentationVideoRate', () => {
  const msg = buildRedisMessage(PRESENTER, input({ isResizing: true, presentationVideoRate: 0.2 }));
  assert.ok(!('isResizing' in (msg.body as Record<string, unknown>)));
  assert.ok(!('presentationVideoRate' in (msg.body as Record<string, unknown>)));
});

test('meetingLayoutSetProps sends an empty position when none is given', () => {
  const msg = buildRedisMessage(PRESENTER, input({ cameraPosition: null }));
  assert.strictEqual((msg.body as Record<string, unknown>).cameraPosition, '');
});

test('meetingLayoutSetProps requires a numeric dock size (0 means not set)', () => {
  assert.doesNotThrow(() => buildRedisMessage(PRESENTER, input({ cameraDockSize: 0 })));
  const { cameraDockSize, ...withoutSize } = input();
  assert.strictEqual(cameraDockSize, 0.35);
  rejects(() => buildRedisMessage(PRESENTER, withoutSize), 403);
  rejects(() => buildRedisMessage(PRESENTER, input({ cameraDockSize: '0.35' })), 400);
});

test('meetingLayoutSetProps is for the presenter only', () => {
  rejects(() => buildRedisMessage({ ...PRESENTER, 'x-hasura-presenterinmeeting': '' }, input()), 403);
});
