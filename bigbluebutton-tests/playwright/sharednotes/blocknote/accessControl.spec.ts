import { initializePages } from '../../core/helpers';
import { test } from '../../core/setup/fixtures';
import { BlockNoteAccessControl } from './accessControl';

const CREATE_PARAMETER = 'guestPolicy=ASK_MODERATOR';

test.describe.parallel('Shared Notes - BlockNote access control', { tag: '@ci' }, () => {
  test('Waiting guest cannot read the shared notes via REST', async ({ browser, context }, testInfo) => {
    const accessControl = new BlockNoteAccessControl(browser, context);
    await initializePages(accessControl, browser, { isMultiUser: false, createParameter: CREATE_PARAMETER, testInfo });
    await accessControl.waitingGuestCannotReadNotes();
  });

  test('Denied guest cannot read the shared notes via REST', async ({ browser, context }, testInfo) => {
    const accessControl = new BlockNoteAccessControl(browser, context);
    await initializePages(accessControl, browser, { isMultiUser: false, createParameter: CREATE_PARAMETER, testInfo });
    await accessControl.deniedGuestCannotReadNotes();
  });

  test('Admitted moderator can still read the shared notes via REST', async ({ browser, context }, testInfo) => {
    const accessControl = new BlockNoteAccessControl(browser, context);
    await initializePages(accessControl, browser, { isMultiUser: false, createParameter: CREATE_PARAMETER, testInfo });
    await accessControl.admittedModeratorCanReadNotes();
  });

  test('Member cannot read another meeting shared notes via REST', async ({ browser, context }, testInfo) => {
    const accessControl = new BlockNoteAccessControl(browser, context);
    await initializePages(accessControl, browser, { isMultiUser: false, createParameter: CREATE_PARAMETER, testInfo });
    await accessControl.memberCannotReadOtherMeetingNotes();
  });

  test('Loopback document route is not exposed through nginx', async ({ browser, context }, testInfo) => {
    const accessControl = new BlockNoteAccessControl(browser, context);
    await initializePages(accessControl, browser, { isMultiUser: false, createParameter: CREATE_PARAMETER, testInfo });
    await accessControl.loopbackRouteIsNotExposed();
  });
});
