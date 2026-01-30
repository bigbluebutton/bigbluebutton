import { Hocuspocus } from "@hocuspocus/server";
import { getUserInformation } from "./api";
import { meetingLockMap, connectionsMap, nextConnectionKey } from "../common/singleton";
import { ConnectionInfo } from "../common/type";
import { extractMeetingId } from "./utils";
import sqliteDB from "./extensions/sqlite";
import { Logger } from "../common/logger";
import { sender } from "../redis/sender";
import { config } from "../config";

const logger = new Logger('hocuspocus');
// Configure Hocuspocus
const hocuspocus = new Hocuspocus({
  name: "bigbluebutton-hocuspocus",
  address: config.hocuspocusServer.host,
  port: config.hocuspocusServer.port,
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
      websocket.terminate();
      throw new Error("Unauthorized");
    }

    const {
      userName,
      userId,
      meetingId,
      userIsModerator,
    } = userInformation;

    if (meetingId !== meetingIdFromClient) {
      websocket.terminate();
      throw new Error("Meeting Id divergent");
    }

    // TODO validate user name
    // we should not allow the user to inform a name different than expected

    const isMeetingLocked = meetingLockMap.get(meetingId)?.viewerReadOnly;

    const isConnectionReadOnly = isMeetingLocked && !userIsModerator;
    if (isConnectionReadOnly) {
      data.connection.readOnly = true;
    }

    const newConnection: ConnectionInfo = {
      meetingId: userInformation.meetingId,
      userId: userInformation.userId,
      moderator: userInformation.userIsModerator,
      notesEnabled: userInformation.userHasNotesEnabled,
      websocket: websocket,
    }

    const connectionKey = nextConnectionKey();
    connectionsMap.set(connectionKey, newConnection);

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
    let userId: string;
    let meetingId: string | undefined;
    if (data.context.user) {
      userId = data.context.user.id;
      meetingId = data.context.user.meetingId;
    } else {
      // Change initiated from server-side
      userId = "SYSTEM";
      if (documentName.includes("__")) meetingId = extractMeetingId(documentName);
    }
    if (!!meetingId) {
      sender.send('sharedNotesUpdated', meetingId, { userId, documentName });
    } else {
      logger.warn("Malformed document name, ignoring change", {
        documentName,
        userId,
      });
    }
  }
});

export default hocuspocus;
