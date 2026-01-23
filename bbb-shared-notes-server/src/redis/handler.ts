import { Logger } from '../common/logger';
import { meetingLockMap, connectionsMap } from '../common/singleton';
import { MeetingLock } from '../common/type';
import { sender } from './sender';

const logger = new Logger('handler');

const handleMeetingLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { disableNotes: lock } = body;

  logger.info('Meeting locked changed', lock);
  const meetingLock: MeetingLock = {
    viewerReadOnly: lock,
  };
  meetingLockMap.set(meetingId, meetingLock);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && !connectionInfo.moderator) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Lock rules changed.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleUserLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { userId, locked } = body;

  logger.debug('User locked changed', userId, locked);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && connectionInfo.userId == userId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Lock rules changed.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleUserRoleChanged = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { userId, role } = body;

  logger.debug('User role changed', userId, role);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && connectionInfo.userId == userId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Role changed.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleUserLeftMeeting = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { intId: userId, eject } = body;

  logger.debug('User left meeting', userId, eject);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && connectionInfo.userId == userId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'User left meeting.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleMeetingEnded = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;

  logger.debug('Meeting ended', meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Meeting ended.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleSharedNotesCreate = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    externalId,
    model,
  } = body;

  const padId = `bn-document__${meetingId}`;

  sender.send('sharedNotesCreated', meetingId, { padId, externalId, model });
};

interface MessageHeader {
  name: string;
  meetingId: string;
  [key: string]: any;
}

interface MessageBody {
  [key: string]: any;
}

interface Message {
  core: {
    header: MessageHeader;
    body: MessageBody;
  };
}

const check = (object: any, property: string): boolean => {
  if (Object.prototype.hasOwnProperty.call(object, property)) return true;

  logger.warn('check invalid', { property, object });

  return false;
};

const validate = (message: string): { valid: false } | { valid: true; header: MessageHeader; body: MessageBody } => {

  let messageObject: any;
  try {
    messageObject = JSON.parse(message);
  } catch {
    logger.error('Error while parsing message', message);
    return {
      valid: false
    }
  }
  if (!check(messageObject, 'core')) return { valid: false };

  const { core } = messageObject;

  if (!check(core, 'header')) return { valid: false };
  if (!check(core, 'body')) return { valid: false };

  const {
    header,
    body,
  } = core;

  return {
    valid: true,
    header,
    body,
  };
};

interface PubSubHandler {
  handle: (message: string) => void;
}


const handler: PubSubHandler = {
  handle: (message) => {
    const data = validate(message);
    if (!data.valid) return null;

    const {
      header,
      body,
    } = data;

    switch (header.name) {
      case 'LockSettingsInMeetingChangedEvtMsg':
        handleMeetingLocked(header, body);
        break;
      case 'UserLockedInMeetingEvtMsg':
        handleUserLocked(header, body);
        break;
      case 'UserRoleChangedEvtMsg':
        handleUserRoleChanged(header, body);
        break;
      case 'UserLeftMeetingEvtMsg':
        handleUserLeftMeeting(header, body);
        break;
      case 'MeetingEndedEvtMsg':
        handleMeetingEnded(header, body);
        break;
      case 'BNSharedNotesCreateCmdMsg':
        handleSharedNotesCreate(header, body);
        break;
      default:
    }
  }
};

export default handler;
