import { initializePages, linkIssue } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteTableSharedNotes } from './table';

const CREATE_PARAMETER = 'sharedNotesEditor=blocknote';

// Regression suite for BBB #25076 / BlockNote #2748 ("RangeError: Position -1 out of
// range when clicking left margin with table"). BBB carried a ProseMirror workaround for
// it until BlockNote 0.53.0 shipped the upstream fix; these tests cover the crash itself,
// so the client is guarded by behaviour instead of by that workaround.
test.describe.parallel('Shared Notes - BlockNote table', { tag: '@ci' }, () => {
  let tableSharedNotes: BlockNoteTableSharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    linkIssue(25076);
    tableSharedNotes = new BlockNoteTableSharedNotes(browser, context);
    await initializePages(tableSharedNotes, browser, { createParameter: CREATE_PARAMETER, testInfo });
  });

  test('Clicking the left margin of a leading table does not crash the client', async () => {
    await tableSharedNotes.leadingTableLeftMarginClick();
  });

  test('Pressing ArrowLeft out of the first cell of a leading table does not crash the client', async () => {
    await tableSharedNotes.arrowLeftOutOfFirstTableCell();
  });

  test('The alignment control still resolves the cell selection inside a table', async () => {
    await tableSharedNotes.alignmentControlWorksInsideTableCell();
  });
});
