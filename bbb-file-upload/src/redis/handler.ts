import { Logger } from '../common/logger';
import { isValidMeetingId } from '../upload/storage';
import { scheduleCleanup } from './cleanup';

const logger = new Logger('redis handler');

interface Message {
  core?: {
    header?: { name?: string };
    body?: { meetingId?: string };
  };
}

function parse(message: string): Message | null {
  try {
    return JSON.parse(message) as Message;
  } catch {
    logger.error('Failed to parse redis message');
    return null;
  }
}

const handler = {
  handle: (message: string): void => {
    const parsed = parse(message);
    const name = parsed?.core?.header?.name;
    if (name !== 'MeetingEndedEvtMsg') {
      return;
    }

    const meetingId = parsed?.core?.body?.meetingId;
    if (typeof meetingId !== 'string' || !isValidMeetingId(meetingId)) {
      logger.warn('MeetingEndedEvtMsg with invalid meetingId', { meetingId });
      return;
    }

    logger.info('Meeting ended', { meetingId });
    scheduleCleanup(meetingId);
  },
};

export default handler;
