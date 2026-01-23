import { Hocuspocus } from "@hocuspocus/server";
import { getUserInformation } from "./api";
import { meetingLockMap, websocketMap } from "../common/singleton";
import * as Y from "yjs";
import { extractMeetingId } from "./utils";
import sqliteDB from "./extensions/sqlite";
import { Logger } from "../common/logger";
import { sender } from "../redis/sender";

const logger = new Logger('hocuspocus');
// Configure Hocuspocus
const hocuspocus = new Hocuspocus({
  extensions: [
    sqliteDB,
  ],

  onAuthenticate: async (data) => {
    const { documentName, requestHeaders, context } = data;

    logger.info('=== Authentication Data ===')
    logger.info('Document Name:', documentName)

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
  onChange: async (data) => {
    const { documentName } = data;
    const { id: userId, meetingId } = data.context.user;

    sender.send('sharedNotesUpdated', meetingId, { userId, documentName });
  }
});

export default hocuspocus;
