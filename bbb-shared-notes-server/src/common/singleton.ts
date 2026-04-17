import { MeetingLock, ConnectionInfo } from "./type";


const connectionsMap = new Map<string, ConnectionInfo>();
const sessionTokenConnectionsMap = new Map<string, number>();
const meetingLockMap = new Map<string, MeetingLock>();
let connectionCounter = 0;

const nextConnectionKey = (): string => {
  connectionCounter += 1;
  return `BN-CONN-${String(connectionCounter).padStart(4, "0")}`;
};

export {
  connectionsMap,
  sessionTokenConnectionsMap,
  meetingLockMap,
  nextConnectionKey,
};
