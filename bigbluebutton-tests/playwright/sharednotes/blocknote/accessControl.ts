import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../../core/constants';
import { elements as e } from '../../core/elements';
import { Page } from '../../core/page';
import { MultiUsers } from '../../user/multiusers';
import { startBlockNoteSharedNotes } from './util';

async function getSessionToken(page: Page): Promise<string | null> {
  return page.page.evaluate(() => {
    const serializeStorage = (storage: Storage) => {
      let entries = '';
      for (let i = 0; i < storage.length; i += 1) {
        entries += `${storage.key(i)}=${storage.getItem(storage.key(i) as string)};`;
      }
      return entries;
    };
    const sessionData = serializeStorage(sessionStorage) + serializeStorage(localStorage) + window.location.href;
    const match = sessionData.match(/sessionToken["\s:=]+([a-z0-9]{10,})/i);
    return match ? match[1] : null;
  });
}

async function getInternalMeetingId(page: Page): Promise<string | null> {
  return page.page.evaluate(() => sessionStorage.getItem('meetingId') || sessionStorage.getItem('BBB_meetingId'));
}

async function readDocumentViaRest(page: Page, documentName: string, sessionToken: string) {
  return page.page.evaluate(
    async ({ doc, st }) => {
      const response = await fetch(`/hocuspocus/api/documents/${doc}?sessionToken=${st}`, { credentials: 'include' });
      return { status: response.status, body: (await response.text()).slice(0, 600) };
    },
    { doc: documentName, st: sessionToken },
  );
}

export class BlockNoteAccessControl extends MultiUsers {
  private notesText = 'NOTES-CANARY';

  private documentName = '';

  async seedModeratorNotes() {
    await startBlockNoteSharedNotes(this.modPage);
    const editor = this.modPage.page.locator(e.blockNoteEditable);
    await editor.click();
    await editor.pressSequentially(this.notesText);
    await expect(editor, 'moderator should see the typed notes').toContainText(this.notesText, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
    });
    const internalId = await getInternalMeetingId(this.modPage);
    expect(internalId, 'should resolve the internal meeting id').toBeTruthy();
    this.documentName = `bn-document__${internalId}`;
  }

  async waitingGuestCannotReadNotes() {
    await this.seedModeratorNotes();
    await this.initUserPage(this.context, {
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
      joinParameter: 'guest=true',
    });
    await this.userPage.hasText(e.guestMessage, /wait/, 'the guest should be waiting for approval');
    const sessionToken = await getSessionToken(this.userPage);
    expect(sessionToken, 'the waiting guest should have a session token').toBeTruthy();
    const response = await readDocumentViaRest(this.userPage, this.documentName, sessionToken as string);
    expect(response.body, 'the waiting guest response must not contain the notes text').not.toContain(this.notesText);
    expect(response.status, 'the waiting guest must receive 403 when reading the notes').toBe(403);
  }

  async deniedGuestCannotReadNotes() {
    await this.seedModeratorNotes();
    await this.initUserPage(this.context, {
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
      joinParameter: 'guest=true',
    });
    await this.userPage.hasText(e.guestMessage, /wait/, 'the guest should be waiting for approval');
    const sessionToken = await getSessionToken(this.userPage);
    expect(sessionToken, 'the denied guest should have a session token').toBeTruthy();
    await this.modPage.waitAndClick(e.waitingUsersBtn);
    await this.modPage.waitAndClick(e.denyEveryone);
    await this.userPage.hasText('body', /denied/i, 'the guest should see the denied message');
    const response = await readDocumentViaRest(this.userPage, this.documentName, sessionToken as string);
    expect(response.body, 'the denied guest response must not contain the notes text').not.toContain(this.notesText);
    expect(response.status, 'the denied guest must receive 403 when reading the notes').toBe(403);
  }

  async admittedModeratorCanReadNotes() {
    await this.seedModeratorNotes();
    const sessionToken = await getSessionToken(this.modPage);
    expect(sessionToken, 'the moderator should have a session token').toBeTruthy();
    const response = await readDocumentViaRest(this.modPage, this.documentName, sessionToken as string);
    expect(response.status, 'the moderator must receive 200 when reading the notes').toBe(200);
    expect(response.body, 'the moderator response must contain the notes text').toContain(this.notesText);
  }

  async memberCannotReadOtherMeetingNotes() {
    await this.seedModeratorNotes();
    const sessionToken = await getSessionToken(this.modPage);
    expect(sessionToken, 'the moderator should have a session token').toBeTruthy();
    const response = await readDocumentViaRest(
      this.modPage,
      'bn-document__someothermeeting-1234567890',
      sessionToken as string,
    );
    expect(response.status, 'reading another meeting document must return 403').toBe(403);
  }

  async loopbackRouteIsNotExposed() {
    await this.seedModeratorNotes();
    const status = await this.modPage.page.evaluate(
      async (documentName) => (await fetch(`/hocuspocus/loopback/api/documents/${documentName}`)).status,
      this.documentName,
    );
    expect(status, 'the loopback document route must not be exposed through nginx').toBe(404);
  }
}
