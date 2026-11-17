import { expect } from '@playwright/test';
import path from 'path';

import { APOLLO_CLIENT_SETTINGS_OVERRIDE, isApolloClientExposed } from '../core/apolloProbe';
import { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME, UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { Page } from '../core/page';
import { test } from '../core/setup/fixtures';
import { getSpeakerNotesRows } from './speakerNotesProbe';
import { hasCurrentPresentationToastElement } from './util';

const pptxFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.pptx');
const odpFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.odp');
const pptFixturePath = path.resolve(__dirname, '../core/media/speaker-notes.ppt');

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

const uploadedPresentationNotes = async (page: import('@playwright/test').Page): Promise<string[]> => {
  const rows = await getSpeakerNotesRows(page);
  const presentationId = rows.find((row) => row.speakerNotes.startsWith('First paragraph'))?.presentationId;
  return rows
    .filter((row) => row.presentationId === presentationId)
    .sort((left, right) => left.num - right.num)
    .map((row) => row.speakerNotes);
};

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

    const expectedNotes = ['First paragraph\nSecond paragraph', '', '', '', '', '', '', '', '', '', ''];
    for (const participant of [presenter, moderator]) {
      await expect
        .poll(async () => uploadedPresentationNotes(participant.page), {
          timeout: ELEMENT_WAIT_LONGER_TIME,
        })
        .toEqual(expectedNotes);
    }

    await expect(getSpeakerNotesRows(viewer.page)).resolves.toEqual([]);

    await presenter.waitAndClick(e.usersListSidebarButton);
    const viewerListItem = presenter.page.locator(e.userListItem).filter({ hasText: 'Viewer' });
    await viewerListItem.click();
    await viewerListItem.locator(e.moreOptionsUserItemButton).click();
    await presenter.page.locator(`${e.makePresenter}:visible`).click();

    await expect
      .poll(async () => uploadedPresentationNotes(viewer.page), {
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toEqual(expectedNotes);
  });

  for (const [format, fixturePath] of [
    ['ODP', odpFixturePath],
    ['PPT', pptFixturePath],
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
        .poll(async () => uploadedPresentationNotes(presenter.page), { timeout: ELEMENT_WAIT_LONGER_TIME })
        .toEqual(['First paragraph\nSecond paragraph', '', '', '', '', '', '', '', '', '', '']);
    });
  }
});
