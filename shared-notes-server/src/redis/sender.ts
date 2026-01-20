import { publish } from './publisher';
import { Logger } from '../common/logger';

const logger = new Logger('sender');

const buildEnvelope = (name:string) => {

  return {
    name,
    routing: { sender: 'bbb-shared-notes-server' },
    timestamp: (new Date()).getTime(),
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
    case 'groupCreated':
      message = build('PadGroupCreatedEvtMsg', meetingId, body);
      break;
    case 'padCreated':
      message = build('PadCreatedEvtMsg', meetingId, body);
      break;
    case 'padUpdated':
      message = build('PadUpdatedSysMsg', meetingId, body);
      break;
    case 'padContent':
      message = build('PadContentSysMsg', meetingId, body);
      break;
    case 'padPatch':
      message = build('PadPatchSysMsg', meetingId, body);
      break;
    case 'sessionCreated':
      message = build('PadSessionCreatedEvtMsg', meetingId, body);
      break;
    case 'sessionDeleted':
      message = build('PadSessionDeletedSysMsg', meetingId, body);
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
