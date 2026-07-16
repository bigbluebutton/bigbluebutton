import { publish } from './publisher';
import { Logger } from '../common/logger';

const logger = new Logger('sender');

const buildEnvelope = (name:string) => {

  return {
    name,
    routing: { sender: 'bbb-shared-notes-server' },
    timestamp: Date.now(),
  };
};

const buildCore = (meetingId: string, name: string, body: object) => {

  return {
    header: {
      meetingId,
      name,
    },
    body,
  };
};

const build = (name: string, meetingId: string, body: object) => {

  return JSON.stringify({
    envelope: buildEnvelope(name),
    core: buildCore(meetingId, name, body),
  });
};

const buildMessage = (type: string, meetingId: string, body: object) => {
  let message;
  switch (type) {
    case 'sharedNotesCreated':
      message = build('BNSharedNotesCreatedEvtMsg', meetingId, body);
      break;
    case 'sharedNotesUpdated':
      message = build('BNSharedNotesUpdatedEvtMsg', meetingId, body);
      break;
    default:
  }

  return message;
};

const send = (type: string, meetingId: string, body: object) => {
  const message = buildMessage(type, meetingId, body);

  if (!message) {
    logger.warn('invalid message', { type, meetingId, body });

    return;
  }

  publish(message);
};

const sender = {
  send,
}

export { sender };
