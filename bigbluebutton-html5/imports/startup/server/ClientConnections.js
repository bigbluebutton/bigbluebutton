import Logger from './logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

class ClientConnections {
  constructor() {
    this.connections = new Map();

    setInterval(() => {
      this.print();
    }, 20000);
  }

  add(sessionId, connection) {
    Logger.info(`Adding new connection for sessionId=${sessionId} connection=${connection}`);

    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    if (!this.exists(meetingId)) {
      Logger.info(`Meeting not found in connections: meetingId=${meetingId}`);
      this.createMeetingConnections(meetingId);
    }

    const sessionConnections = this.connections.get(meetingId);

    if (sessionConnections.has(userId) && sessionConnections.get(userId).includes(connection.id)) {
      Logger.info(`Connection already exists for user. userId=${userId} connectionId=${connection.id}`);

      return false;
    }

    if (!sessionConnections.has(userId)) {
      Logger.info(`Creating connections poll for ${userId}`);

      sessionConnections.set(userId, []);
      return sessionConnections.get(userId).push(connection.id);
    } else {
      return sessionConnections.get(userId).push(connection.id);
    }
  }

  createMeetingConnections(meetingId) {
    Logger.info(`Creating meeting in connections. meetingId=${meetingId}`);

    if (!this.exists(meetingId))
      return this.connections.set(meetingId, new Map());
  }

  exists(meetingId) {
    return this.connections.has(meetingId);
  }

  getConnectionsForClient(sessionId) {
    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    return this.connections.get(meetingId)?.get(userId);
  }

  print() {
    console.group('Active connections');
    this.connections.forEach((value, key) => {
      console.group(key);

      value.forEach((v, k) => {
        console.log(`${k}: [ ${v} ]`);
      });

      console.groupEnd();
    })
    console.groupEnd();
  }

  removeClientConnection(sessionId, connectionId = null) {
    Logger.info(`Removing connectionId for user. sessionId=${sessionId} connectionId=${connectionId}`);
    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    const meetingConnections = this.connections.get(meetingId)

    if (meetingConnections?.has(userId)) {
      const filteredConnections = meetingConnections.get(userId).filter(c => c !== connectionId);

      return connectionId && filteredConnections.length ? meetingConnections.set(userId, filteredConnections) : meetingConnections.delete(userId);
    }

    return false;
  }

  removeMeeting(meetingId) {
    Logger.debug(`Removing connections for meeting=${meetingId}`);
    return this.connections.delete(meetingId);
  }
}

const ClientConnectionsSingleton = new ClientConnections();

export default ClientConnectionsSingleton;
