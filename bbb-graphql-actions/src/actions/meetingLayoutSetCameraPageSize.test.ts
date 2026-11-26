import { test } from 'node:test';
import assert from 'node:assert';
import buildRedisMessage from './meetingLayoutSetCameraPageSize';
import { ValidationError } from '../types/ValidationError';

const rejects = (fn: () => void, status: number) => {
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
  'x-hasura-presenterinmeeting': '',
};

const VIEWER = { ...MODERATOR, 'x-hasura-moderatorinmeeting': '' };

test('meetingLayoutSetCameraPageSize builds the expected redis message', () => {
  const msg = buildRedisMessage(MODERATOR, { cameraPageSize: 4 });

  assert.strictEqual(msg.eventName, 'SetCameraPageSizeReqMsg');
  assert.deepStrictEqual(msg.header, {
    name: 'SetCameraPageSizeReqMsg',
    meetingId: 'meeting-1',
    userId: 'w_abcdefghijkl',
  });
  assert.deepStrictEqual(msg.body, { cameraPageSize: 4 });
});

test('meetingLayoutSetCameraPageSize rejects a size below 1 or not an integer', () => {
  rejects(() => buildRedisMessage(MODERATOR, { cameraPageSize: 0 }), 400);
  rejects(() => buildRedisMessage(MODERATOR, { cameraPageSize: -3 }), 400);
  rejects(() => buildRedisMessage(MODERATOR, { cameraPageSize: 2.5 }), 400);
  rejects(() => buildRedisMessage(MODERATOR, {}), 400);
});

test('meetingLayoutSetCameraPageSize rejects users who are neither moderator nor presenter', () => {
  rejects(() => buildRedisMessage(VIEWER, { cameraPageSize: 4 }), 403);
  assert.doesNotThrow(() => buildRedisMessage({ ...VIEWER, 'x-hasura-presenterinmeeting': 'meeting-1' }, { cameraPageSize: 4 }));
});
