import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

const clear = async (meetingId, name, collection) => {
  if (meetingId) {
    try {
      const result = await collection.removeAsync({ meetingId });
      if (result) {
        Logger.info(`Cleared ${name} (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing ${name} (${meetingId}). ${err}`);
    }
  } else {
    try {
      const result = await collection.removeAsync({});
      if (result) {
        Logger.info(`Cleared ${name} (all)`);
      }
    } catch (err) {
      Logger.error(`Error on clearing ${name} (all). ${err}`);
    }
  }
};

export default async function clearPads(meetingId) {
  await clear(meetingId, 'Pads', Pads);
  await clear(meetingId, 'PadsSessions', PadsSessions);
  await clear(meetingId, 'PadsUpdates', PadsUpdates);
}
