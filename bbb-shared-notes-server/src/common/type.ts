import WebSocket from "ws";

export interface ConnectionInfo {
  meetingId: string;
  intUserId: string;
  notesEnabled: boolean;
  websocket: WebSocket;
}
