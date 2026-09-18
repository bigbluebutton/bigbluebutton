import { request } from '@playwright/test';

import { initializePages } from '../../core/helpers';
import { parameters } from '../../core/parameters';
import { test } from '../../core/setup/fixtures';
import { SharedNotes } from './sharednotes';

const CREATE_PARAMETER = 'sharedNotesEditor=etherpad';

// bbb-etherpad and bbb-pads are optional add-ons since 4.0 (BlockNote is the
// default shared notes editor), so this suite only makes sense on servers that
// actually ship Etherpad. Probe its nginx route once and skip the whole suite
// when absent: without the backend the meeting is created with an unusable
// notes editor and the Shared Notes button never renders.
let etherpadUnavailableReason = '';

test.describe.parallel('Shared Notes - Etherpad', { tag: '@ci' }, () => {
  test.beforeAll(async () => {
    const padApiUrl = new URL('/pad/api', parameters.server).href;
    const requestContext = await request.newContext();
    try {
      const response = await requestContext.get(padApiUrl, { timeout: 10000 });
      if (!response.ok()) {
        etherpadUnavailableReason = `Etherpad is not installed on the test server (HTTP ${response.status()} on /pad/api)`;
      }
    } catch {
      etherpadUnavailableReason = 'Etherpad is not reachable on the test server (/pad/api)';
    } finally {
      await requestContext.dispose();
    }
  });

  test.beforeEach(() => {
    test.skip(!!etherpadUnavailableReason, etherpadUnavailableReason);
  });

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
