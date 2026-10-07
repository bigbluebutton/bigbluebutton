import { linkIssue } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { ExportIndentationSharedNotes } from './export-indentation';

// Regression suite for BBB #25585: PDF/HTML export dropped the indentation of nested
// non-list blocks (paragraphs, headings, quotes). The meeting is created per-test with
// a seeded nested document (POST modules payload), so nothing is created in beforeEach.
test.describe.parallel('Shared Notes - BlockNote export indentation', { tag: '@ci' }, () => {
  let exportIndentation: ExportIndentationSharedNotes;

  test.beforeEach(async ({ browser, context }) => {
    linkIssue(25585);
    exportIndentation = new ExportIndentationSharedNotes(browser, context);
  });

  test('Nested non-list blocks keep their indentation in the HTML/PDF export', async () => {
    await exportIndentation.nestedBlocksKeepIndentationInExport();
  });
});
