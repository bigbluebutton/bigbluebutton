import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default async function handleTranscriptionProviderError({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const selector = {
    meetingId,
    userId,
  };

  const {
    errorCode,
    errorMessage,
  } = body;

  const modifier = {
    $set: {
      transcriptionError: {
        code: errorCode,
        message: errorMessage,
      },
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.error(`Transcription error errorCode=${errorCode} errorMessage=${errorMessage} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Problem setting transcription error: ${err}`);
  }
}
