// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------

this.addMeetingToCollection = function (meetingId, name, intendedForRecording, voiceConf, duration, callback) {
  //check if the meeting is already in the collection

  Meteor.Meetings.upsert({
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

this.clearMeetingsCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Meetings.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Meetings Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Meetings.remove({}, Meteor.log.info('cleared Meetings Collection (all meetings)!'));
  }
};

//clean up upon a meeting's end
this.removeMeetingFromCollection = function (meetingId, callback) {
  let funct;
  if (Meteor.Meetings.findOne({
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
    return callback();
  } else {
    funct = function (localCallback) {
      Meteor.log.error(`Error! There was no such meeting ${meetingId}`);
      return localCallback();
    };

    return funct(callback);
  }
};

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------
