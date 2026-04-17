import WebSocket from "ws";

export interface MeetingLock {
  viewerReadOnly: boolean;
  ejectedUserIds?: string[];
}

export interface ConnectionInfo {
  meetingId: string;
  userId: string;
  intUserId: string;
  moderator: boolean;
  notesEnabled: boolean;
  websocket: WebSocket;
}
