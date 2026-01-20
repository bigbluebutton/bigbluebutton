import WebSocket from "ws";
import { MeetingLock } from "./type";

// { sessionToken => Websocket }
const websocketMap = new Map<string, WebSocket>();

// { internalMeetingId => Websocket }
const meetingLockMap = new Map<string, MeetingLock>();

export {
  websocketMap,
  meetingLockMap,
};
