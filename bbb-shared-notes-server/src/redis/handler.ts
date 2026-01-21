import { Logger } from '../common/logger';
import { meetingLockMap, websocketMap } from '../common/singleton';
import { MeetingLock } from '../common/type';
import { fetchViewersByMeetingId } from '../database/model';
import { sender } from './sender';

const logger = new Logger('handler');


const events = {
  MEETING_LOCKED: 'LockSettingsInMeetingChangedEvtMsg',
};

const commands = {
  BN_SHARED_NOTES_CREATE: 'BNSharedNotesCreateCmdMsg',
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

  const viewers = await fetchViewersByMeetingId(meetingId);
  viewers.forEach((v) => {
    const viewerWsConnection = websocketMap.get(v.sessionToken);
    viewerWsConnection?.close(1008, 'Lock rules changed.');
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
      case events.MEETING_LOCKED:
        handleMeetingLocked(header, body);
        break;
      case commands.BN_SHARED_NOTES_CREATE:
        handleSharedNotesCreate(header, body);
        break;
      default:
    }
  }
};

export default handler;
