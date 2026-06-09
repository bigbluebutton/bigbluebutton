import { initializePages, linkIssue } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteSharedNotes } from './sharednotes';

test.describe('Shared Notes - BlockNote', { tag: '@ci' }, () => {
  let sharedNotes: BlockNoteSharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, {
      createParameter: 'sharedNotesEditor=blockNote',
      testInfo,
    });
  });

  test('Export empty shared notes as PDF returns a PDF, not an error', async () => {
    linkIssue(25122);
    await sharedNotes.exportEmptyNotesAsPDF();
  });
});
