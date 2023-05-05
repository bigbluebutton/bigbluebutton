import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import Logger from '/imports/startup/server/logger';

const clear = (meetingId, name, collection) => {
  if (meetingId) {
    try {
      if (collection.remove({ meetingId })) {
        Logger.info(`Cleared ${name} (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing ${name} (${meetingId}). ${err}`);
    }
  } else {
    try {
      if (collection.remove({})) {
        Logger.info(`Cleared ${name} (all)`);
      }
    } catch (err) {
      Logger.error(`Error on clearing ${name} (all). ${err}`);
    }
  }
};

export default function clearPads(meetingId) {
  clear(meetingId, 'Pads', Pads);
  clear(meetingId, 'PadsSessions', PadsSessions);
  clear(meetingId, 'PadsUpdates', PadsUpdates);
}
