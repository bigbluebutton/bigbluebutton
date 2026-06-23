import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteSharedNotes } from './sharednotes';

test.describe('Shared Notes - BlockNote LaTeX block', () => {
  let sharedNotes: BlockNoteSharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    sharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(sharedNotes, browser, {
      createParameter: 'sharedNotesEditor=blockNote',
      testInfo,
    });
  });

  test('Formatting toolbar stays visible while editing a LaTeX block', async () => {
    await sharedNotes.latexBlockKeepsFormattingToolbar();
  });
});
