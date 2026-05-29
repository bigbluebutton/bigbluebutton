import { Logger } from '../common/logger';
import { connectionsMap } from '../common/singleton';
import { sender } from './sender';
import config from '../config';
import fs from 'node:fs';
import path from 'node:path';
import { uploadPresentation } from './service/uploadPresentation';
import { documentNamePrefix } from '../hocuspocus/utils';
import { pushInitialContent } from './service/pushInitialContent';
import { markDocumentEnded } from '../hocuspocus/extensions/postgresql';

const logger = new Logger('redis handler');

const handleMeetingCreated = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { props: { meetingProp: { intId: meetingId }, lockSettingsProps: { disableNotes } } } = body;

  logger.info(`Meeting created with disableNotes: ${disableNotes}`, meetingId);
};

const handleMeetingLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { disableNotes } = body;

  logger.info(`Meeting lockSettings changed with disableNotes: ${disableNotes}`, meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    const userHasNotesDisabled = !connectionInfo.notesEnabled;
    if (connectionInfo.meetingId == meetingId && disableNotes != userHasNotesDisabled) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Meeting lockSettings changed.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleUserLocked = async (header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = header;
  const { userId, locked } = body;

  logger.debug(`User changed with locked: ${locked}`, userId, meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId && connectionInfo.intUserId == userId) {
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
    if (connectionInfo.meetingId == meetingId && connectionInfo.intUserId == userId) {
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
    if (connectionInfo.meetingId == meetingId && connectionInfo.intUserId == userId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'User left meeting.');
      connectionsMap.delete(connectionKey);
    }
  });
};

const handleMeetingEnded = async (_header: MessageHeader, body: MessageBody): Promise<void> => {
  const { meetingId } = body;

  logger.info('Meeting ended', meetingId);

  connectionsMap.forEach((connectionInfo, connectionKey) => {
    if (connectionInfo.meetingId == meetingId) {
      logger.debug('Removing connection', connectionKey, connectionInfo);
      connectionInfo.websocket?.close(1008, 'Meeting ended.');
      connectionsMap.delete(connectionKey);
    }
  });

  const padId = `${documentNamePrefix}${meetingId}`;
  await markDocumentEnded(padId);
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

  const isValidJobId = (value: unknown): value is string => {
    return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);
  };

  if (!isValidJobId(jobId)) {
    logger.error('Invalid jobId received, refusing export', {
      jobId,
      meetingId,
    });
    return;
  }

  logger.info('Received BlockNote export request', {
    jobId,
    presId,
    meetingId,
    parentMeetingId,
  });

  const { workDir, timeout } = config.commandExecution;
  const temporarySavingDir = path.join(workDir, jobId);

  try {
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
    const sanitizedFilename = underscoredFilename.replace(/[^a-z0-9_.-]/gi, '_');
    const outputFilename = `${sanitizedFilename}.${notesFormat}`;
    const filePath = path.join(temporarySavingDir, outputFilename);

    const apiEndpoint = `http://127.0.0.1:8787/api/documents/${documentName}/export/${notesFormat}`;

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), timeout * 1000);
    let response: Response;
    try {
      response = await fetch(apiEndpoint, { method: 'GET', signal: controller.signal });
    } finally {
      clearTimeout(fetchTimeout);
    }

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

  } catch (error) {
    logger.error('Failed to export BlockNote document', {
      error: error instanceof Error ? error.message : String(error),
      jobId,
      presId,
    });
  } finally {
    // Delete temporary files
    if (fs.existsSync(temporarySavingDir)) {
      try {
        fs.rmSync(temporarySavingDir, { recursive: true, force: true });
        logger.info('Cleaned up temporary files', { dropbox: temporarySavingDir });
      } catch (cleanupError) {
        logger.error('Failed to cleanup temporary files', {
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          temporarySavingDir,
        });
      }
    }
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

  if (core === null || typeof core !== 'object') return { valid: false };
  if (!check(core, 'header')) return { valid: false };
  if (!check(core, 'body')) return { valid: false };

  const {
    header,
    body,
  } = core;

  if (header === null || typeof header !== 'object') return { valid: false };
  if (body === null || typeof body !== 'object') return { valid: false };

  return {
    valid: true,
    header,
    body,
  };
};

interface PubSubHandler {
  handle: (message: string) => Promise<void>;
}


const handler: PubSubHandler = {
  handle: async (message) => {
    const data = validate(message);
    if (!data.valid) return;

    const {
      header,
      body,
    } = data;

    try {
      switch (header.name) {
        case 'MeetingCreatedEvtMsg':
          await handleMeetingCreated(header, body);
          break;
        case 'LockSettingsInMeetingChangedEvtMsg':
          await handleMeetingLocked(header, body);
          break;
        case 'UserLockedInMeetingEvtMsg':
          await handleUserLocked(header, body);
          break;
        case 'UserRoleChangedEvtMsg':
          await handleUserRoleChanged(header, body);
          break;
        case 'UserLeftMeetingEvtMsg':
          await handleUserLeftMeeting(header, body);
          break;
        case 'MeetingEndedEvtMsg':
          await handleMeetingEnded(header, body);
          break;
        case 'BNSharedNotesCreateCmdMsg':
          await handleSharedNotesCreate(header, body);
          break;
        case 'ExportBNSharedNotesEvtMsg':
          await handleBlockNoteExport(header, body);
          break;
        default:
      }
    } catch (error) {
      logger.error('Unhandled error in message handler', { error, messageName: header.name });
    }
  }
};

export default handler;
