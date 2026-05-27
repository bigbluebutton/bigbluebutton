import WebSocket from "ws";

export interface ConnectionInfo {
  meetingId: string;
  userId: string;
  intUserId: string;
  notesEnabled: boolean;
  websocket: WebSocket;
}
