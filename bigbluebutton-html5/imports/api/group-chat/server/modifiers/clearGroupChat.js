import GroupChat from '/imports/api/group-chat';
import Logger from '/imports/startup/server/logger';

export default async function clearGroupChat(meetingId) {
  try {
    const numberAffected = await GroupChat.removeAsync({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared GroupChat (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing GroupChat (${meetingId}). ${err}`);
  }
}
