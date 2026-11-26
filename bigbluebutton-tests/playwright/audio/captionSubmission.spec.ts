import { expect } from '@playwright/test';
import { randomUUID } from 'crypto';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { graphql, GraphqlResult, readRows } from '../core/graphql';
import { endMeetings } from '../core/helpers';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';
import { audioCaptionsOverrides } from './audioCaptions';

// The caption mutations the client sends (bigbluebutton-html5 audio/audio-graphql/audio-captions
// and plugins-engine/server-commands/caption/save), sent here over the participant's own GraphQL
// session with values the client never produces. bbb-graphql-actions answers a refusal with an
// error; akka-apps drops what it refuses, so those cases are checked on the stored rows.
const SUBMIT_TEXT =
  'mutation SubmitText($transcriptId: String!, $start: Int!, $end: Int!, $text: String!, $transcript: String!, $locale: String!, $isFinal: Boolean!) { captionSubmitText(transcriptId: $transcriptId, start: $start, end: $end, text: $text, transcript: $transcript, locale: $locale, isFinal: $isFinal) }';
const SUBMIT_TRANSCRIPT =
  'mutation SubmitTranscript($transcriptId: String!, $transcript: String!, $locale: String!, $captionType: String!) { captionSubmitTranscript(transcriptId: $transcriptId, transcript: $transcript, locale: $locale, captionType: $captionType) }';
const SET_SPEECH_LOCALE =
  'mutation SetSpeechLocale($locale: String!, $provider: String!) { userSetSpeechLocale(locale: $locale, provider: $provider) }';
const SET_CAPTION_LOCALE =
  'mutation SetCaptionLocale($locale: String!, $provider: String!) { userSetCaptionLocale(locale: $locale, provider: $provider) }';
const ADD_CAPTION_LOCALE = 'mutation AddCaptionLocale($locale: String!) { captionAddLocale(locale: $locale) }';
const CAPTIONS = 'subscription { caption_history { captionId captionText userId locale } }';
const ACTIVE_LOCALES = 'subscription { caption_activeLocales { locale captionType } }';
const CURRENT_USER = 'subscription { user_current { userId } }';

interface CaptionRow {
  captionId: string;
  captionText: string;
  userId: string;
  locale: string;
}

interface ActiveLocaleRow {
  locale: string;
  captionType: string;
}

// bbb-graphql-actions' answers (src/imports/validation.ts and the caption actions)
const INVALID_LOCALE_FORMAT = /Invalid locale format/;
const NOT_CANONICAL = /Locale must be a canonical BCP 47 language tag/;
const NOT_MODERATOR = /Permission Denied \(not moderator\)/;
const tooLong = (name: string, max: number) => new RegExp(`Parameter '${name}' exceeds the maximum length of ${max}`);
const outOfRange = (name: string, max: number) =>
  new RegExp(`Parameter '${name}' must be an integer between 0 and ${max}`);
const START_AFTER_END = /Parameter `start` must not be greater than `end`/;
const NOT_ALPHANUMERIC_ID = /Parameter 'transcriptId' must contain only letters, digits, '-' and '_'/;

// The transport ceiling of bbb-graphql-actions (CAPTION_TEXT_CEILING, src/config.ts) and the
// default of public.captions.maxTextLength, which akka-apps enforces per meeting.
const TRANSPORT_CEILING = 65536;
const MAX_TEXT_LENGTH = 8192;
const MAX_TRANSCRIPT_ID_LENGTH = 40;

const errorText = (result: GraphqlResult) => JSON.stringify(result.errors ?? null);

const expectAccepted = (result: GraphqlResult, field: string, description: string) => {
  expect(result.errors, description).toBeUndefined();
  expect(result.data?.[field], description).toBe(true);
};

const submitText = (page: Page, overrides: Record<string, unknown> = {}) =>
  graphql(page, SUBMIT_TEXT, {
    transcriptId: randomUUID(),
    start: 0,
    end: 0,
    text: 'caption text',
    transcript: 'caption text',
    locale: 'en-US',
    isFinal: true,
    ...overrides,
  });

async function currentUserId(page: Page): Promise<string> {
  const rows = await readRows<{ userId: string }>(page, CURRENT_USER, 'user_current');
  expect(rows.length, 'the page should have a current user').toBe(1);
  return rows[0].userId;
}

// akka-apps stores a caption as "<userId>-<transcriptId>", so two users cannot collide on one
// transcriptId.
const rowOf = (rows: CaptionRow[], userId: string, transcriptId: string) =>
  rows.find((row) => row.captionId === `${userId}-${transcriptId}`);

// Waits until the caption `transcriptId` of `userId` is stored and returns every caption of the
// meeting. akka-apps handles a meeting's messages in order, so by then it has also handled, and
// stored or dropped, every submission sent before it.
async function captionsOnceStored(page: Page, userId: string, transcriptId: string): Promise<CaptionRow[]> {
  let rows: CaptionRow[] = [];
  await expect
    .poll(
      async () => {
        rows = await readRows<CaptionRow>(page, CAPTIONS, 'caption_history');
        return rowOf(rows, userId, transcriptId) !== undefined;
      },
      { timeout: ELEMENT_WAIT_LONGER_TIME, message: `the caption ${transcriptId} should be stored` },
    )
    .toBe(true);
  return rows;
}

// Automatic captions are a transcript of the user's microphone: akka-apps only stores
// captionSubmitText from a user who is in audio and not listen-only.
async function joinWithMicrophone(page: Page): Promise<void> {
  await page.joinMicrophone({ shouldUnmute: false });
}

test.describe('Caption submission', { tag: '@ci' }, () => {
  // A speech locale is broadcast to every participant and inserted in caption_locale, whose
  // locale column is varchar(15); the client builds an Intl.DisplayNames from it. bbb-graphql-actions
  // (throwErrorIfInvalidLocale) and akka-apps (LocaleUtil.isValidLocale in
  // SetUserSpeechLocaleMsgHdlr) accept only a language tag.
  test('A speech locale that is not a language tag is refused before it reaches the meeting', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo, clientSettingsOverrides: audioCaptionsOverrides('en-US') });
    try {
      await multiUsers.initUserPage(multiUsers.modPage.context, {
        testInfo,
        clientSettingsOverrides: audioCaptionsOverrides('en-US'),
      });
      const { modPage, userPage } = multiUsers;

      const refused = ['<b>x', 'en_US', 'abcdefgh-abcdefg'];
      for (const locale of refused) {
        const result = await graphql(userPage, SET_SPEECH_LOCALE, { locale, provider: 'webspeech' });
        expect(errorText(result), `should refuse the speech locale "${locale}"`).toMatch(INVALID_LOCALE_FORMAT);
      }

      const accepted = await graphql(userPage, SET_SPEECH_LOCALE, { locale: 'pt-BR', provider: 'webspeech' });
      expectAccepted(accepted, 'userSetSpeechLocale', 'should accept the speech locale "pt-BR"');

      let locales: string[] = [];
      await expect
        .poll(
          async () => {
            const rows = await readRows<ActiveLocaleRow>(modPage, ACTIVE_LOCALES, 'caption_activeLocales');
            locales = rows.map((row) => row.locale);
            return locales;
          },
          { timeout: ELEMENT_WAIT_LONGER_TIME, message: 'the accepted speech locale should be listed' },
        )
        .toContain('pt-BR');
      // The moderator's own transcription language may be listed too; none of the refused ones may be.
      for (const locale of refused) {
        expect(locales, `should not list the refused speech locale "${locale}"`).not.toContain(locale);
      }

      // The moderator's client renders the listed locales; it must still be running.
      await modPage.hasElement(e.actionsBarBackground, "should keep the moderator's action bar after the attempts");
      const disabled = await graphql(userPage, SET_SPEECH_LOCALE, { locale: '', provider: 'webspeech' });
      expectAccepted(disabled, 'userSetSpeechLocale', 'should accept an empty speech locale (transcription off)');
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // The transcript locale names the recording's caption file (caption_<locale>.vtt), so it must
  // be a canonical language tag: bbb-graphql-actions checks the format and the canonical form
  // (throwErrorIfInvalidLocale, throwErrorIfNonCanonicalLocale in src/actions/captionSubmitText.ts).
  test('A caption text is refused unless its locale is a canonical language tag', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo });
    try {
      const { modPage } = multiUsers;
      for (const locale of ['', 'en_US', 'en-', '../..', 'abcdefgh-abcdefg']) {
        expect(
          errorText(await submitText(modPage, { locale })),
          `should refuse the caption text with the locale "${locale}"`,
        ).toMatch(INVALID_LOCALE_FORMAT);
      }
      for (const locale of ['EN-us', 'pt-br']) {
        expect(
          errorText(await submitText(modPage, { locale })),
          `should refuse the caption text with the non-canonical locale "${locale}"`,
        ).toMatch(NOT_CANONICAL);
      }
      for (const locale of ['en-US', 'pt-BR', 'es-419', 'zh-Hant-TW']) {
        expectAccepted(
          await submitText(modPage, { locale }),
          'captionSubmitText',
          `should accept the caption text with the locale "${locale}"`,
        );
      }
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // start and end address the transcript the client last sent, so they are non-negative and
  // ordered; text, transcript and transcriptId have fixed ceilings (src/imports/captionLimits.ts).
  test('A caption text with impossible offsets, or over the transport ceiling, is refused', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo });
    try {
      const { modPage } = multiUsers;
      const refused: [Record<string, unknown>, RegExp, string][] = [
        [{ start: -1 }, outOfRange('start', TRANSPORT_CEILING), 'a negative start'],
        [{ end: -1 }, outOfRange('end', TRANSPORT_CEILING), 'a negative end'],
        [{ start: 0, end: TRANSPORT_CEILING + 1 }, outOfRange('end', TRANSPORT_CEILING), 'an end past the ceiling'],
        [{ start: 2147483647, end: 2147483647 }, outOfRange('start', TRANSPORT_CEILING), 'Int.MaxValue offsets'],
        [{ start: 5, end: 2 }, START_AFTER_END, 'a start after the end'],
        [{ text: 'x'.repeat(TRANSPORT_CEILING + 1) }, tooLong('text', TRANSPORT_CEILING), 'a text over the ceiling'],
        [
          { transcript: 'x'.repeat(TRANSPORT_CEILING + 1) },
          tooLong('transcript', TRANSPORT_CEILING),
          'a transcript over the ceiling',
        ],
        [
          { transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH + 1) },
          tooLong('transcriptId', MAX_TRANSCRIPT_ID_LENGTH),
          'a transcriptId over its ceiling',
        ],
        [{ transcriptId: '../x' }, NOT_ALPHANUMERIC_ID, 'a transcriptId that is not alphanumeric'],
        [{ transcriptId: '' }, NOT_ALPHANUMERIC_ID, 'an empty transcriptId'],
      ];
      for (const [overrides, error, what] of refused) {
        expect(errorText(await submitText(modPage, overrides)), `should refuse ${what}`).toMatch(error);
      }

      expectAccepted(
        await submitText(modPage, {
          start: 0,
          end: TRANSPORT_CEILING,
          transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH),
        }),
        'captionSubmitText',
        'should accept offsets and a transcriptId at their ceilings',
      );
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // public.captions.maxTextLength (default 8192) is the length a meeting accepts; akka-apps
  // (UpdateTranscriptPubMsgHdlr) drops a longer submission. The transport ceiling of
  // bbb-graphql-actions is higher, so the submission reaches akka-apps and is checked on the rows.
  test('akka-apps stores a caption text only up to the maximum length', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo, shouldCloseAudioModal: false });
    try {
      const { modPage } = multiUsers;
      await joinWithMicrophone(modPage);
      const userId = await currentUserId(modPage);

      const atLimit = randomUUID();
      const overLimit = randomUUID();
      const sentinel = randomUUID();
      const longest = 'x'.repeat(MAX_TEXT_LENGTH);

      expectAccepted(
        await submitText(modPage, { transcriptId: atLimit, text: longest, transcript: longest }),
        'captionSubmitText',
        'should accept a caption text of the maximum length',
      );
      expectAccepted(
        await submitText(modPage, { transcriptId: overLimit, text: `${longest}x`, transcript: `${longest}x` }),
        'captionSubmitText',
        'should let a caption text one over the maximum length through to akka-apps',
      );
      expectAccepted(
        await submitText(modPage, { transcriptId: sentinel }),
        'captionSubmitText',
        'should accept the last caption',
      );

      const rows = await captionsOnceStored(modPage, userId, sentinel);
      expect(rowOf(rows, userId, atLimit)?.captionText, 'should store the caption text of the maximum length').toBe(
        longest,
      );
      expect(
        rowOf(rows, userId, overLimit),
        'should not store the caption text over the maximum length',
      ).toBeUndefined();
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // A transcriptId identifies the submitter's own running transcript. Another user who sends it
  // cannot address the owner's text: akka-apps keys the transcript by owner (AudioCaptions) and
  // stores every caption under "<userId>-<transcriptId>" (CaptionDAO).
  test("A caption text sent with another user's transcriptId is stored as the sender's own", async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo, shouldCloseAudioModal: false });
    try {
      await multiUsers.initUserPage(multiUsers.modPage.context, { testInfo, shouldCloseAudioModal: false });
      const { modPage, userPage } = multiUsers;
      await joinWithMicrophone(modPage);
      await joinWithMicrophone(userPage);
      const ownerId = await currentUserId(modPage);
      const otherId = await currentUserId(userPage);
      const transcriptId = randomUUID();
      const sentinel = randomUUID();

      expectAccepted(
        await submitText(modPage, { transcriptId, text: 'owner text', transcript: 'owner text' }),
        'captionSubmitText',
        "should accept the owner's caption text",
      );
      // The other user replays the owner's transcriptId with an edit that would replace its text.
      expectAccepted(
        await submitText(userPage, { transcriptId, start: 0, end: 10, text: 'replaced', transcript: 'replaced' }),
        'captionSubmitText',
        "should accept the other user's caption text as a submission of their own",
      );
      expectAccepted(
        await submitText(userPage, { transcriptId: sentinel }),
        'captionSubmitText',
        'should accept the last caption',
      );

      const rows = await captionsOnceStored(userPage, otherId, sentinel);
      expect(rowOf(rows, ownerId, transcriptId)?.captionText, "should keep the owner's caption text").toBe(
        'owner text',
      );
      const other = rowOf(rows, otherId, transcriptId);
      expect(other?.captionText, "should store the other user's text under their own caption").toBe('replaced');
      expect(other?.userId, "should attribute the other user's caption to them").toBe(otherId);
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // captionSubmitTranscript (typed captions, sent by plugins) is for moderators and takes the same
  // locale format and length ceilings; akka-apps (CaptionApp2x) stores it under the sender's id.
  test('A typed caption transcript is refused from a viewer, and with an invalid locale or length', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo });
    try {
      await multiUsers.initUserPage(multiUsers.modPage.context, { testInfo });
      const { modPage, userPage } = multiUsers;
      const moderatorId = await currentUserId(modPage);
      const typed = (overrides: Record<string, unknown> = {}) => ({
        transcriptId: randomUUID(),
        transcript: 'typed caption',
        locale: 'en-US',
        captionType: 'TYPED',
        ...overrides,
      });

      expect(
        errorText(await graphql(userPage, SUBMIT_TRANSCRIPT, typed())),
        "should refuse the viewer's caption transcript",
      ).toMatch(NOT_MODERATOR);
      expect(
        errorText(await graphql(modPage, SUBMIT_TRANSCRIPT, typed({ locale: 'en_US' }))),
        'should refuse a caption transcript with an invalid locale',
      ).toMatch(INVALID_LOCALE_FORMAT);
      expect(
        errorText(await graphql(modPage, SUBMIT_TRANSCRIPT, typed({ transcript: 'x'.repeat(TRANSPORT_CEILING + 1) }))),
        'should refuse a caption transcript over the ceiling',
      ).toMatch(tooLong('transcript', TRANSPORT_CEILING));
      expect(
        errorText(
          await graphql(modPage, SUBMIT_TRANSCRIPT, typed({ transcriptId: 'x'.repeat(MAX_TRANSCRIPT_ID_LENGTH + 1) })),
        ),
        'should refuse a caption transcript whose transcriptId is over its ceiling',
      ).toMatch(tooLong('transcriptId', MAX_TRANSCRIPT_ID_LENGTH));

      const transcriptId = randomUUID();
      expectAccepted(
        await graphql(modPage, SUBMIT_TRANSCRIPT, typed({ transcriptId })),
        'captionSubmitTranscript',
        "should accept the moderator's caption transcript",
      );
      const rows = await captionsOnceStored(modPage, moderatorId, transcriptId);
      expect(rowOf(rows, moderatorId, transcriptId)?.captionText).toBe('typed caption');
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });

  // The two remaining locale mutations: a moderator adding a typed-caption locale, and a user
  // choosing the locale of the captions they read ('' turns them off).
  test('A caption locale that is not a language tag is refused when added or selected', async ({
    browser,
    context,
    page,
    request,
  }, testInfo) => {
    const multiUsers = new MultiUsers(browser, context);
    await multiUsers.initModPage(page, { testInfo });
    try {
      await multiUsers.initUserPage(multiUsers.modPage.context, { testInfo });
      const { modPage, userPage } = multiUsers;

      expect(
        errorText(await graphql(modPage, ADD_CAPTION_LOCALE, { locale: '<b>' })),
        'should refuse adding a caption locale that is not a language tag',
      ).toMatch(INVALID_LOCALE_FORMAT);
      expect(
        errorText(await graphql(userPage, ADD_CAPTION_LOCALE, { locale: 'en-US' })),
        'should refuse a viewer adding a caption locale',
      ).toMatch(NOT_MODERATOR);
      expectAccepted(
        await graphql(modPage, ADD_CAPTION_LOCALE, { locale: 'fr-FR' }),
        'captionAddLocale',
        'should accept adding the caption locale "fr-FR"',
      );

      expect(
        errorText(await graphql(userPage, SET_CAPTION_LOCALE, { locale: 'en_US', provider: 'webspeech' })),
        'should refuse selecting a caption locale that is not a language tag',
      ).toMatch(INVALID_LOCALE_FORMAT);
      expectAccepted(
        await graphql(userPage, SET_CAPTION_LOCALE, { locale: 'fr-FR', provider: 'webspeech' }),
        'userSetCaptionLocale',
        'should accept selecting the caption locale "fr-FR"',
      );
      expectAccepted(
        await graphql(userPage, SET_CAPTION_LOCALE, { locale: '', provider: 'webspeech' }),
        'userSetCaptionLocale',
        'should accept an empty caption locale (captions off)',
      );
    } finally {
      await endMeetings(request, [multiUsers.modPage.meetingId]);
    }
  });
});
