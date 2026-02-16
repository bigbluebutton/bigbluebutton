import { sessionTokenConnectionsMap } from "../../common/singleton";
import config from "../../config";
import { WebSocket } from 'ws';

function handleSessionTokenConnectionLimiter(wsConnection: WebSocket, sessionToken: string) {

  const { maxConnectionsPerSessionToken } = config.expressServer;

  const currentNumberOfConnectionsForSessionToken = sessionTokenConnectionsMap.get(sessionToken) || 0;

  if (
    currentNumberOfConnectionsForSessionToken >= maxConnectionsPerSessionToken
  ) {
    wsConnection.close(4008, "Too many active connections for this token");
    return;
  }

  const currentNumberOfConnections = currentNumberOfConnectionsForSessionToken || 0;
  sessionTokenConnectionsMap.set(sessionToken, currentNumberOfConnections + 1);

  wsConnection.addEventListener('close', () => {
    const currentNumberOfConnections = sessionTokenConnectionsMap.get(sessionToken) || 0;
    const newNumberOfConnection = Math.max(currentNumberOfConnections - 1, 0);
    if (newNumberOfConnection === 0) {
      sessionTokenConnectionsMap.delete(sessionToken);
    } else sessionTokenConnectionsMap.set(sessionToken, newNumberOfConnection);
  });
}

export { handleSessionTokenConnectionLimiter };
