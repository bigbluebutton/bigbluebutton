import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';
import {clientConfig} from '/config';

export function addMeetingToCollection(meetingId, name, intendedForRecording,
                                       voiceConf, duration, callback) {
  //check if the meeting is already in the collection

  Meetings.upsert({
    meetingId: meetingId,
  }, {
    $set: {
      meetingName: name,
      intendedForRecording: intendedForRecording,
      currentlyBeingRecorded: false,
      voiceConf: voiceConf,
      duration: duration,
      roomLockSettings: {
        // by default the lock settings will be disabled on meeting create
        disablePrivateChat: false,
        disableCam: false,
        disableMic: false,
        lockOnJoin: clientConfig.lockOnJoin,
        lockedLayout: false,
        disablePublicChat: false,
        lockOnJoinConfigurable: false // TODO
      },
    },
  }, (_this => {
    return function (err, numChanged) {
      let funct;
      if (numChanged.insertedId != null) {
        funct = function (cbk) {
          logger.info(`__added MEETING ${meetingId}`);
          return cbk();
        };

        return funct(callback);
      } else {
        logger.error('nothing happened');
        return callback();
      }
    };
  })(this));

  // initialize the cursor in the meeting
  return initializeCursor(meetingId);
};
