import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import { check } from 'meteor/check';

export default function floorChanged(meetingId, userId, floor, lastFloorTime) {
  check(meetingId, String);
  check(userId, String);
  check(floor, Boolean);
  check(lastFloorTime, String);

  const selector = {
    meetingId,
    userId,
  }

  const modifier = {
    $set: {
      floor,
      lastFloorTime: floor ? lastFloorTime : undefined,
    },
  };

  try {
    const numberAffected = VideoStreams.update(selector, modifier, { multi: true });

    if (numberAffected) {
      Logger.info(`Updated user streams floor times userId=${userId} floor=${floor} lastFloorTime=${lastFloorTime}`);
    }
  } catch (error) {
    return Logger.error(`Error updating stream floor status: ${error}`);
  }
}
