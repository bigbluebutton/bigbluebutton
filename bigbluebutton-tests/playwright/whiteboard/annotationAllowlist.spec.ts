import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { test } from '../core/setup/fixtures';
import { MultiUsers } from '../user/multiusers';

// The server stores a whiteboard annotation only if its type is on the
// whiteboard.allowedAnnotationTypes allowlist (embed, bookmark, image and video
// never are) and any props.url it carries is empty or an http(s) URL. The same
// gate applies when an existing shape is updated. The assertions describe that
// behaviour, independently of the client's own shape-type checks.
//
// Shapes are submitted over the page's own authenticated GraphQL websocket
// through presAnnotationSubmit and read back from pres_annotation_curr, so the
// real server path is exercised end-to-end. Each round is one submit. akka
// writes the annotations it keeps to the database one at a time, in submit
// order, so the shapes expected to be stored go last: once they are visible,
// any earlier shape of the same submit that had been stored would be too.

type ShapeSpec = { id: string; index: string; type: string; props: Record<string, unknown> };
type SubmitArgs = { shapes: ShapeSpec[]; acceptedIds: string[] };
type StoredShape = { type?: string; props?: Record<string, unknown>; meta?: { probe?: string } };
type StoredShapes = Record<string, StoredShape>;
type GraphqlResult = { data?: Record<string, unknown>; errors?: unknown } | null;

const SAFE_URL = 'https://example.com';
const HTTP_URL = 'http://example.com';
// eslint-disable-next-line no-script-url -- a link the server must refuse to store
const SCRIPT_URL = 'javascript:alert(1)';

// Runs in the browser. Opens a second graphql-transport-ws connection reusing
// the page session, submits the shapes on the current page, waits until every
// id in acceptedIds is stored with this submit's marker, and returns every
// annotation on the page keyed by id.
function browserSubmitShapes({ shapes, acceptedIds }: SubmitArgs): Promise<StoredShapes> {
  return new Promise<StoredShapes>((resolve, reject) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    const clientSessionUUID = sessionStorage.getItem('clientSessionUUID') || 'annotation-allowlist-probe';
    if (!sessionToken) {
      reject(new Error('no sessionToken in sessionStorage'));
      return;
    }

    const ws = new WebSocket(`wss://${window.location.host}/graphql`, 'graphql-transport-ws');
    // per-call marker so the read-back waits for THIS submit (matters when updating existing shapes)
    const probe = `allowlist-${Math.random().toString(36).slice(2, 10)}`;
    let subId = 0;
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch {
        /* noop */
      }
      reject(new Error('probe timed out'));
    }, 60000);
    const send = (obj: unknown) => ws.send(JSON.stringify(obj));

    const request = (query: string, variables: Record<string, unknown>) =>
      new Promise<GraphqlResult>((res) => {
        const id = `op-${(subId += 1)}`;
        const onMsg = (ev: MessageEvent) => {
          const m = JSON.parse(ev.data as string);
          if (m.type === 'ping') {
            send({ type: 'pong' });
            return;
          }
          if (m.id !== id) return;
          if (m.type === 'next') {
            ws.removeEventListener('message', onMsg);
            send({ id, type: 'complete' });
            res(m.payload);
          } else if (m.type === 'error') {
            ws.removeEventListener('message', onMsg);
            res({ errors: m.payload });
          } else if (m.type === 'complete') {
            ws.removeEventListener('message', onMsg);
            res(null);
          }
        };
        ws.addEventListener('message', onMsg);
        send({ id, type: 'subscribe', payload: { query, variables } });
      });

    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error('websocket error'));
    };
    ws.onopen = () =>
      send({
        type: 'connection_init',
        payload: {
          headers: {
            'X-Session-Token': sessionToken,
            'X-ClientSessionUUID': clientSessionUUID,
            'X-ClientType': 'HTML5',
            'X-ClientIsMobile': 'false',
          },
        },
      });

    const ackHandler = async (ev: MessageEvent) => {
      const m = JSON.parse(ev.data as string);
      if (m.type === 'ping') {
        send({ type: 'pong' });
        return;
      }
      if (m.type !== 'connection_ack') return;
      ws.removeEventListener('message', ackHandler);
      try {
        const me = await request('subscription Me { user_current { userId } }', {});
        const [currentUser] = (me?.data?.user_current ?? []) as { userId?: string }[];
        const submitterId = currentUser?.userId;
        if (!submitterId) throw new Error('could not resolve submitter userId');

        // target the current page (the server drops annotations on foreign pages,
        // and pres_annotation_curr only exposes the current page)
        let currentPage: { pageId: string; num: number } | null = null;
        for (let i = 0; i < 20 && !currentPage; i += 1) {
          const pg = await request(
            'subscription Pg { pres_page(where: {isCurrentPage: {_eq: true}}) { pageId num } }',
            {},
          );
          const rows = (pg?.data?.pres_page ?? []) as { pageId: string; num: number }[];
          if (rows.length) [currentPage] = rows;
          else {
            await new Promise((r) => {
              setTimeout(r, 1000);
            });
          }
        }
        if (!currentPage) throw new Error('no current page found');
        const { pageId, num } = currentPage;

        const annotations = shapes.map((shape, i) => ({
          id: shape.id,
          annotationInfo: {
            id: shape.id,
            typeName: 'shape',
            type: shape.type,
            x: 40 + 120 * i,
            y: 40,
            rotation: 0,
            index: shape.index,
            parentId: `page:${num}`,
            isLocked: false,
            opacity: 1,
            props: shape.props,
            meta: { probe },
          },
          wbId: pageId,
          userId: submitterId,
        }));
        const submitted = await request(
          'mutation Submit($pageId: String!, $annotations: json!) { presAnnotationSubmit(pageId: $pageId, annotations: $annotations) }',
          { pageId, annotations },
        );
        if (submitted?.errors) throw new Error(`presAnnotationSubmit failed: ${JSON.stringify(submitted.errors)}`);

        let stored: StoredShapes | null = null;
        for (let i = 0; i < 20 && stored === null; i += 1) {
          const cur = await request(
            'subscription Cur($pageId: String!) { pres_annotation_curr(where: {pageId: {_eq: $pageId}}) { annotationId annotationInfo } }',
            { pageId },
          );
          const rows = (cur?.data?.pres_annotation_curr ?? []) as { annotationId: string; annotationInfo: unknown }[];
          const byId: StoredShapes = {};
          rows.forEach((row) => {
            byId[row.annotationId] = (
              typeof row.annotationInfo === 'string' ? JSON.parse(row.annotationInfo) : row.annotationInfo
            ) as StoredShape;
          });
          if (acceptedIds.every((id) => byId[id]?.meta?.probe === probe)) stored = byId;
          else {
            await new Promise((r) => {
              setTimeout(r, 500);
            });
          }
        }
        if (!stored) throw new Error('accepted shapes were not stored');

        clearTimeout(timer);
        try {
          ws.close();
        } catch {
          /* noop */
        }
        resolve(stored);
      } catch (err) {
        clearTimeout(timer);
        try {
          ws.close();
        } catch {
          /* noop */
        }
        reject(err);
      }
    };
    ws.addEventListener('message', ackHandler);
  });
}

const LABEL_STYLE = {
  color: 'black',
  size: 'm',
  font: 'draw',
  align: 'middle',
  verticalAlign: 'middle',
  growY: 0,
};

function geoShape(id: string, index: string, url: string, text = ''): ShapeSpec {
  return {
    id,
    index,
    type: 'geo',
    props: {
      ...LABEL_STYLE,
      geo: 'rectangle',
      labelColor: 'black',
      fill: 'none',
      dash: 'draw',
      w: 100,
      h: 100,
      url,
      text,
    },
  };
}

function noteShape(id: string, index: string, url: string): ShapeSpec {
  return {
    id,
    index,
    type: 'note',
    props: { ...LABEL_STYLE, url, text: '' },
  };
}

// carries a valid https url, so only its type can get it rejected
function shapeOfType(id: string, index: string, type: string): ShapeSpec {
  return {
    id,
    index,
    type,
    props: { w: 100, h: 100, url: SAFE_URL },
  };
}

test.describe('Whiteboard annotation allowlist', { tag: '@ci' }, () => {
  test('stores only allowlisted shape types with http(s) links, on create and on update', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const m = new MultiUsers(browser, context);
    await m.initModPage(page, { testInfo });
    await m.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);

    const run = Math.random().toString(36).slice(2, 8);
    const id = (name: string) => `shape:${run}-${name}`;

    const plainGeo = geoShape(id('geo-plain'), 'a1', '');
    const linkedGeo = geoShape(id('geo-https'), 'a2', SAFE_URL);
    const linkedNote = noteShape(id('note-http'), 'a3', HTTP_URL);
    const rejected = [
      shapeOfType(id('embed'), 'a4', 'embed'),
      shapeOfType(id('bookmark'), 'a5', 'bookmark'),
      shapeOfType(id('image'), 'a6', 'image'),
      shapeOfType(id('video'), 'a7', 'video'),
      shapeOfType(id('unlisted'), 'a8', 'not-on-the-allowlist'),
      geoShape(id('geo-script'), 'a9', SCRIPT_URL),
      noteShape(id('note-data'), 'aA', 'data:text/html,hello'),
    ];

    // create: allowlisted types with empty or http(s) links are stored, nothing else is
    const created = await m.modPage.page.evaluate(browserSubmitShapes, {
      shapes: [...rejected, plainGeo, linkedGeo, linkedNote],
      acceptedIds: [plainGeo.id, linkedGeo.id, linkedNote.id],
    });
    expect(created[plainGeo.id]?.props?.url, 'a shape without a link is kept').toBe('');
    expect(created[linkedGeo.id]?.props?.url, 'an https link on a geo shape is kept').toBe(SAFE_URL);
    expect(created[linkedNote.id]?.props?.url, 'an http link on a note shape is kept').toBe(HTTP_URL);
    rejected.forEach((shape) => {
      expect(
        created[shape.id],
        `${shape.id} (${shape.type}, url ${shape.props.url}) must not be stored`,
      ).toBeUndefined();
    });

    // update: the gate applies to the merged shape, so neither a bad link nor a
    // forbidden type can be introduced on an already stored shape
    const updated = await m.modPage.page.evaluate(browserSubmitShapes, {
      shapes: [
        geoShape(linkedGeo.id, linkedGeo.index, SCRIPT_URL),
        { ...linkedNote, type: 'embed' },
        geoShape(plainGeo.id, plainGeo.index, '', 'updated'),
      ],
      acceptedIds: [plainGeo.id],
    });
    expect(updated[plainGeo.id]?.props?.text, 'an allowed update is stored').toBe('updated');
    expect(updated[linkedGeo.id]?.props?.url, 'an update carrying a non-http(s) link is rejected').toBe(SAFE_URL);
    expect(updated[linkedNote.id]?.type, 'an update changing the type to a forbidden one is rejected').toBe('note');
  });
});
