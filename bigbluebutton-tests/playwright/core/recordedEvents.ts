import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';

// One event as the server records it for the meeting's events.xml: flat string fields
// (eventName, module, timestamp, meetingId, plus the event's own).
export type RecordedEvent = Record<string, string>;

// Reads every event of the meeting in one call: the list holds the ids, each event a hash.
// bbb-web writes the meeting's info key for a meeting that keeps its events; without it
// this Redis knows nothing of the meeting. cjson encodes an empty table as an object, so
// an empty list comes back as {}.
const READ_EVENTS_SCRIPT = `
if redis.call('EXISTS', 'meeting:info:' .. ARGV[1]) == 0 then return 'null' end
local events = {}
for _, id in ipairs(redis.call('LRANGE', 'meeting:' .. ARGV[1] .. ':recordings', 0, -1)) do
  local fields = redis.call('HGETALL', 'recording:' .. ARGV[1] .. ':' .. id)
  local event = {}
  for i = 1, #fields, 2 do event[fields[i]] = fields[i + 1] end
  table.insert(events, event)
end
return cjson.encode(events)
`;

/**
 * The meeting's recorded events, read from the server's Redis with redis-cli, by the
 * internal meeting id. Only works where the tests run on the BBB host itself, as in CI.
 * Undefined when this Redis holds nothing of the meeting: no redis-cli, another server's
 * Redis, a meeting created without `record` or `meetingKeepEvents`, or events already
 * archived to events.xml (readArchivedEvents), which removes them from Redis.
 */
export const readRecordedEvents = (meetingId: string): RecordedEvent[] | undefined => {
  try {
    const output = execFileSync('redis-cli', ['--raw', 'EVAL', READ_EVENTS_SCRIPT, '0', meetingId], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const events = JSON.parse(output) as RecordedEvent[] | Record<string, never> | null;
    if (events === null) return undefined;
    return Array.isArray(events) ? events : [];
  } catch {
    return undefined;
  }
};

const RAW_ARCHIVE_DIR = '/var/bigbluebutton/recording/raw';

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

const unescapeXml = (text: string) => text.replace(/&(amp|lt|gt|quot|apos);/g, (_, name: string) => XML_ENTITIES[name]);

/**
 * The meeting's events as archived to events.xml after it ended, with each event's
 * fields as written there; undefined while there is no archive to read.
 */
export const readArchivedEvents = (meetingId: string): RecordedEvent[] | undefined => {
  let xml: string;
  try {
    xml = readFileSync(`${RAW_ARCHIVE_DIR}/${meetingId}/events.xml`, 'utf8');
  } catch {
    return undefined;
  }
  return [...xml.matchAll(/<event ([^>]*)>([\s\S]*?)<\/event>/g)].map(([, attributes, body]) => {
    const event: RecordedEvent = {};
    [...attributes.matchAll(/(\w+)="([^"]*)"/g)].forEach(([, name, value]) => {
      event[name === 'eventname' ? 'eventName' : name] = unescapeXml(value);
    });
    [...body.matchAll(/<(\w+)>([\s\S]*?)<\/\1>/g)].forEach(([, name, value]) => {
      event[name] = unescapeXml(value);
    });
    return event;
  });
};
