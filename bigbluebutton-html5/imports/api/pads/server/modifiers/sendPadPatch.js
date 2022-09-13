import { EventEmitter } from 'node:events';

export const PatchEmitter = new EventEmitter();

export default function sendPadPatch({ meetingId, externalId, start, end, text, timestamp }) {
  PatchEmitter.emit('patch', { meetingId, externalId, start, end, text, timestamp });
};
