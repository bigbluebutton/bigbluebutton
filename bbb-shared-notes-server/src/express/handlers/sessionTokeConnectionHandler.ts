import { sessionTokenConnectionsMap } from "../../common/singleton";
import config from "../../config";
import { WebSocket } from 'ws';

function createUniqueIdentifier(sessionToken: string, padId: string) {
  return `${sessionToken}-${padId}`;
}

function handleSessionTokenConnections(wsConnection: WebSocket, sessionToken: string, meetingId: string) {

  const { maxConnectionsPerSessionToken } = config.expressServer;

  const uniqueId = createUniqueIdentifier(sessionToken, meetingId);

  const currentNumberOfConnectionsForSessionToken = sessionTokenConnectionsMap.get(uniqueId) || 0;

  if (
    currentNumberOfConnectionsForSessionToken >= maxConnectionsPerSessionToken
  ) {
    wsConnection.close(4008, "Too many active connections for this token");
    return;
  }

  const currentNumberOfConnections = currentNumberOfConnectionsForSessionToken || 0;
  sessionTokenConnectionsMap.set(uniqueId, currentNumberOfConnections + 1);

  wsConnection.addEventListener('close', () => {
    const currentNumberOfConnections = sessionTokenConnectionsMap.get(uniqueId) || 0;
    const newNumberOfConnection = Math.max(currentNumberOfConnections - 1, 0);
    sessionTokenConnectionsMap.set(uniqueId, newNumberOfConnection);
  });
}

export { handleSessionTokenConnections };
