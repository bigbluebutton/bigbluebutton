import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

// Security regression: whiteboard annotation authorship must be bound to the
// authenticated requester server-side. A participant must not be able to submit
// an annotation whose author (annotations[].userId) is another participant. The
// assertions describe the SECURE behaviour, so this spec is red on a vulnerable
// build and green once the server rebinds the author to the submitter.
//
// The forged submit and the authorship read-back both go over the browser's own
// authenticated GraphQL websocket, so the test exercises the real
// presAnnotationSubmit path end-to-end against a live server. Authorship is read
// from pres_annotation_curr, the same participant-facing source the client
// renders from (it joins the user table, so the victim id must be a real
// participant - which is exactly the impersonation scenario under test).

type SubmitResult = {
  submitterId: string;
  targetUserId: string;
  annotationId: string;
  persistedAuthor: string | null;
  persistedCreator: string | null;
};

// Runs in the browser. Opens a second graphql-transport-ws connection reusing
// the page session, submits an annotation on the current page carrying
// targetUserId as author, and reads the persisted author back from
// pres_annotation_curr. Returns the submitter's own id and what got stored.
type SubmitArgs = { targetUserId: string; reuseAnnotationId?: string };

function browserSubmitAs({ targetUserId, reuseAnnotationId }: SubmitArgs): Promise<SubmitResult> {
  return new Promise<SubmitResult>((resolve, reject) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    const clientSessionUUID = sessionStorage.getItem('clientSessionUUID') || 'author-binding-probe';
    if (!sessionToken) { reject(new Error('no sessionToken in sessionStorage')); return; }

    const ws = new WebSocket(`wss://${window.location.host}/graphql`, 'graphql-transport-ws');
    const annotationId = reuseAnnotationId ?? `shape:${Math.random().toString(36).slice(2, 14)}`;
    // per-call marker so the read-back waits for THIS submit (matters when updating an existing shape)
    const probe = `author-binding-${Math.random().toString(36).slice(2, 10)}`;
    let subId = 0;
    const timer = setTimeout(() => { try { ws.close(); } catch (e) { /* noop */ } reject(new Error('probe timed out')); }, 30000);
    const send = (obj: unknown) => ws.send(JSON.stringify(obj));

    const request = (query: string, variables: Record<string, unknown>) =>
      new Promise<any>((res) => {
        const id = `op-${subId += 1}`;
        const onMsg = (ev: MessageEvent) => {
          const m = JSON.parse(ev.data as string);
          if (m.type === 'ping') { send({ type: 'pong' }); return; }
          if (m.id !== id) return;
          if (m.type === 'next') { ws.removeEventListener('message', onMsg); send({ id, type: 'complete' }); res(m.payload); }
          else if (m.type === 'error') { ws.removeEventListener('message', onMsg); res({ errors: m.payload }); }
          else if (m.type === 'complete') { ws.removeEventListener('message', onMsg); res(null); }
        };
        ws.addEventListener('message', onMsg);
        send({ id, type: 'subscribe', payload: { query, variables } });
      });

    ws.onerror = () => { clearTimeout(timer); reject(new Error('websocket error')); };
    ws.onopen = () => send({
      type: 'connection_init',
      payload: { headers: { 'X-Session-Token': sessionToken, 'X-ClientSessionUUID': clientSessionUUID, 'X-ClientType': 'HTML5', 'X-ClientIsMobile': 'false' } },
    });

    const ackHandler = async (ev: MessageEvent) => {
      const m = JSON.parse(ev.data as string);
      if (m.type === 'ping') { send({ type: 'pong' }); return; }
      if (m.type !== 'connection_ack') return;
      ws.removeEventListener('message', ackHandler);
      try {
        const me = await request('subscription Me { user_current { userId } }', {});
        const submitterId = me?.data?.user_current?.[0]?.userId;
        if (!submitterId) throw new Error('could not resolve submitter userId');

        // target the current page (the server drops annotations on foreign pages,
        // and pres_annotation_curr only exposes the current page)
        let pageId: string | null = null;
        for (let i = 0; i < 20 && !pageId; i += 1) {
          const pg = await request('subscription Pg { pres_page(where: {isCurrentPage: {_eq: true}}) { pageId } }', {});
          const rows = pg?.data?.pres_page || [];
          if (rows.length) pageId = rows[0].pageId;
          else await new Promise((r) => setTimeout(r, 1000));
        }
        if (!pageId) throw new Error('no current page id found');

        const annotations = [{
          id: annotationId,
          annotationInfo: { type: 'draw', x: 10, y: 10, props: { color: 'black' }, meta: { probe, createdBy: targetUserId } },
          wbId: pageId,
          userId: targetUserId,
        }];
        await request(
          'mutation Submit($pageId: String!, $annotations: json!) { presAnnotationSubmit(pageId: $pageId, annotations: $annotations) }',
          { pageId, annotations },
        );

        let persistedAuthor: string | null = null;
        let persistedCreator: string | null = null;
        for (let i = 0; i < 20 && persistedAuthor === null; i += 1) {
          const cur = await request(
            'subscription Cur($pageId: String!) { pres_annotation_curr(where: {pageId: {_eq: $pageId}}) { annotationId userId annotationInfo } }',
            { pageId },
          );
          const rows = cur?.data?.pres_annotation_curr || [];
          const found = rows.find((r: any) => r.annotationId === annotationId);
          const info = found ? (typeof found.annotationInfo === 'string' ? JSON.parse(found.annotationInfo) : found.annotationInfo) : null;
          if (found && info?.meta?.probe === probe) {
            persistedAuthor = found.userId;
            persistedCreator = info?.meta?.createdBy ?? null;
          }
          else await new Promise((r) => setTimeout(r, 500));
        }

        clearTimeout(timer);
        try { ws.close(); } catch (e) { /* noop */ }
        resolve({ submitterId, targetUserId, annotationId, persistedAuthor, persistedCreator });
      } catch (err) {
        clearTimeout(timer);
        try { ws.close(); } catch (e) { /* noop */ }
        reject(err);
      }
    };
    ws.addEventListener('message', ackHandler);
  });
}

// read a page's own current user id (used to obtain the victim's real id)
function browserOwnUserId(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    const clientSessionUUID = sessionStorage.getItem('clientSessionUUID') || 'whoami-probe';
    if (!sessionToken) { reject(new Error('no sessionToken')); return; }
    const ws = new WebSocket(`wss://${window.location.host}/graphql`, 'graphql-transport-ws');
    const timer = setTimeout(() => { try { ws.close(); } catch (e) { /* noop */ } reject(new Error('whoami timed out')); }, 15000);
    const send = (obj: unknown) => ws.send(JSON.stringify(obj));
    ws.onerror = () => { clearTimeout(timer); reject(new Error('websocket error')); };
    ws.onopen = () => send({ type: 'connection_init', payload: { headers: { 'X-Session-Token': sessionToken, 'X-ClientSessionUUID': clientSessionUUID, 'X-ClientType': 'HTML5', 'X-ClientIsMobile': 'false' } } });
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data as string);
      if (m.type === 'ping') { send({ type: 'pong' }); return; }
      if (m.type === 'connection_ack') { send({ id: 'me', type: 'subscribe', payload: { query: 'subscription Me { user_current { userId } }' } }); return; }
      if (m.id === 'me' && m.type === 'next') {
        const uid = m.payload?.data?.user_current?.[0]?.userId;
        clearTimeout(timer); try { ws.close(); } catch (e) { /* noop */ }
        if (uid) resolve(uid); else reject(new Error('no user_current'));
      }
    });
  });
}

test.describe('Whiteboard annotation authorship binding', { tag: '@ci' }, () => {
  test('binds annotation author to the submitter, not a forged participant id', async ({ browser, context, page }, testInfo) => {
    const m = new MultiUsers(browser, context);
    await m.initModPage(page, { testInfo });
    await m.initUserPage(context, { testInfo });
    await m.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await m.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    // the victim is the second real participant (its id survives the user join in the view)
    const victimId = await m.userPage.page.evaluate(browserOwnUserId);

    // R1: moderator (submitter) forges an annotation attributed to the victim
    const forged = await m.modPage.page.evaluate(browserSubmitAs, { targetUserId: victimId });
    expect(forged.targetUserId, 'sanity: forging the victim id').toBe(victimId);
    expect(forged.persistedAuthor, 'the annotation must be persisted and visible to participants').not.toBeNull();
    expect(forged.persistedAuthor, 'forged authorship must be rebound to the authenticated submitter').toBe(forged.submitterId);
    expect(forged.persistedAuthor, 'the victim must never be credited as author').not.toBe(victimId);
    expect(forged.persistedCreator, 'the forged meta.createdBy must be rebound to the submitter').toBe(forged.submitterId);
    expect(forged.persistedCreator, 'the victim must never be marked as creator').not.toBe(victimId);

    // R3 negative control: a legitimate self-authored annotation is still stored and attributed correctly
    const legit = await m.modPage.page.evaluate(browserSubmitAs, { targetUserId: forged.submitterId });
    expect(legit.persistedAuthor, 'legitimate drawing must remain attributed to its author').toBe(legit.submitterId);
    expect(legit.persistedCreator, 'legitimate meta.createdBy must remain the author').toBe(legit.submitterId);

    // R5 variant: UPDATE the legit shape carrying meta.createdBy = victim; the creator must stay the submitter
    const updated = await m.modPage.page.evaluate(browserSubmitAs, { targetUserId: victimId, reuseAnnotationId: legit.annotationId });
    expect(updated.annotationId, 'sanity: the update targeted the existing shape').toBe(legit.annotationId);
    expect(updated.persistedCreator, 'an update must not re-attribute the creator').toBe(legit.submitterId);
    expect(updated.persistedCreator, 'the victim must never become the creator via update').not.toBe(victimId);
    expect(updated.persistedAuthor, 'the update keeps the author bound to the submitter').toBe(legit.submitterId);
  });
});
