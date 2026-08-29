import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteSharedNotes } from './blocknote';

test.describe.parallel('Shared Notes - BlockNote', { tag: '@ci' }, () => {
  let blockNoteSharedNotes: BlockNoteSharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    blockNoteSharedNotes = new BlockNoteSharedNotes(browser, context);
    await initializePages(blockNoteSharedNotes, browser, {
      isMultiUser: true,
      createParameter: 'sharedNotesEditor=blocknote',
      testInfo,
    });
  });

  // Regression test for #25225 — BlockNote: a remote user's collaboration-cursor
  // name must not be embedded in a link when their caret is positioned inside it.
  test("Collaboration cursor must not embed a user's name in a link", async () => {
    await blockNoteSharedNotes.collaborationCursorMustNotEmbedInLink();
  });
});
