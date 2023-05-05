import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';

export default function changePin(meetingId, userId, pin) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      pin,
    },
  };

  try {
    const numberAffected = VideoStreams.update(selector, modifier, { multi: true });

    if (numberAffected) {
      Logger.info(`Updated user streams pinned userId=${userId} pinned=${pin}`);
    }
  } catch (error) {
    return Logger.error(`Error updating stream pinned status: ${error}`);
  }
  return null;
}
