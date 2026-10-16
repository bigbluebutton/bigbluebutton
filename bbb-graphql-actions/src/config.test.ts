import { test } from 'node:test';
import assert from 'node:assert';
import { parseCaptionTextCeiling } from './config';

const DEFAULT = 65536;

test('parseCaptionTextCeiling uses the default when unset or blank', () => {
  for (const raw of [undefined, '', '   ']) {
    assert.strictEqual(parseCaptionTextCeiling(raw), DEFAULT);
  }
});

test('parseCaptionTextCeiling accepts positive decimal integers', () => {
  assert.strictEqual(parseCaptionTextCeiling('1'), 1);
  assert.strictEqual(parseCaptionTextCeiling('8192'), 8192);
  assert.strictEqual(parseCaptionTextCeiling('131072'), 131072);
  assert.strictEqual(parseCaptionTextCeiling(' 42 '), 42);
});

test('parseCaptionTextCeiling rejects non-finite, non-integer and non-positive overrides', () => {
  const invalid = [
    'Infinity', '-Infinity', '1e400', 'NaN', 'abc',
    '0', '-5', '1.5', '0x10', '1e4', '+10', '9007199254740993',
  ];
  for (const raw of invalid) {
    assert.strictEqual(parseCaptionTextCeiling(raw), DEFAULT, `expected default for '${raw}'`);
  }
});
