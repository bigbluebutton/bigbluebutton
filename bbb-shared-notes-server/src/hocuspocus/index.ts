import { Hocuspocus } from "@hocuspocus/server";
import { meetingLockMap, connectionsMap, nextConnectionKey } from "../common/singleton";
import { ConnectionInfo } from "../common/type";
import { extractMeetingId } from "./utils";
import postgresqlDB from "./extensions/postgresql";
import { Logger } from "../common/logger";
import { sender } from "../redis/sender";

const logger = new Logger('hocuspocus');
// Configure Hocuspocus
const hocuspocus = new Hocuspocus({
  name: "bigbluebutton-hocuspocus",
  extensions: [
    postgresqlDB,
  ],

  onAuthenticate: async (data) => {
    const { documentName, context } = data;

    const { userInformation } = context;

    logger.info('=== Authentication Data ===')
    logger.info('Document Name:', documentName)

    const role = "READ-WRITE";

    const meetingIdFromClient = extractMeetingId(documentName);

    const { sessionToken, websocket } = context;

    if (!websocket) {
      return null;
    }

    if (userInformation == null) {
      websocket.terminate();
      return null;
    }

    const {
      userName,
      userId,
      meetingId,
      intUserId,
      userIsModerator,
    } = userInformation;

    if (meetingId !== meetingIdFromClient) {
      const message = "Meeting Id divergent"
      websocket.close(3000, message);
      return null;
    }

    const isMeetingLocked = meetingLockMap.get(meetingId)?.viewerReadOnly;

    const isConnectionReadOnly = isMeetingLocked && !userIsModerator;
    if (isConnectionReadOnly) {
      data.connectionConfig.readOnly = true;
    }

    const newConnection: ConnectionInfo = {
      meetingId,
      userId,
      intUserId,
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
        intUserId,
        id: userId,
        role: role,
        name: userName,
        meetingId,
      }
    };
  },

  onChange: async (data) => {
    const { documentName } = data;
    let meetingId: string | undefined;
    let intUserId: string | undefined;
    if (data.context.user) {
      intUserId = data.context.user.intUserId;
      meetingId = data.context.user.meetingId;
    } else {
      // Change initiated from server-side
      intUserId = "SYSTEM";
      if (documentName.includes("__")) meetingId = extractMeetingId(documentName);
    }
    if (meetingId) {
      sender.send('sharedNotesUpdated', meetingId, { intUserId, documentName });
    } else {
      logger.warn("Malformed document name, ignoring change", {
        documentName,
        intUserId,
      });
    }
  }
});

export default hocuspocus;
