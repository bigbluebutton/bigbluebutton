import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { SharedNotes } from './sharednotes';

const CREATE_PARAMETER = 'sharedNotesEditor=etherpad';

test.describe.parallel('Shared Notes - Etherpad', { tag: '@ci' }, () => {
  test('Open shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.openSharedNotes();
  });

  test('Type in shared notes', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Firefox has different fonts on local and ci');
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.typeInSharedNotes();
  });

  test('Format text in shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.formatTextInSharedNotes();
  });

  test('Export shared notes', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.exportSharedNotes();
  });

  test('Convert notes to presentation', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.convertNotesToWhiteboard();
  });

  test('Multiusers edit', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.editSharedNotesWithMoreThanOneUSer();
  });

  test('See notes without edit permission', async ({ browser, context }, testInfo) => {
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.seeNotesWithoutEditPermission();
  });

  // different failures in CI and local
  // local: not able to click on "unpin" button
  // CI: not restoring presentation for viewer after unpinning notes
  test('Pin and unpin notes onto whiteboard', async ({ browser, context, browserName }, testInfo) => {
    test.skip(browserName === 'firefox', 'Webcams does not work properly, due to heavy firefox for testing');
    const sharedNotes = new SharedNotes(browser, context);
    await initializePages(sharedNotes, browser, { isMultiUser: true, createParameter: CREATE_PARAMETER, testInfo });
    await sharedNotes.pinAndUnpinNotesOntoWhiteboard();
  });
});
