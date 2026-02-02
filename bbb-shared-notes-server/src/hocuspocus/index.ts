import { Hocuspocus } from "@hocuspocus/server";
import { getUserInformation } from "./api";
import { meetingLockMap, connectionsMap, nextConnectionKey } from "../common/singleton";
import { ConnectionInfo } from "../common/type";
import { extractMeetingId } from "./utils";
import postgresqlDB from "./extensions/postgresql";
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
    postgresqlDB,
  ],

  onAwarenessUpdate: async (data) => {
    const { context, awareness, added, updated } = data;

    // Validate awareness state matches authenticated user
    if (context.user) {
      const authenticatedUserName = context.user.name;

      // Check both newly added and updated awareness states
      [...added, ...updated].forEach((clientId) => {
        const state = awareness.getStates().get(clientId);

        if (state?.user) {
          const clientProvidedName = state.user.name;

          // Validate that client-provided name matches authenticated name
          if (clientProvidedName !== authenticatedUserName) {
            logger.warn('User name mismatch detected - disconnecting client', {
              authenticatedName: authenticatedUserName,
              clientProvidedName: clientProvidedName,
              clientId,
              userId: context.user.id,
              intUserId: context.user.intUserId,
            });

            // 4001 (policy violation)
            if (context.user.websocket) {
              context.user.websocket.close(4001, "User identity mismatch");
            }
          }
        }
      });
    }
  },

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
      intUserId,
      userIsModerator,
    } = userInformation;

    if (meetingId !== meetingIdFromClient) {
      websocket.terminate();
      throw new Error("Meeting Id divergent");
    }

    const isMeetingLocked = meetingLockMap.get(meetingId)?.viewerReadOnly;

    const isConnectionReadOnly = isMeetingLocked && !userIsModerator;
    if (isConnectionReadOnly) {
      data.connection.readOnly = true;
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
    if (!!meetingId) {
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
