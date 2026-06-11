import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { SharedNotes } from './sharednotes';

test.describe.parallel('Shared Notes - BlockNote', { tag: '@ci' }, () => {
  let sharedNotes: SharedNotes;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, {
      isMultiUser: true,
      createParameter: 'sharedNotesEditor=blockNote',
      testInfo,
    });
  });

  test('Unread indicator notifies users of new notes content', async () => {
    await sharedNotes.unreadNotesIndicator();
  });
});
