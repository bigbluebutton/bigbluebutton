import { Logger } from '../common/logger';
import { meetingLockMap, connectionsMap } from '../common/singleton';
import { MeetingLock } from '../common/type';
import { sender } from './sender';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import { uploadPresentation } from './service/uploadPresentation';
import { documentNamePrefix } from '../hocuspocus/utils';
import { pushInitialContent } from './service/pushInitialContent';

const logger = new Logger('redis handler');

const handleMeetingCreated = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { props: { meetingProp: { intId: meetingId }, lockSettingsProps: { disableNotes } } } = body;

  const meetingLock: MeetingLock = {
    viewerReadOnly: disableNotes,
  };

  logger.info(`Meeting created with disableNotes: ${disableNotes}`, meetingId);
  meetingLockMap.set(meetingId, meetingLock);
};

const handleMeetingLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { disableNotes } = body;

  logger.info(`Meeting lockSettings changed with disableNotes: ${disableNotes}`, meetingId);
  const meetingLock: MeetingLock = {
    viewerReadOnly: disableNotes,
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

  logger.debug(`User changed with locked: ${locked}`, userId, meetingId);

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

  logger.debug(`User role changed: ${role}`, userId, meetingId);

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

  logger.debug(`User left meeting, eject: ${eject}`, userId, meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && connectionInfo.userId == userId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'User left meeting.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleMeetingEnded = async (header: MessageHeader, _body: MessageBody): Promise<void> => {
  const { meetingId } = header;

  logger.debug('Meeting ended', meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Meeting ended.');
      connectionsMap.delete(connectionKey);
    }
  });

  if (meetingLockMap.has(meetingId)) {
    meetingLockMap.delete(meetingId);
  }


};

const handleSharedNotesCreate = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const {
    externalId,
    model,
    initialContentJson,
  } = body;

  const padId = `${documentNamePrefix}${meetingId}`;

  const validateInitialContentNotEmpty = (): boolean => {
    return initialContentJson !== undefined
      && initialContentJson !== null
      && typeof initialContentJson === "object"
      && Object.keys(initialContentJson).length > 0
  }
  if (validateInitialContentNotEmpty()) {
    logger.debug(
      'Received initial content', {
        initialContent: initialContentJson,
        padId,
        meetingId
      }
    );
    try {
      const statusReturn = await pushInitialContent(padId, initialContentJson);
      if (statusReturn.error) {
        logger.error('Error found, see details', {
          logCode: statusReturn.statusCode,
          extraInfo: {
            ...statusReturn,
            padId,
            meetingId,
          } 
        });
      } else {
        logger.debug('Initial content updated', {
          logCode: statusReturn.statusCode,
          extraInfo: {
            padId,
            meetingId,
          } 
        });
      }
    } catch (error) {
      logger.error('Error initializing document', { error, padId });
    }
  }

  sender.send('sharedNotesCreated', meetingId, { padId, externalId, model });
};

const handleBlockNoteExport = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const {
    jobId,
    presId,
    serverSideFilename,
    parentMeetingId,
    presUploadToken,
  } = body;

  logger.info('Received BlockNote export request', {
    jobId,
    presId,
    meetingId,
    parentMeetingId,
  });

  try {
    const { tmpDirectory } = config.shared;
    const temporarySavingDir = path.join(tmpDirectory, jobId);

    if (!fs.existsSync(temporarySavingDir)) {
      fs.mkdirSync(temporarySavingDir, { recursive: true });
    }

    const exportJob = {
      jobId,
      filename: serverSideFilename,
      serverSideFilename,
      presId,
      parentMeetingId: parentMeetingId || meetingId,
      presUploadToken,
    };
    fs.writeFileSync(path.join(temporarySavingDir, 'job'), JSON.stringify(exportJob));

    // Export the document
    const documentName = presId;
    const notesFormat = 'pdf';
    const underscoredFilename = serverSideFilename.replace(/\s/g, '_');
    const sanitizedFilename = underscoredFilename.replace(/[^a-z0-9_\-\.]/gi, '_');
    const outputFilename = `${sanitizedFilename}.${notesFormat}`;
    const filePath = path.join(temporarySavingDir, outputFilename);

    const apiEndpoint = `http://127.0.0.1:8787/api/documents/${documentName}/export/${notesFormat}`;

    const response = await fetch(apiEndpoint, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Export failed with status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Upload the file to BBB
    await uploadPresentation(filePath, exportJob.presUploadToken, exportJob.parentMeetingId, jobId);

    logger.info('Export completed successfully', {
      jobId,
      presId,
      filePath,
    });

    // Delete temporary files
    try {
      fs.rmSync(temporarySavingDir, { recursive: true });
      logger.info('Cleaned up temporary files', { dropbox: temporarySavingDir });
    } catch (cleanupError) {
      logger.error('Failed to cleanup temporary files', {
        error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        temporarySavingDir,
      });
    }
  } catch (error) {
    logger.error('Failed to export BlockNote document', {
      error: error instanceof Error ? error.message : String(error),
      jobId,
      presId,
    });
  }
};

interface MessageHeader {
  name: string;
  meetingId: string;
  [key: string]: any;
}

interface MessageBody {
  [key: string]: any;
}

interface _Message {
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
      case 'MeetingCreatedEvtMsg':
        handleMeetingCreated(header, body);
        break;
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
      case 'ExportBNSharedNotesEvtMsg':
        handleBlockNoteExport(header, body);
        break;
      default:
    }
  }
};

export default handler;
