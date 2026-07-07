import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Logger } from '../common/logger';

const logger = new Logger('active-meetings');

// bbb-web is co-located and is the authority on which meetings are running. We
// read its shared secret from the standard properties file and ask it via the
// signed getMeetings API. Both paths are fixed in a BBB deployment, so they are
// constants here (mirroring the hardcoded system paths in config/index.ts).
const BBB_WEB_PROPERTIES_PATH = '/etc/bigbluebutton/bbb-web.properties';
const GET_MEETINGS_URL = 'http://127.0.0.1:8090/bigbluebutton/api/getMeetings';
const REQUEST_TIMEOUT_MS = 10000;

function readSecuritySalt(): string | null {
  try {
    const content = readFileSync(BBB_WEB_PROPERTIES_PATH, 'utf8');
    const match = content.match(/^securitySalt=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch (error) {
    logger.error('Could not read bbb-web security salt', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// Returns the internal ids of the meetings bbb-web is currently running, or null
// if that cannot be determined (secret unreadable, bbb-web unreachable, or a
// non-SUCCESS response). Callers must treat null as "unknown" and not as "no
// meetings running", otherwise a transient bbb-web hiccup would look like every
// meeting has ended.
export async function getActiveMeetingIds(): Promise<Set<string> | null> {
  const salt = readSecuritySalt();
  if (!salt) {
    return null;
  }

  // getMeetings takes no parameters, so the query string is empty and the
  // checksum is sha256(method + salt).
  const checksum = createHash('sha256').update(`getMeetings${salt}`).digest('hex');

  let xml: string;
  try {
    const response = await fetch(`${GET_MEETINGS_URL}?checksum=${checksum}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      logger.error('getMeetings returned a non-OK status', { status: response.status });
      return null;
    }
    xml = await response.text();
  } catch (error) {
    logger.error('Could not reach bbb-web getMeetings', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }

  if (!xml.includes('<returncode>SUCCESS</returncode>')) {
    logger.error('getMeetings did not return SUCCESS (checksum or server issue)');
    return null;
  }

  const ids = new Set<string>();
  const pattern = /<internalMeetingID>([^<]+)<\/internalMeetingID>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}
