import { clearUsersCollection } from '/server/collection_methods/users';
import { clearChatCollection } from '/server/collection_methods/chat';
import { clearShapesCollection } from '/server/collection_methods/shapes';
import { clearSlidesCollection } from '/server/collection_methods/slides';
import { clearPresentationsCollection } from '/server/collection_methods/presentations';
import { clearPollCollection } from '/server/collection_methods/poll';
import { clearCursorCollection, initializeCursor } from '/server/collection_methods/cursor';
import { Meetings } from '/collections/collections';

export function addMeetingToCollection(meetingId, name, intendedForRecording, voiceConf, duration, callback) {
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
        lockOnJoin: Meteor.config.lockOnJoin,
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
          Meteor.log.info(`__added MEETING ${meetingId}`);
          return cbk();
        };

        return funct(callback);
      } else {
        Meteor.log.error('nothing happened');
        return callback();
      }
    };
  })(this));

  // initialize the cursor in the meeting
  return initializeCursor(meetingId);
};

export function clearMeetingsCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Meetings.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Meetings Collection (meetingId: ${meetingId}!`));
  } else {
    return Meetings.remove({}, Meteor.log.info('cleared Meetings Collection (all meetings)!'));
  }
};

//clean up upon a meeting's end
export function removeMeetingFromCollection(meetingId, callback) {
  let funct;
  if (Meetings.findOne({
    meetingId: meetingId,
  }) != null) {
    Meteor.log.info(`end of meeting ${meetingId}. Clear the meeting data from all collections`);

    // delete all users in the meeting
    clearUsersCollection(meetingId);

    // delete all slides in the meeting
    clearSlidesCollection(meetingId);

    // delete all shapes in the meeting
    clearShapesCollection(meetingId);

    // delete all presentations in the meeting
    clearPresentationsCollection(meetingId);

    // delete all chat messages in the meeting
    clearChatCollection(meetingId);

    // delete the meeting
    clearMeetingsCollection(meetingId);

    // delete the cursor for the meeting
    clearCursorCollection(meetingId);
    
    //delete the polls for the meeting
    clearPollCollection(meetingId);
    return callback();
  } else {
    funct = function (localCallback) {
      Meteor.log.error(`Error! There was no such meeting ${meetingId}`);
      return localCallback();
    };

    return funct(callback);
  }
};
