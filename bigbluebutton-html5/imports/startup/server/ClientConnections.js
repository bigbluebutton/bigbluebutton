import Logger from './logger';
import userLeaving from '/imports/api/users/server/methods/userLeaving';
import { extractCredentials } from '/imports/api/common/server/helpers';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Users from '/imports/api/users';
import { check } from 'meteor/check';

const { enabled, syncInterval } = Meteor.settings.public.syncUsersWithConnectionManager;

class ClientConnections {
  constructor() {
    Logger.debug('Initializing client connections structure', { logCode: 'client_connections_init' });
    this.connections = new Map();

    setInterval(() => {
      this.print();
    }, 30000);

    if (enabled) {
      const syncConnections = Meteor.bindEnvironment(() => {
        this.syncConnectionsWithServer();
      });

      setInterval(() => {
        syncConnections();
      }, syncInterval);
    }
  }

  add(sessionId, connection) {
    Logger.info('Client connections add called', { logCode: 'client_connections_add', extraInfo: { sessionId, connection } });
    if (!sessionId || !connection) {
      Logger.error(`Error on add new client connection. sessionId=${sessionId} connection=${connection.id}`,
        { logCode: 'client_connections_add_error', extraInfo: { sessionId, connection } }
      );

      return;
    }

    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    check(meetingId, String);
    check(userId, String);
      
    if (!meetingId) {
      Logger.error(`Error on add new client connection. sessionId=${sessionId} connection=${connection.id}`,
        { logCode: 'client_connections_add_error_meeting_id_null', extraInfo: { meetingId, userId } }
      );
      return false;
    }

    if (!this.exists(meetingId)) {
      Logger.info(`Meeting not found in connections: meetingId=${meetingId}`);
      this.createMeetingConnections(meetingId);
    }

    const sessionConnections = this.connections.get(meetingId);

    if (sessionConnections.has(userId) && sessionConnections.get(userId).includes(connection.id)) {
      Logger.info(`Connection already exists for user. userId=${userId} connectionId=${connection.id}`);

      return false;
    }

    connection.onClose(Meteor.bindEnvironment(() => {
      userLeaving(meetingId, userId, connection.id);
    }));

    Logger.info(`Adding new connection for sessionId=${sessionId} connection=${connection.id}`);

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

    check(meetingId, String);
    check(userId, String);
  
    return this.connections.get(meetingId)?.get(userId);
  }

  print() {
    const mapConnectionsObj = {};
    this.connections.forEach((value, key) => {
      mapConnectionsObj[key] = {};

      value.forEach((v, k) => {
        mapConnectionsObj[key][k] = v;
      });

    });
    Logger.info('Active connections', mapConnectionsObj);
  }

  removeClientConnection(sessionId, connectionId = null) {
    Logger.info(`Removing connectionId for user. sessionId=${sessionId} connectionId=${connectionId}`);
    const { meetingId, requesterUserId: userId } = extractCredentials(sessionId);

    check(meetingId, String);
    check(userId, String);
  
    const meetingConnections = this.connections.get(meetingId);

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

  syncConnectionsWithServer() {
    Logger.info('Syncing ClientConnections with server');
    const activeConnections = Array.from(Meteor.server.sessions.keys());

    Logger.debug(`Found ${activeConnections.length} active connections in server`);

    const onlineUsers = AuthTokenValidation
      .find(
        { connectionId: { $in: activeConnections } },
        { fields: { meetingId: 1, userId: 1 } }
      )
      .fetch();

    const onlineUsersId = onlineUsers.map(({ userId }) => userId);

    const usersQuery = { userId: { $nin: onlineUsersId } };

    const userWithoutConnectionIds = Users.find(usersQuery, { fields: { meetingId: 1, userId: 1 } }).fetch();

    const removedUsersWithoutConnection = Users.remove(usersQuery);

    if (removedUsersWithoutConnection) {
      Logger.info(`Removed ${removedUsersWithoutConnection} users that are not connected`);
      Logger.info(`Clearing connections`);
      try {
        userWithoutConnectionIds
          .forEach(({ meetingId, userId }) => {
            this.removeClientConnection(`${meetingId}--${userId}`);
          });
      } catch (err) {
        Logger.error('Error on sync ClientConnections', err);
      }
    }
  }

}

if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
  Logger.info("ClientConnectionsSingleton was created")

  const ClientConnectionsSingleton = new ClientConnections();

  export default ClientConnectionsSingleton;
}
