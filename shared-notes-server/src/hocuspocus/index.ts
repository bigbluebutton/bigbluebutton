import { Hocuspocus } from "@hocuspocus/server";
import { getUserInformation } from "./api";
import { meetingLockMap, websocketMap } from "../common/singleton";
import * as Y from "yjs";
import { extractMeetingId } from "./utils";
import sqliteDB from "./extensions/sqlite";

// Configure Hocuspocus
const hocuspocus = new Hocuspocus({
  extensions: [
    sqliteDB,
  ],

  onAwarenessUpdate: async ({ awareness, added, updated, removed }) => {
    console.log('=== Awareness Update (Cursor Positions) ===');
  },

  // TODO: Validate message before it's processed 
  beforeHandleMessage: async ({
    context
  }) => {},

  onAuthenticate: async (data) => {
    const { documentName, requestHeaders, context } = data;

    console.log('=== Authentication Data ===');
    console.log('Document Name:', documentName);

    const role = "READ-WRITE";

    const meetingIdFromClient = extractMeetingId(documentName);

    const { sessionToken, websocket } = context;

    if (!websocket) {
      throw new Error("Unauthorized");
    }

    const securityInformation = {
      cookie: requestHeaders.cookie || null,
      sessionToken,
    }

    const userInformation = await getUserInformation(securityInformation);

    const isUserAuthenticated = userInformation !== null;
    if (!isUserAuthenticated) {
      websocketMap.get(sessionToken)?.terminate();
      throw new Error("Unauthorized");
    }

    const {
      userName,
      userId,
      meetingId,
      userIsModerator,
    } = userInformation;

    if (meetingId !== meetingIdFromClient) {
      websocketMap.get(sessionToken)?.terminate();
      throw new Error("Meeting Id divergent");
    }

    const isMeetingLocked = meetingLockMap.get(meetingId)?.viewerReadOnly;

    console.log('teste aqui no authenticate. ---> ', {
      sessionToken, meetingLockMap, userIsModerator, meetingId});

    const isConnectionReadOnly = isMeetingLocked && !userIsModerator;
    if (isConnectionReadOnly) {
      data.connection.readOnly = true;
    }
    websocketMap.set(sessionToken, websocket);

    return {
      user: {
        websocket,
        sessionToken,
        id: userId,
        role: role,
        name: userName,
        meetingId,
      }
    };
  },

  // onDisconnect: async ({ context }) => {
  //   const {
  //     sessionToken,
  //   } = context;
  //   websocketMap.delete(sessionToken);
  //   console.log('=== Disconnected ===', sessionToken);
  // },

  onChange: async (data) => {
    console.log('=== Document Changed ===', data.context.user.sessionToken);
  },
});

export default hocuspocus;
