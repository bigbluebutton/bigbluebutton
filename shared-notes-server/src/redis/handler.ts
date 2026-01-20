import { Logger } from '../common/logger';
import { meetingLockMap, websocketMap } from '../common/singleton';
import { MeetingLock } from '../common/type';
import { fetchViewersByMeetingId } from '../database/model';
import { sender } from './sender';

const logger = new Logger('handler');


const events = {
  MEETING_CREATED: 'MeetingCreatedEvtMsg',
  MEETING_DELETED: 'MeetingEndingEvtMsg',
  MEETING_LOCKED: 'LockSettingsInMeetingChangedEvtMsg',
  USER_CREATED: 'UserJoinedMeetingEvtMsg',
  USER_DELETED: 'UserLeftMeetingEvtMsg',
  USER_LOCKED: 'UserLockedInMeetingEvtMsg',
  USER_UPDATED: 'UserRoleChangedEvtMsg',
};

const commands = {
  GROUP_CREATE: 'PadCreateGroupCmdMsg',
  PAD_CREATE: 'PadCreateCmdMsg',
  PAD_UPDATE: 'PadUpdateCmdMsg',
  SESSION_CREATE: 'PadCreateSessionCmdMsg',
};

const systems = {
  PAD_SETTINGS_LOADED :'PadLoadSettingsSysMsg',
  PAD_SHUTDOWN: 'PadShutdownSysMsg',
  PAD_CONFIGURED: 'PadConfigureSysMsg',
  PAD_SERVER_CREATED: 'PadCreateServerSysMsg',
  PAD_SERVER_CLOSED: 'PadCloseServerSysMsg',
  PAD_ACCESS_CHECKED: 'PadAccessCheckSysMsg',
  PAD_CREATED: 'PadCreateSysMsg',
  PAD_LOADED: 'PadLoadSysMsg',
  PAD_UPDATED: 'PadUpdateSysMsg',
  PAD_COPIED: 'PadCopySysMsg',
  PAD_REMOVED: 'PadRemoveSysMsg',
  PAD_USER_LEFT: 'PadUserLeaveSysMsg',
};

const handleMeetingCreated = (header: MessageHeader, body: MessageBody): void => {
  const { intId: meetingId } = body.props.meetingProp;
  // --
};

const handleMeetingDeleted = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  // --
};

const handleMeetingLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { disableNotes: lock } = body;

  logger.info('Meeting locked changed', lock);
  // Update Lock
  const meetingLock: MeetingLock = {
    viewerReadOnly: lock,
  };
  meetingLockMap.set(meetingId, meetingLock);

  console.log('Teste aqui dentro do meeting locked ---> ', websocketMap);
  const viewers = await fetchViewersByMeetingId(meetingId);
  viewers.forEach((v) => {
    const viewerWsConnection = websocketMap.get(v.sessionToken);
    viewerWsConnection?.close(1008, 'Lock rules changed.');
  });
};

const handleUserCreated = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  // --
};

const handleUserDeleted = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const { intId: userId } = body;
  // --
};

const handleUserLocked = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    locked: lock,
    userId,
  } = body;
  // --
};

const handleUserUpdated = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    role,
    userId,
  } = body;
  // --
};

const handleGroupCreate = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    externalId,
    model,
  } = body;
  // --
};

const handlePadCreate = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    groupId,
    name,
  } = body;

  // TODO: Create pad and group;
  // const padId = `bn-document__${meetingId}`;

  // sender.send('padCreated', meetingId, { groupId, padId, name });
  // --
};

const handlePadUpdate = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    groupId,
    name,
    text,
  } = body;
  // --
};

const handleSessionCreate = (header: MessageHeader, body: MessageBody): void => {
  const { meetingId } = header;
  const {
    groupId,
    userId,
  } = body;
  // --
};

const handlePadSettingsLoaded = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadShutdown = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadConfigured = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadServerCreated = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadServerClosed = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadAccessChecked = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadCreated = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadLoaded = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadUpdated = (header: MessageHeader, body: MessageBody): void => {
  const {
    author: authorId,
    revs: rev,
    changeset,
    pad,
  } = body;

  // Fallback to padId if needed
  const padId = pad.id || pad.padId;

  // Clear Etherpad's "\n" insertion
  const text = pad.atext.text.endsWith('\n') ? pad.atext.text.slice(0, -1) : pad.atext.text;

  // --
};

const handlePadCopied = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadRemoved = (header: MessageHeader, body: MessageBody): void => {
};

const handlePadUserLeft = (header: MessageHeader, body: MessageBody): void => {
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
      case events.MEETING_CREATED:
        handleMeetingCreated(header, body);
        break;
      case events.MEETING_DELETED:
        handleMeetingDeleted(header, body);
        break;
      case events.MEETING_LOCKED:
        handleMeetingLocked(header, body);
        break;
      case events.USER_CREATED:
        handleUserCreated(header, body);
        break;
      case events.USER_DELETED:
        handleUserDeleted(header, body);
        break;
      case events.USER_UPDATED:
        handleUserUpdated(header, body);
        break;
      case events.USER_LOCKED:
        handleUserLocked(header, body);
        break;
      case commands.GROUP_CREATE:
        handleGroupCreate(header, body);
        break;
      case commands.PAD_CREATE:
        handlePadCreate(header, body);
        break;
      case commands.PAD_UPDATE:
        handlePadUpdate(header, body);
        break;
      case commands.SESSION_CREATE:
        handleSessionCreate(header, body);
        break;
      case systems.PAD_SETTINGS_LOADED:
        handlePadSettingsLoaded(header, body);
        break;
      case systems.PAD_SHUTDOWN:
        handlePadShutdown(header, body);
        break;
      case systems.PAD_CONFIGURED:
        handlePadConfigured(header, body);
        break;
      case systems.PAD_SERVER_CREATED:
        handlePadServerCreated(header, body);
        break;
      case systems.PAD_SERVER_CLOSED:
        handlePadServerClosed(header, body);
        break;
      case systems.PAD_ACCESS_CHECKED:
        handlePadAccessChecked(header, body);
        break;
      case systems.PAD_CREATED:
        handlePadCreated(header, body);
        break;
      case systems.PAD_LOADED:
        handlePadLoaded(header, body);
        break;
      case systems.PAD_UPDATED:
        handlePadUpdated(header, body);
        break;
      case systems.PAD_COPIED:
        handlePadCopied(header, body);
        break;
      case systems.PAD_REMOVED:
        handlePadRemoved(header, body);
        break;
      case systems.PAD_USER_LEFT:
        handlePadUserLeft(header, body);
        break;
      default:
    }
  }
};

export default handler;
