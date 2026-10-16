import { test } from 'node:test';
import assert from 'node:assert';
import {
  throwErrorIfInvalidLocale,
  throwErrorIfIntOutOfRange,
  throwErrorIfStringTooLong,
} from './validation';
import { ValidationError } from '../types/ValidationError';

const accepts = (fn: () => void) => assert.doesNotThrow(fn);
const rejects = (fn: () => void, status: number = 400) => {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `expected ValidationError, got ${err}`);
    assert.strictEqual(err.status, status);
    return true;
  });
};

// Every locale the shipped client can actually emit must keep working. 'auto' is
// Gladia's auto-detect value sent by userSetCaptionLocale; navigator.language is
// forwarded verbatim to userSetSpeechLocale, hence the longer script/region forms.
const VALID_LOCALES = [
  'en', 'de', 'pt', 'ar', 'bn', 'sw', 'ta', 'ur',
  'en-US', 'es-ES', 'fr-FR', 'pt-BR', 'zh-CN', 'zh-TW', 'af-ZA', 'nb-NO',
  'es-419', 'zh-Hant-TW', 'zh-Hans-CN', 'ca-ES-valencia', 'auto',
];

const INVALID_LOCALES = [
  '--', '-', '-en', 'en-', 'en--US', '0-0', '00', '1-1', 'a',
  'en_US', 'pt_BR', '..', '../..', 'a/b', 'en;rm -rf /', '<script>',
  'en US', 'en.US', 'x'.repeat(16), 'aaaaaaaaa',
];

test('throwErrorIfInvalidLocale accepts every locale the client can send', () => {
  for (const locale of VALID_LOCALES) {
    accepts(() => throwErrorIfInvalidLocale(locale));
    accepts(() => throwErrorIfInvalidLocale(locale, true));
  }
});

test('throwErrorIfInvalidLocale rejects malformed locales', () => {
  for (const locale of INVALID_LOCALES) {
    rejects(() => throwErrorIfInvalidLocale(locale));
    rejects(() => throwErrorIfInvalidLocale(locale, true));
  }
});

test('throwErrorIfInvalidLocale enforces the varchar(15) bound', () => {
  accepts(() => throwErrorIfInvalidLocale('abcdefgh-abcdef'));   // exactly 15
  rejects(() => throwErrorIfInvalidLocale('abcdefgh-abcdefg'));  // 16
});

test("throwErrorIfInvalidLocale treats '' as disabled only when allowed", () => {
  rejects(() => throwErrorIfInvalidLocale(''));
  accepts(() => throwErrorIfInvalidLocale('', true));
});

test('throwErrorIfInvalidLocale rejects non-strings', () => {
  for (const value of [undefined, null, 42, {}, [], true]) {
    rejects(() => throwErrorIfInvalidLocale(value));
    rejects(() => throwErrorIfInvalidLocale(value, true));
  }
});

test('throwErrorIfStringTooLong enforces the boundary', () => {
  accepts(() => throwErrorIfStringTooLong('text', 'x'.repeat(8192), 8192));
  rejects(() => throwErrorIfStringTooLong('text', 'x'.repeat(8193), 8192));
  accepts(() => throwErrorIfStringTooLong('transcriptId', 'x'.repeat(40), 40));
  rejects(() => throwErrorIfStringTooLong('transcriptId', 'x'.repeat(41), 40));
  // A uuid v4 is what the client and the plugin path both send.
  accepts(() => throwErrorIfStringTooLong('transcriptId', '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', 40));
  accepts(() => throwErrorIfStringTooLong('text', '', 8192));
});

test('throwErrorIfIntOutOfRange rejects negatives and overflow', () => {
  accepts(() => throwErrorIfIntOutOfRange('start', 0, 0, 8192));
  accepts(() => throwErrorIfIntOutOfRange('start', 8192, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', -1, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', -2147483648, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('end', 2147483647, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', 8193, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', 1.5, 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', '0', 0, 8192));
  rejects(() => throwErrorIfIntOutOfRange('start', undefined, 0, 8192));
});
