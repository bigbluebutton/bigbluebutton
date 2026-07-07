import { test } from '../../core/setup/fixtures';
import { BlockNoteImagePaste } from './imagePaste';

// The BlockNote editor is opt-in per meeting (sharedNotesEditor=blockNote), and
// image paste is off by default, so these run under the setting-required tag.
test.describe('Shared Notes - BlockNote image paste', { tag: '@setting-required:app.sharedNotes.imagePaste' }, () => {
  test('Paste an image and render it as a block for every participant', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const sharedNotes = new BlockNoteImagePaste(browser, context);
    await sharedNotes.initModPage(page, { createParameter: 'sharedNotesEditor=blockNote', testInfo });
    // Joins the moderator's meeting (useModMeetingId), so no createParameter here.
    await sharedNotes.initUserPage(context, { testInfo });
    await sharedNotes.pasteRendersImageBlock();
  });

  test('Export embeds the pasted image as inline base64', async ({ browser, context, page }, testInfo) => {
    const sharedNotes = new BlockNoteImagePaste(browser, context);
    await sharedNotes.initModPage(page, { createParameter: 'sharedNotesEditor=blockNote', testInfo });
    await sharedNotes.exportEmbedsImageAsBase64();
  });
});
