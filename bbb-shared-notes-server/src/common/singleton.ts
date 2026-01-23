import { MeetingLock, ConnectionInfo } from "./type";


const connectionsMap = new Map<string, ConnectionInfo>();
const meetingLockMap = new Map<string, MeetingLock>();
let connectionCounter = 0;

const nextConnectionKey = (): string => {
  connectionCounter += 1;
  return `BC${String(connectionCounter).padStart(4, "0")}`;
};

export {
  connectionsMap,
  meetingLockMap,
  nextConnectionKey,
};
