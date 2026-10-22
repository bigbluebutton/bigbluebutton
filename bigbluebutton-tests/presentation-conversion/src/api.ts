import crypto from 'crypto';
import { Target } from './env';

export interface ApiResponse {
  status: number;
  body: string;
  returncode?: string;
  messageKey?: string;
  message?: string;
}

export function xmlTag(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : undefined;
}

export interface MeetingSummary {
  meetingID: string;
  /** children of the meeting's <metadata> element: its meta_* create parameters, names lower-cased by bbb-web */
  metadata: Record<string, string>;
}

/**
 * The meetings of a getMeetings response, read per <meeting> element. Anything but SUCCESS throws: a wrong secret or a
 * proxy error page is not an empty server, which answers SUCCESS with messageKey noMeetings and no <meeting>.
 */
export function parseMeetings(r: ApiResponse): MeetingSummary[] {
  if (r.returncode !== 'SUCCESS')
    throw new Error(`getMeetings did not answer SUCCESS (HTTP ${r.status}, returncode ${r.returncode ?? 'none'}, messageKey ${r.messageKey ?? 'none'})`);
  return [...r.body.matchAll(/<meeting>([\s\S]*?)<\/meeting>/g)].map(([, xml]) => {
    const metadata: Record<string, string> = {};
    for (const [, key, value] of (xmlTag(xml, 'metadata') ?? '').matchAll(/<([\w.-]+)>([\s\S]*?)<\/\1>/g))
      metadata[key] = value.replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
    return { meetingID: xmlTag(xml, 'meetingID') ?? '', metadata };
  });
}

/** Meetings this suite created: tagged meta_pcsuite=1 at create, or, from runs before that tag, named pc-<run>-<profile>-<n>. */
export function isSuiteMeeting(m: MeetingSummary): boolean {
  return m.metadata.pcsuite === '1' || /^pc-.+-\d+$/.test(m.meetingID);
}

export function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export class BbbApi {
  constructor(private readonly target: Target) {}

  url(call: string, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    const checksum = crypto.createHash(this.target.checksum).update(call + query + this.target.secret).digest('hex');
    return `${this.target.apiBase}${call}?${query}${query ? '&' : ''}checksum=${checksum}`;
  }

  async call(call: string, params: Record<string, string>, body?: string, timeoutMs = 120_000): Promise<ApiResponse> {
    const res = await fetch(this.url(call, params), {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/xml' },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    return {
      status: res.status,
      body: text,
      returncode: xmlTag(text, 'returncode'),
      messageKey: xmlTag(text, 'messageKey'),
      message: xmlTag(text, 'message'),
    };
  }

  /** Unsigned probe of the API root: SUCCESS once bbb-web is up. */
  async alive(): Promise<boolean> {
    try {
      const res = await fetch(this.target.apiBase, { signal: AbortSignal.timeout(10_000) });
      return res.ok && /<returncode>SUCCESS<\/returncode>/.test(await res.text());
    } catch {
      return false;
    }
  }

  async create(meetingID: string, params: Record<string, string>, modulesXml?: string): Promise<ApiResponse & { internalMeetingID?: string }> {
    const r = await this.call('create', { name: meetingID, meetingID, ...params }, modulesXml);
    return { ...r, internalMeetingID: xmlTag(r.body, 'internalMeetingID') };
  }

  insertDocument(meetingID: string, modulesXml: string): Promise<ApiResponse> {
    return this.call('insertDocument', { meetingID }, modulesXml);
  }

  end(meetingID: string): Promise<ApiResponse> {
    return this.call('end', { meetingID });
  }

  async meetings(): Promise<MeetingSummary[]> {
    return parseMeetings(await this.call('getMeetings', {}));
  }

  /** Joins without a browser and keeps bbb-web's session cookie, which the slide endpoints require. */
  async join(meetingID: string, fullName: string): Promise<{ sessionToken: string; cookie: string } | { error: string }> {
    const res = await fetch(this.url('join', { meetingID, fullName, role: 'MODERATOR', redirect: 'false' }), {
      signal: AbortSignal.timeout(30_000),
    });
    const body = await res.text();
    const sessionToken = xmlTag(body, 'session_token');
    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    if (!sessionToken) return { error: `join failed (${res.status}): ${xmlTag(body, 'messageKey') ?? body.slice(0, 200)}` };
    return { sessionToken, cookie };
  }
}

export function documentXml(doc: { name: string; base64?: string; url?: string; current?: boolean }): string {
  const current = doc.current ? ' current="true"' : '';
  if (doc.url) return `<document url="${xmlEscape(doc.url)}" filename="${xmlEscape(doc.name)}"${current}/>`;
  return `<document name="${xmlEscape(doc.name)}"${current}>${doc.base64}</document>`;
}

export function modulesXml(docs: string[]): string {
  return `<modules><module name="presentation">${docs.join('')}</module></modules>`;
}

export function pageToken(secret: string, presId: string, page: number): string {
  return crypto.createHmac('sha256', secret).update(`${presId}|${page}`).digest('hex');
}
