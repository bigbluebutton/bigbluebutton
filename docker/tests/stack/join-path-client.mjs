// Client part of join-path.sh: does what the html5 client does when a user joins, up to the
// GraphQL subscription, then joins the meeting, exports the shared notes as PDF, waits for the
// default presentation and uploads a PDF and a .docx; prints `STEP <name>: OK|FAIL ...` per
// step. Runs with Node 24 (global fetch, FormData and WebSocket), started by join-path.sh in a
// container on the host network.
//
// Arguments: BASE_URL (https://<domain>) TIMEOUT_SECONDS. The shared secret is the first line
// of stdin; it is used only to compute checksums and is never printed.
//
// Exit status: 0 every step OK, 1 a step failed.

import { createHash, randomUUID } from 'node:crypto';
import { crc32 } from 'node:zlib';

// node -e: argv[1] is the first argument.
const [baseUrl, timeoutArg] = process.argv.slice(1);
const timeoutMs = Number(timeoutArg || 30) * 1000;
// Conversion of a presentation (download, page count, SVG/PNG/thumbnail per page) takes longer
// than a request.
const conversionTimeoutMs = Math.max(timeoutMs, 180_000);
const UPLOAD_PAGES = 2;
const base = new URL(baseUrl);

let input = '';
for await (const chunk of process.stdin) input += chunk;
const secret = input.split('\n')[0].trim();
if (!secret) {
  console.log('STEP secret: FAIL no shared secret on stdin');
  process.exit(1);
}

// Header names as the client sends them (settings-loader, connection-manager; see below).
const SESSION_HEADER = 'x-session-token';
const WS_SESSION_HEADER = 'X-Session-Token';

class StepError extends Error {}
const ok = (name, detail = '') => console.log(`STEP ${name}: OK${detail ? ` ${detail}` : ''}`);
const fail = (detail) => { throw new StepError(detail); };

// Cookies as a browser keeps them for this host (JSESSIONID from bbb-web on join).
const cookies = new Map();
const keepCookies = (res) => {
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    if (i > 0) cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
};
const cookieHeader = () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');

async function get(url, headers = {}, redirect = 'follow') {
  const res = await fetch(url, {
    headers: { ...headers, ...(cookies.size ? { cookie: cookieHeader() } : {}) },
    redirect,
    signal: AbortSignal.timeout(timeoutMs),
  });
  keepCookies(res);
  return res;
}

// API call with checksum = sha1(call + query + secret) (bbb-web ApiParams / docs "API Security
// Model"). The URL carries only the checksum.
function apiUrl(call, params) {
  const query = new URLSearchParams(params).toString();
  const checksum = createHash('sha1').update(call + query + secret).digest('hex');
  return new URL(`/bigbluebutton/api/${call}?${query}&checksum=${checksum}`, base);
}
const xmlTag = (xml, tag) => (xml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)) || [])[1];
// A session token or checksum never reaches the output.
const redact = (s) => String(s).replace(/(sessionToken|checksum|access_token)=[^&\s"]*/g, '$1=__REDACTED__');

const meetingID = `join-path-${Date.now()}`;
let created = false;

async function run() {
  let step = 'api-index';
  let ws;
  try {
    // 1. BBBWeb.index (bigbluebutton-html5/imports/api/bbb-web-api/index.ts:32-38): JSON.
    let res = await get(new URL('/bigbluebutton/api', base), { 'Content-Type': 'application/json' });
    if (res.status !== 200) fail(`HTTP ${res.status}`);
    const index = (await res.json()).response;
    if (index?.returncode !== 'SUCCESS' || !index.graphqlApiUrl || !index.graphqlWebsocketUrl) {
      fail(`unexpected index ${JSON.stringify(index).slice(0, 300)}`);
    }
    ok(step, `graphqlApiUrl=${index.graphqlApiUrl} graphqlWebsocketUrl=${index.graphqlWebsocketUrl}`);

    step = 'create';
    res = await get(apiUrl('create', { name: 'join-path test', meetingID }));
    let xml = await res.text();
    if (res.status !== 200 || xmlTag(xml, 'returncode') !== 'SUCCESS') fail(`HTTP ${res.status} ${xml.slice(0, 300)}`);
    created = true;
    ok(step, `meetingID=${meetingID}`);

    // 2. join; the browser follows the redirect to /html5client/?sessionToken=...
    step = 'join';
    res = await get(apiUrl('join', { fullName: 'Join Path', meetingID, role: 'MODERATOR' }), {}, 'manual');
    const location = res.headers.get('location');
    if (res.status !== 302 || !location) fail(`HTTP ${res.status}, expected a redirect`);
    const clientUrl = new URL(location, base);
    const sessionToken = clientUrl.searchParams.get('sessionToken');
    if (!sessionToken) fail(`redirect without sessionToken: ${redact(clientUrl)}`);
    ok(step, `redirect to ${redact(clientUrl)}`);

    step = 'html5client';
    res = await get(clientUrl);
    await res.arrayBuffer();
    if (res.status !== 200) fail(`HTTP ${res.status}`);
    ok(step, `HTTP ${res.status}`);

    // 3. settings-loader (bigbluebutton-html5/imports/ui/components/settings-loader/component.tsx:78-85):
    // GET <graphqlApiUrl>/meetingStaticData with the x-session-token header; Hasura
    // authenticates it through its auth hook (akka-apps /userInfo).
    // bbb-web answers create and join before akka-apps has created the meeting and registered
    // the user (both arrive through redis); until then akka-apps' /userInfo does not know the
    // token and Hasura answers 400 (no x-hasura-role). A browser is slower than this script
    // (it loads the client first), so the request is repeated for a few seconds in that case.
    step = 'meetingStaticData';
    let body;
    let attempts = 0;
    const until = Date.now() + 10_000;
    for (;;) {
      attempts += 1;
      res = await get(new URL(`${index.graphqlApiUrl}/meetingStaticData`, base), { [SESSION_HEADER]: sessionToken });
      body = await res.text();
      if (res.status !== 400 || !body.includes('x-hasura-role') || Date.now() > until) break;
      await new Promise((r) => { setTimeout(r, 500); });
    }
    if (res.status !== 200) fail(`HTTP ${res.status} after ${attempts} attempt(s) ${body.slice(0, 300)}`);
    let meeting;
    try { meeting = JSON.parse(body)?.meeting?.[0]; } catch { /* checked below */ }
    if (!meeting?.clientSettings?.clientSettingsJson) fail(`no meeting or clientSettings in ${body.slice(0, 300)}`);
    ok(step, `HTTP 200 (attempt ${attempts}) meetingId=${meeting.meetingId ?? '?'} name=${JSON.stringify(meeting.name ?? '?')}`);
    const settings = meeting.clientSettings.clientSettingsJson;

    // The client files as the browser loads them, from the html5 client image (service html5)
    // through nginx: index.html and its bundle precompressed (gzip_static, bbb-html5.nginx.static),
    // and the build identifier as cache buster (?v=, build/packages-template/bbb-html5/build.sh:72)
    // equal to the one in the settings that akka-apps hands out.
    step = 'html5client-assets';
    const gzip = { 'Accept-Encoding': 'gzip' };
    res = await get(new URL('/html5client/', base), gzip);
    const indexHtml = await res.text();
    if (res.status !== 200) fail(`GET /html5client/ HTTP ${res.status}`);
    if (res.headers.get('content-encoding') !== 'gzip') fail(`GET /html5client/: Content-Encoding ${res.headers.get('content-encoding')}, expected gzip`);
    const build = settings?.public?.app?.html5ClientBuild;
    if (build === undefined || !indexHtml.includes(`?v=${build}`)) fail(`index.html has no ?v=${build} (html5ClientBuild of the settings)`);
    // index.html loads 'bundle.' + bundleHash + '.js' (bigbluebutton-html5/client/main.html:274-282).
    const bundleHash = (indexHtml.match(/var bundleHash = '([a-f0-9]+)';/) || [])[1];
    if (!bundleHash) fail('index.html sets no bundleHash');
    const bundle = `bundle.${bundleHash}.js`;
    res = await get(new URL(`/html5client/${bundle}`, base), gzip);
    const bundleBytes = (await res.arrayBuffer()).byteLength;
    if (res.status !== 200) fail(`GET /html5client/${bundle} HTTP ${res.status}`);
    if (res.headers.get('content-encoding') !== 'gzip') fail(`GET /html5client/${bundle}: Content-Encoding ${res.headers.get('content-encoding')}, expected gzip`);
    ok(step, `index.html and ${bundle} (${bundleBytes} bytes) gzip, ?v=${build}`);

    // 4. connection-manager (bigbluebutton-html5/imports/ui/components/connection-manager/component.tsx:228-289):
    // graphql-ws client on graphqlWebsocketUrl, connection_init with these headers.
    step = 'graphql-ws';
    ws = await GraphqlWs.open(index.graphqlWebsocketUrl, sessionToken);
    // The client's first subscription, by name: before the user has joined, graphql-middleware
    // forwards only the operations in AllowedSubscriptionsForNotInMeetingUsers
    // (bbb-graphql-middleware/config/Config.go) and drops the others silently.
    const userSub = ws.subscribe('userCurrentSubscription',
      'subscription userCurrentSubscription { user_current { userId name authToken joined presenter } }');
    let user = (await ws.next(userSub, (d) => d?.user_current?.[0]?.userId)).user_current[0];
    ok(step, `connection_ack, user_current userId=${user.userId}`);

    // 6. presenceManager (bigbluebutton-html5/imports/ui/components/join-handler/presenceManager/
    // component.tsx:144-153, queries.ts:24-32): the UserJoin mutation with user_current.authToken,
    // then user_current.joined turns true. The first moderator becomes presenter, which the
    // presentation views require (pres_presentation: X-Hasura-PresenterInMeeting).
    step = 'user-join';
    const { authToken } = user;
    ws.request('UserJoin',
      'mutation UserJoin($authToken: String!, $clientType: String!, $clientIsMobile: Boolean!) { userJoinMeeting(authToken: $authToken, clientType: $clientType, clientIsMobile: $clientIsMobile) }',
      { authToken, clientType: 'HTML5', clientIsMobile: false });
    user = (await ws.next(userSub, (d) => d?.user_current?.[0]?.joined && d.user_current[0].presenter)).user_current[0];
    ok(step, `joined=${user.joined} presenter=${user.presenter}`);

    // The shared notes' PDF export as the notes menu starts it (bigbluebutton-html5/imports/ui/
    // components/notes/notes-dropdown/component.tsx:111-124): the pad id from the getPadId query
    // (notes/component.tsx:196-201, notes/queries.ts) with public.notes.id, then
    // GET /hocuspocus/api/documents/<padId>/export/pdf?sessionToken=..., which nginx authorizes
    // through bbb-web (bbb-shared-notes-server.nginx) and shared-notes renders with wkhtmltopdf
    // through its runner script (exportDocumentToPdf.ts).
    step = 'notes-export-pdf';
    const padSub = ws.subscribe('getPadId',
      'query getPadId($externalId: String!) { sharedNotes(where: { sharedNotesExtId: { _eq: $externalId } }) { padId sharedNotesExtId } }',
      { externalId: settings?.public?.notes?.id ?? 'notes' }, { repeatMs: 1000 });
    const { padId } = (await ws.next(padSub, (d) => d?.sharedNotes?.[0]?.padId)).sharedNotes[0];
    ws.stop(padSub);
    const notesHost = settings?.public?.sharedNotes?.serverHostname || base.hostname;
    const notesUrl = new URL(`https://${notesHost}${base.port ? `:${base.port}` : ''}/hocuspocus/api/documents/${encodeURIComponent(padId)}/export/pdf?sessionToken=${encodeURIComponent(sessionToken)}`);
    // shared-notes answers 403 until bbb-web reports the user as online (User-Currently-Online,
    // ConnectionController.groovy checkGraphqlAuthorization); bbb-web learns of the join from
    // akka-apps through redis, which can take a moment after a restart. A user opens the menu
    // later than this script, so a 403 is repeated for a few seconds.
    let notesPdf;
    let notesAttempts = 0;
    const notesUntil = Date.now() + 10_000;
    for (;;) {
      notesAttempts += 1;
      res = await get(notesUrl);
      notesPdf = Buffer.from(await res.arrayBuffer());
      if (res.status !== 403 || Date.now() > notesUntil) break;
      await new Promise((r) => { setTimeout(r, 500); });
    }
    const notesType = res.headers.get('content-type');
    if (res.status !== 200) fail(`GET export/pdf HTTP ${res.status} after ${notesAttempts} attempt(s) ${redact(notesPdf.toString('utf8', 0, 200))}`);
    if (!notesType?.startsWith('application/pdf')) fail(`GET export/pdf: Content-Type ${notesType}`);
    if (notesPdf.subarray(0, 5).toString('latin1') !== '%PDF-' || !notesPdf.subarray(-32).toString('latin1').includes('%%EOF')) {
      fail(`GET export/pdf: ${notesPdf.length} bytes, not a PDF`);
    }
    ok(step, `padId=${padId} HTTP 200 (attempt ${notesAttempts}) ${notesType} ${notesPdf.length} bytes %PDF-…%%EOF`);

    // The learning dashboard as a moderator opens it (bigbluebutton-html5/imports/ui/components/
    // learning-dashboard/service.js): the app from the learning-dashboard image, and the meeting's
    // data, which akka-apps reports every 5 s (LearningDashboardActor.scala:158) and bbb-web
    // writes to bbb-data as <meetingId>/<token>/learning_dashboard_data.json
    // (LearningDashboardService.java), served by nginx from the volume (docker/nginx/Dockerfile).
    // The token comes from the query the client runs (meeting-ended/queries.ts).
    step = 'learning-dashboard';
    const ldBase = `${settings?.public?.app?.learningDashboardBase ?? '/learning-analytics-dashboard'}/`;
    res = await get(new URL(`${ldBase}?meeting=${encodeURIComponent(meeting.meetingId)}&lang=en`, base));
    const ldIndex = await res.text();
    if (res.status !== 200 || !ldIndex.includes('<title>Learning Dashboard</title>')) fail(`GET ${ldBase} HTTP ${res.status}, expected the dashboard app`);
    const ldSub = ws.subscribe('getMeetingEndData',
      'query getMeetingEndData { user_current { meeting { learningDashboard { learningDashboardAccessToken } } } }',
      {}, { repeatMs: 1000 });
    const ldToken = (await ws.next(ldSub, (d) => d?.user_current?.[0]?.meeting?.learningDashboard?.learningDashboardAccessToken))
      .user_current[0].meeting.learningDashboard.learningDashboardAccessToken;
    ws.stop(ldSub);
    const ldDir = `${ldBase}${encodeURIComponent(meeting.meetingId)}/${encodeURIComponent(ldToken)}/`;
    const ldUntil = Date.now() + 30_000;
    let ldData;
    let ldType;
    for (;;) {
      res = await get(new URL(`${ldDir}learning_dashboard_data.json`, base));
      const text = await res.text();
      if (res.status === 200) {
        ldType = res.headers.get('content-type');
        try { ldData = JSON.parse(text); } catch { fail(`learning_dashboard_data.json is not JSON: ${text.slice(0, 100)}`); }
        break;
      }
      if (res.status !== 404 || Date.now() > ldUntil) fail(`GET <meeting>/<token>/learning_dashboard_data.json HTTP ${res.status}`);
      await new Promise((r) => { setTimeout(r, 1000); });
    }
    if (ldData?.intId !== meeting.meetingId) fail(`learning_dashboard_data.json is for meeting ${ldData?.intId}`);
    if (ldType !== 'application/json') fail(`learning_dashboard_data.json: Content-Type ${ldType}`);
    // Nothing else below the prefix comes from the volume, and no path leaves it.
    const probes = [
      `${ldDir}`, `${ldDir}x.json`, `${ldDir}sub/learning_dashboard_data.json`,
      `${ldBase}${encodeURIComponent(meeting.meetingId)}/`, `${ldBase}learning_dashboard_data.json`,
      `${ldBase}${encodeURIComponent(meeting.meetingId)}/..%2F..%2F${encodeURIComponent(meeting.meetingId)}/${encodeURIComponent(ldToken)}/learning_dashboard_data.json`,
      `${ldBase}..%2F..%2F..%2Fetc%2Fpasswd`,
    ];
    for (const probe of probes) {
      res = await get(new URL(probe, base));
      const text = await res.text();
      if ((res.status !== 404 && res.status !== 400) || text.includes(meeting.meetingId)) {
        fail(`GET ${redact(probe.replace(ldToken, '<token>'))} HTTP ${res.status}, expected 404 or 400`);
      }
    }
    ok(step, `app 200, <meeting>/<token>/learning_dashboard_data.json 200 (${ldType}), ${probes.length} other paths 404/400`);

    // 7. The presentation list of the uploader (bigbluebutton-html5/imports/ui/components/
    // whiteboard/queries.ts, PRESENTATIONS_SUBSCRIPTION). bbb-web downloads the default
    // presentation (beans.presentationService.defaultUploadedPresentation) at create and converts
    // it; akka-apps reports the converted pages, which reach the client here.
    step = 'default-presentation';
    const presSub = ws.subscribe('PresentationsSubscription',
      'subscription PresentationsSubscription { pres_presentation { presentationId name isDefault current uploadCompleted totalPages totalPagesUploaded uploadErrorMsgKey uploadErrorDetailsJson } }');
    const converted = (p) => p.uploadCompleted && p.totalPages > 0 && p.totalPagesUploaded === p.totalPages;
    const failed = (p) => p.uploadErrorMsgKey;
    let pres = await ws.next(presSub, (d) => d?.pres_presentation?.find((p) => p.isDefault && (converted(p) || failed(p))),
      conversionTimeoutMs);
    if (failed(pres)) fail(`conversion failed: ${pres.uploadErrorMsgKey} ${JSON.stringify(pres.uploadErrorDetailsJson ?? '')}`);
    ok(step, `${JSON.stringify(pres.name)} ${pres.totalPagesUploaded}/${pres.totalPages} pages converted`);

    // 8. Upload as the presentation uploader does (bigbluebutton-html5/imports/ui/components/
    // actions-bar/media-area/media-sharing/presentation/service.js:44-120, mutation.ts, queries.ts):
    // request an upload token, read it from pres_presentation_uploadToken, POST the file to
    // <uploadEndpoint with the token> (settings.yml public.presentation.uploadEndpoint).
    const upload = async (filename, file, pages) => {
      const uploadTemporaryId = `join-path-${randomUUID()}`;
      ws.request('RequestPresentationUploadToken',
        'mutation RequestPresentationUploadToken($podId: String!, $filename: String!, $uploadTemporaryId: String!) { presentationRequestUploadToken(podId: $podId, filename: $filename, uploadTemporaryId: $uploadTemporaryId) }',
        { podId: 'DEFAULT_PRESENTATION_POD', filename, uploadTemporaryId });
      const tokenSub = ws.subscribe('getPresentationUploadToken',
        'query getPresentationUploadToken($uploadTemporaryId: String!) { pres_presentation_uploadToken(where: {uploadTemporaryId: {_eq: $uploadTemporaryId}}) { presentationId uploadTemporaryId uploadToken } }',
        { uploadTemporaryId }, { repeatMs: 1000 });
      const { uploadToken } = (await ws.next(tokenSub, (d) => d?.pres_presentation_uploadToken?.[0]?.uploadToken))
        .pres_presentation_uploadToken[0];
      ws.stop(tokenSub);
      const uploadEndpoint = settings?.public?.presentation?.uploadEndpoint ?? '/bigbluebutton/presentation/upload';
      const form = new FormData();
      form.append('fileUpload', file, filename);
      form.append('conference', meeting.meetingId);
      form.append('room', meeting.meetingId);
      form.append('temporaryPresentationId', uploadTemporaryId);
      form.append('pod_id', 'DEFAULT_PRESENTATION_POD');
      form.append('is_downloadable', 'false');
      form.append('current', 'true');
      res = await fetch(new URL(uploadEndpoint.replace('upload', `${uploadToken}/upload`), base), {
        method: 'POST',
        body: form,
        headers: cookies.size ? { cookie: cookieHeader() } : {},
        signal: AbortSignal.timeout(timeoutMs),
      });
      const uploadBody = (await res.text()).trim();
      if (res.status !== 200) fail(`POST upload HTTP ${res.status} ${redact(uploadBody.slice(0, 200))}`);
      pres = await ws.next(presSub, (d) => d?.pres_presentation?.find((p) => p.name === filename && (converted(p) || failed(p))),
        conversionTimeoutMs);
      if (failed(pres)) fail(`conversion failed: ${pres.uploadErrorMsgKey} ${JSON.stringify(pres.uploadErrorDetailsJson ?? '')}`);
      if (pres.totalPages !== pages) fail(`${filename}: ${pres.totalPages} pages, expected ${pages}`);
      ok(step, `${JSON.stringify(pres.name)} ${pres.totalPagesUploaded}/${pres.totalPages} pages converted`);
    };
    step = 'upload-presentation';
    await upload('join-path.pdf', new Blob([pdf(UPLOAD_PAGES)], { type: 'application/pdf' }), UPLOAD_PAGES);

    // 9. An office document, uploaded the same way: bbb-web converts it to PDF through the
    // conversion service (BBB_WEB_CONVERSION_URL, convert-remote.sh), then page by page.
    step = 'upload-office-document';
    await upload('join-path.docx', new Blob([docx(UPLOAD_PAGES)],
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), UPLOAD_PAGES);

    // 5. LiveKit signaling URL handed to the client
    // (bigbluebutton-html5/imports/ui/components/livekit/primary-room/component.tsx:197).
    step = 'livekit';
    const lkUrl = new URL(settings?.public?.media?.livekit?.url ?? `wss://${base.hostname}/livekit`);
    const lkHttp = new URL(lkUrl.href.replace(/^ws/, 'http').replace(/\/?$/, '/'));
    res = await get(lkHttp);
    const lkBody = (await res.text()).trim();
    if (res.status !== 200) fail(`GET ${lkHttp} HTTP ${res.status}`);
    // livekit-client first calls <url>/rtc/validate; without a token LiveKit answers 401.
    res = await get(new URL('rtc/validate', lkHttp));
    const vBody = (await res.text()).trim();
    if (res.status !== 401) fail(`GET ${lkHttp}rtc/validate HTTP ${res.status}, expected 401 from LiveKit: ${vBody.slice(0, 200)}`);
    ok(step, `url=${lkUrl} GET / -> 200 ${JSON.stringify(lkBody.slice(0, 20))}, rtc/validate without token -> 401`);
  } catch (e) {
    console.log(`STEP ${step}: FAIL ${redact(e instanceof StepError ? e.message : e?.cause?.message ?? e)}`);
    return 1;
  } finally {
    ws?.close();
    if (created) {
      try { await (await get(apiUrl('end', { meetingID }))).text(); } catch { /* best effort */ }
    }
  }
  return 0;
}

// GraphQL over WebSocket as the html5 client speaks it (graphql-transport-ws, through
// graphql-middleware). subscribe() sends an operation and keeps its latest data; next() waits
// until the data of an operation satisfies a predicate. A `complete` of a subscription (which
// graphql-middleware sends when it re-establishes the Hasura connection, for example after the
// user joined) re-sends it; a query with repeatMs is sent again that long after each answer,
// until stopped.
class GraphqlWs {
  static open(url, sessionToken) {
    return new Promise((resolve, reject) => {
      // The browser sends its cookies for the host with the upgrade request, among them bbb-web's
      // JSESSIONID from the join (Path=/): graphql-middleware forwards them to bbb-web's
      // checkGraphqlAuthorization, which accepts the session token only with that HTTP session
      // (bigbluebutton-web/.../ConnectionController.groovy, isSessionTokenValid).
      // `headers` is undici's extension of the WebSocket constructor (Node 24).
      const ws = new WebSocket(url, { protocols: ['graphql-transport-ws'], headers: cookies.size ? { cookie: cookieHeader() } : {} });
      const conn = new GraphqlWs(ws);
      const timer = setTimeout(() => { ws.close(); reject(new StepError(`no connection_ack within ${timeoutMs / 1000}s`)); }, timeoutMs);
      conn.onAck = () => { clearTimeout(timer); resolve(conn); };
      conn.onFatal = (e) => { clearTimeout(timer); reject(e); };
      ws.onopen = () => ws.send(JSON.stringify({
        type: 'connection_init',
        payload: {
          headers: {
            [WS_SESSION_HEADER]: sessionToken,
            'X-ClientSessionUUID': randomUUID(),
            'X-ClientType': 'HTML5',
            'X-ClientIsMobile': 'false',
          },
        },
      }));
    });
  }

  constructor(ws) {
    this.ws = ws;
    this.ops = new Map();
    this.waiters = new Set();
    this.seq = 0;
    this.closed = false;
    ws.onmessage = (ev) => this.message(ev);
    ws.onerror = (ev) => this.fatal(new StepError(`websocket error ${ev?.message ?? ''}`));
    ws.onclose = (ev) => this.fatal(new StepError(`websocket closed code=${ev.code} reason=${ev.reason}`));
  }

  send(msg) { this.ws.send(JSON.stringify(msg)); }

  start(op) {
    this.send({ id: op.id, type: 'subscribe', payload: { operationName: op.name, query: op.query, variables: op.variables } });
  }

  // subscribe(NAME, QUERY, VARIABLES, {repeatMs}) -> operation id
  subscribe(name, query, variables = {}, { repeatMs = 0 } = {}) {
    const op = { id: String(++this.seq), name, query, variables, data: undefined, repeatMs, timer: null };
    this.ops.set(op.id, op);
    this.start(op);
    return op.id;
  }

  // request(NAME, QUERY, VARIABLES): a mutation; its result is not needed.
  request(name, query, variables = {}) { return this.subscribe(name, query, variables); }

  stop(id) {
    const op = this.ops.get(id);
    if (!op) return;
    clearTimeout(op.timer);
    this.ops.delete(id);
    try { this.send({ id, type: 'complete' }); } catch { /* closed */ }
  }

  // next(ID, PREDICATE, TIMEOUT_MS): the first data of ID (current or coming) for which PREDICATE
  // returns a truthy value; resolves to that value if it is an object, else to the data.
  next(id, predicate, waitMs = timeoutMs) {
    return new Promise((resolve, reject) => {
      const w = { id, predicate, resolve, reject, last: undefined };
      w.timer = setTimeout(() => {
        this.waiters.delete(w);
        reject(new StepError(`no matching data within ${waitMs / 1000}s; last: ${JSON.stringify(this.ops.get(id)?.data ?? null).slice(0, 400)}`));
      }, waitMs);
      this.waiters.add(w);
      this.check(w);
    });
  }

  check(w) {
    const data = this.ops.get(w.id)?.data;
    if (data === undefined) return;
    const v = w.predicate(data);
    if (!v) return;
    clearTimeout(w.timer);
    this.waiters.delete(w);
    w.resolve(v !== null && typeof v === 'object' ? v : data);
  }

  message(ev) {
    const msg = JSON.parse(ev.data);
    if (process.env.JOIN_PATH_DEBUG) console.error('ws <', String(ev.data).slice(0, 300));
    if (msg.type === 'connection_ack') { this.onAck?.(); return; }
    if (msg.type === 'ping') { this.send({ type: 'pong' }); return; }
    const op = this.ops.get(msg.id);
    if (!op) return;
    if (msg.type === 'next') {
      if (msg.payload?.errors) { this.fatal(new StepError(`${op.name}: ${JSON.stringify(msg.payload.errors).slice(0, 300)}`)); return; }
      op.data = msg.payload?.data;
      for (const w of [...this.waiters]) if (w.id === op.id) this.check(w);
    } else if (msg.type === 'error') {
      this.fatal(new StepError(`${op.name}: error ${JSON.stringify(msg.payload).slice(0, 300)}`));
    } else if (msg.type === 'complete' && op.repeatMs) {
      // a query: asked again, as the uploader polls for its upload token
      op.timer = setTimeout(() => { if (this.ops.has(op.id) && !this.closed) this.start(op); }, op.repeatMs);
    } else if (msg.type === 'complete' && !op.query.startsWith('mutation')) {
      this.start(op);
    }
  }

  fatal(e) {
    if (this.closed) return;
    this.closed = true;
    this.onFatal?.(e);
    for (const w of this.waiters) { clearTimeout(w.timer); w.reject(e); }
    this.waiters.clear();
    for (const op of this.ops.values()) clearTimeout(op.timer);
  }

  close() {
    this.closed = true;
    for (const op of this.ops.values()) clearTimeout(op.timer);
    try { this.ws.close(); } catch { /* closed */ }
  }
}

// A PDF with N pages of text, built by hand (offsets in the xref table are byte offsets).
function pdf(pages) {
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', null, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const kids = [];
  for (let i = 1; i <= pages; i += 1) {
    const content = `BT /F1 48 Tf 72 640 Td (join-path page ${i}) Tj ET`;
    kids.push(`${objs.length + 1} 0 R`);
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${objs.length + 2} 0 R >>`);
    objs.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages} >>`;
  let out = '%PDF-1.4\n';
  const offsets = objs.map((o, i) => { const off = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return off; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

// A Word document (.docx) with N pages of text, built by hand: the three parts a WordprocessingML
// package needs (ECMA-376 Part 2 package, Part 1 document), each page after the first starting
// with a page break, in a ZIP archive without compression.
function docx(pages) {
  const ns = 'http://schemas.openxmlformats.org';
  const paras = [];
  for (let i = 1; i <= pages; i += 1) {
    paras.push(`<w:p><w:r>${i > 1 ? '<w:br w:type="page"/>' : ''}<w:t>join-path page ${i}</w:t></w:r></w:p>`);
  }
  return zip([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="${ns}/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${ns}/package/2006/relationships"><Relationship Id="rId1" Type="${ns}/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ['word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${ns}/wordprocessingml/2006/main"><w:body>${paras.join('')}</w:body></w:document>`],
  ]);
}

// A ZIP archive of [name, text] entries, stored (method 0), as APPNOTE.TXT 4.3 lays it out.
function zip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, text] of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const data = Buffer.from(text, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10); cd.writeUInt32LE(0, 12); cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(data.length, 24); cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt32LE(offset, 42);
    parts.push(local, nameBuf, data);
    central.push(cd, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const cdBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cdBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cdBuf, end]);
}

process.exit(await run());
