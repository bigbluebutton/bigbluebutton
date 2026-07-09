import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { INIT_MARKDOWN_HEADING, INIT_MARKDOWN_ITEM, markdownCreateParameter, MarkdownSharedNotes } from './markdown';

test.describe.parallel('Shared Notes - BlockNote Markdown', { tag: '@ci' }, () => {
  test.describe('Export and import', () => {
    let markdownSharedNotes: MarkdownSharedNotes;

    test.beforeEach(async ({ browser, context }, testInfo) => {
      markdownSharedNotes = new MarkdownSharedNotes(browser, context);
      await initializePages(markdownSharedNotes, browser, {
        isMultiUser: true,
        createParameter: 'sharedNotesEditor=blocknote',
        testInfo,
      });
    });

    test('Export shared notes as Markdown', async () => {
      await markdownSharedNotes.exportAsMarkdown();
    });

    test('Import from Markdown in Append mode keeps the existing content', async () => {
      await markdownSharedNotes.importFromMarkdownAppend();
    });

    test('Import from Markdown in Replace mode overwrites the existing content', async () => {
      await markdownSharedNotes.importFromMarkdownReplace();
    });

    test('Import from Markdown cancel closes the modal and imports nothing', async () => {
      await markdownSharedNotes.importFromMarkdownCancel();
    });

    test('Import from Markdown propagates to other connected users', async () => {
      await markdownSharedNotes.importFromMarkdownPropagatesToOtherUser();
    });

    test('Import from Markdown loads a valid uploaded .md file', async () => {
      await markdownSharedNotes.importFromMarkdownUploadFile();
    });

    test('Import from Markdown rejects a non-markdown uploaded file', async () => {
      await markdownSharedNotes.importFromMarkdownUploadWrongType();
    });

    test('Import from Markdown keeps import disabled for an empty uploaded file', async () => {
      await markdownSharedNotes.importFromMarkdownUploadEmptyFile();
    });
  });

  test.describe('Init from Markdown create parameter', () => {
    let markdownSharedNotes: MarkdownSharedNotes;

    test.beforeEach(async ({ browser, context }, testInfo) => {
      markdownSharedNotes = new MarkdownSharedNotes(browser, context);
      const initialMarkdown = `# ${INIT_MARKDOWN_HEADING}\n\n- ${INIT_MARKDOWN_ITEM}`;
      await initializePages(markdownSharedNotes, browser, {
        isMultiUser: false,
        createParameter: markdownCreateParameter(initialMarkdown),
        testInfo,
      });
    });

    test('Shared notes are seeded from the Markdown create parameter', async () => {
      await markdownSharedNotes.initFromMarkdown();
    });
  });

  test.describe('Init content precedence (JSON over Markdown)', () => {
    let markdownSharedNotes: MarkdownSharedNotes;

    test.beforeEach(async ({ browser, context }) => {
      // The meeting is created per-test with a POST modules payload, so nothing
      // is created here.
      markdownSharedNotes = new MarkdownSharedNotes(browser, context);
    });

    test('JSON initial content takes precedence over Markdown', async () => {
      await markdownSharedNotes.precedenceJsonWinsOverMarkdown();
    });

    test('Falls back to Markdown when the JSON initial content is invalid', async () => {
      await markdownSharedNotes.invalidJsonFallsBackToMarkdown();
    });

    test('Shared notes are seeded from the Markdown POST payload module', async () => {
      await markdownSharedNotes.initFromMarkdownPayload();
    });
  });
});
