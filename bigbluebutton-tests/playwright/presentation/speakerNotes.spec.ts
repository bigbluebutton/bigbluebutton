import { expect } from '@playwright/test';
import path from 'path';

import { APOLLO_CLIENT_SETTINGS_OVERRIDE, isApolloClientExposed } from '../core/apolloProbe';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { getSpeakerNotesRows, SpeakerNotesRow } from './speakerNotesProbe';
import { hasCurrentPresentationToastElement } from './util';

const pptxFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.pptx');
const odpFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.odp');
const pptFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.ppt');
const pptxFirstNote =
  'Bold Italic Underline Strike Superscript Subscript Direct Inherited Highlight\n  leading   spaces\tTabbed\nsoft\nbreak\n\nBullet item\nNumber three\nNested number\nNumber four';
const odpFirstNote =
  'Bold Italic Underline Strike Superscript Subscript Direct Inherited Highlight\nOuter Nested both\n  leading   spaces\tTabbed\nsoft\nbreak\n\nBullet item\nNumber three\nNested number\nNumber four';
const pptFirstNote = 'First paragraph\nSecond paragraph';

const uploadPresentation = async (presenter: Page, fixturePath: string): Promise<void> => {
  await presenter.waitAndClick(e.mediaAreaButton);
  await presenter.waitAndClick(e.managePresentations);
  const presentationsBefore = await presenter.getSelectorCount(e.presentationThumbnails);
  await presenter.page.setInputFiles(e.presentationFileUpload, fixturePath);
  await presenter.waitUntilHaveCountSelector(e.presentationThumbnails, presentationsBefore + 1, UPLOAD_PDF_WAIT_TIME);
  await (await presenter.getLocatorByIndex(e.presentationThumbnails, 1)).click();
  await presenter.waitAndClick(e.sharePresentationButton);
  await presenter.press('Escape');
  await hasCurrentPresentationToastElement(presenter, { timeout: UPLOAD_PDF_WAIT_TIME });
};

const uploadedPresentationRows = async (
  page: import('@playwright/test').Page,
  firstNote: string,
): Promise<SpeakerNotesRow[]> => {
  const rows = await getSpeakerNotesRows(page);
  const presentationId = rows.find((row) => row.speakerNotes === firstNote)?.presentationId;
  return rows.filter((row) => row.presentationId === presentationId).sort((left, right) => left.num - right.num);
};

const uploadedPresentationNotes = async (page: import('@playwright/test').Page, firstNote: string): Promise<string[]> =>
  (await uploadedPresentationRows(page, firstNote)).map((row) => row.speakerNotes);

const expectedNotesStartingWith = (firstNote: string): string[] => [firstNote, '', '', '', '', '', '', '', '', '', ''];

interface StructuredRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;
  highlight?: string;
}

interface StructuredParagraph {
  level: number;
  list: { type: string; marker: string } | null;
  runs: StructuredRun[];
}

const paragraphText = (paragraph: StructuredParagraph): string => paragraph.runs.map((run) => run.text).join('');

// The structured notes hold the same text as the plain notes, paragraph by paragraph.
const assertStructuredText = (value: Record<string, unknown> | null, plainText: string): StructuredParagraph[] => {
  expect(value).not.toBeNull();
  expect(value?.version).toBe(1);
  const paragraphs = value?.paragraphs as StructuredParagraph[];
  expect(paragraphs.map(paragraphText).join('\n')).toBe(plainText);
  return paragraphs;
};

const assertStructuredNotes = (value: Record<string, unknown> | null, plainText: string, odp: boolean): void => {
  const paragraphs = assertStructuredText(value, plainText);
  const { runs } = paragraphs[0];
  expect(runs[0]).toMatchObject({ text: 'Bold', bold: true });
  expect(runs[2]).toMatchObject({ text: 'Italic', italic: true });
  expect(runs[4]).toMatchObject({ text: 'Underline', underline: true });
  expect(runs[6]).toMatchObject({ text: 'Strike', strikethrough: true });
  expect(runs[8]).toMatchObject({ text: 'Superscript', superscript: true });
  expect(runs[10]).toMatchObject({ text: 'Subscript', subscript: true });
  const run = (text: string) => runs.find((candidate) => candidate.text.trim() === text);
  expect(run('Direct')).toMatchObject({ color: '#008080' });
  expect(run('Inherited')).not.toHaveProperty('color');
  expect(run('Highlight')).not.toHaveProperty('color');
  expect(run('Highlight')).toMatchObject({ highlight: '#FFFF00' });
  const paragraph = (text: string) => paragraphs.find((candidate) => paragraphText(candidate) === text);
  expect(paragraph('Bold Italic Underline Strike Superscript Subscript Direct Inherited Highlight')?.list).toBeNull();
  expect(paragraph('Bullet item')?.list).toEqual({ type: 'bullet', marker: '◆' });
  expect(paragraph('Number three')?.list).toEqual({ type: 'number', marker: '3.' });
  expect(paragraph('Nested number')).toMatchObject({ level: 1, list: { type: 'number', marker: 'a)' } });
  expect(paragraph('Number four')?.list).toEqual({ type: 'number', marker: '4.' });
  if (odp) {
    const nestedRuns = paragraphs[1].runs;
    expect(nestedRuns[0]).toMatchObject({ bold: true });
    expect(nestedRuns[1]).toMatchObject({ bold: true, italic: true });
  }
};

const structuredFirstNote = async (
  page: import('@playwright/test').Page,
  firstNote: string,
): Promise<Record<string, unknown> | null> =>
  (await uploadedPresentationRows(page, firstNote))[0]?.speakerNotesJson ?? null;

test.describe('Speaker notes privacy', { tag: '@ci' }, () => {
  test('presenters and moderators can read notes while viewers cannot', async ({ browser }, testInfo) => {
    const presenterContext = await browser.newContext();
    const moderatorContext = await browser.newContext();
    const viewerContext = await browser.newContext();
    const presenter = new Page(browser, await presenterContext.newPage(), testInfo);
    const moderator = new Page(browser, await moderatorContext.newPage(), testInfo);
    const viewer = new Page(browser, await viewerContext.newPage(), testInfo);

    await presenter.init(true, {
      fullName: 'Presenter',
      createClientSettingsOverride: APOLLO_CLIENT_SETTINGS_OVERRIDE,
      testInfo,
    });
    await moderator.init(true, { fullName: 'Moderator', meetingId: presenter.meetingId, testInfo });
    await viewer.init(false, { fullName: 'Viewer', meetingId: presenter.meetingId, testInfo });

    for (const participant of [presenter, moderator, viewer]) {
      expect(await isApolloClientExposed(participant.page, ELEMENT_WAIT_TIME)).toBeTruthy();
    }

    await uploadPresentation(presenter, pptxFixturePath);

    const expectedNotes = expectedNotesStartingWith(pptxFirstNote);
    for (const participant of [presenter, moderator]) {
      await expect
        .poll(async () => uploadedPresentationNotes(participant.page, pptxFirstNote), {
          timeout: ELEMENT_WAIT_LONGER_TIME,
        })
        .toEqual(expectedNotes);
      assertStructuredNotes(await structuredFirstNote(participant.page, pptxFirstNote), pptxFirstNote, false);
    }

    await expect(getSpeakerNotesRows(viewer.page)).resolves.toEqual([]);

    await presenter.waitAndClick(e.usersListSidebarButton);
    const viewerListItem = presenter.page.locator(e.userListItem).filter({ hasText: 'Viewer' });
    await viewerListItem.click();
    await viewerListItem.locator(e.moreOptionsUserItemButton).click();
    await presenter.page.locator(`${e.makePresenter}:visible`).click();

    await expect
      .poll(async () => uploadedPresentationNotes(viewer.page, pptxFirstNote), {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toEqual(expectedNotes);
  });

  for (const [format, fixturePath, firstNote] of [
    ['ODP', odpFixturePath, odpFirstNote],
    ['PPT', pptFixturePath, pptFirstNote],
  ]) {
    test(`${format} speaker notes preserve visible slide order`, async ({ browser, page }, testInfo) => {
      const presenter = new Page(browser, page, testInfo);
      await presenter.init(true, {
        fullName: 'Presenter',
        createClientSettingsOverride: APOLLO_CLIENT_SETTINGS_OVERRIDE,
        testInfo,
      });
      await uploadPresentation(presenter, fixturePath);

      await expect
        .poll(async () => uploadedPresentationNotes(presenter.page, firstNote), { timeout: ELEMENT_WAIT_LONGER_TIME })
        .toEqual(expectedNotesStartingWith(firstNote));
      const structured = await structuredFirstNote(presenter.page, firstNote);
      if (format === 'ODP') {
        assertStructuredNotes(structured, firstNote, true);
      } else {
        assertStructuredText(structured, firstNote);
      }
      // Slides without notes have no structured notes
      const rows = await uploadedPresentationRows(presenter.page, firstNote);
      expect(rows.slice(1).every((row) => row.speakerNotesJson === null)).toBeTruthy();
    });
  }
});
