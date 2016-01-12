this.addMeetingToCollection = function(meetingId, name, intendedForRecording, voiceConf, duration, callback) {
  Meteor.Meetings.upsert({
    meetingId: meetingId
  }, {
    $set: {
      meetingName: name,
      intendedForRecording: intendedForRecording,
      currentlyBeingRecorded: false,
      voiceConf: voiceConf,
      duration: duration,
      roomLockSettings: {
        disablePrivateChat: false,
        disableCam: false,
        disableMic: false,
        lockOnJoin: Meteor.config.lockOnJoin,
        lockedLayout: false,
        disablePublicChat: false,
        lockOnJoinConfigurable: false
      }
    }
  }, (_this => {
    return function(err, numChanged) {
      let funct;
      if(numChanged.insertedId != null) {
        funct = function(cbk) {
          Meteor.log.info(`__added MEETING ${meetingId}`);
          return cbk();
        };
        return funct(callback);
      } else {
        Meteor.log.error("nothing happened");
        return callback();
      }
    };
  })(this));
  return initializeCursor(meetingId);
};

this.clearMeetingsCollection = function(meetingId) {
  if(meetingId != null) {
    return Meteor.Meetings.remove({
      meetingId: meetingId
    }, Meteor.log.info(`cleared Meetings Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Meetings.remove({}, Meteor.log.info("cleared Meetings Collection (all meetings)!"));
  }
};

this.removeMeetingFromCollection = function(meetingId, callback) {
  let funct;
  if(Meteor.Meetings.findOne({
    meetingId: meetingId
  }) != null) {
    Meteor.log.info(`end of meeting ${meetingId}. Clear the meeting data from all collections`);
    clearUsersCollection(meetingId);
    clearSlidesCollection(meetingId);
    clearShapesCollection(meetingId);
    clearPresentationsCollection(meetingId);
    clearChatCollection(meetingId);
    clearMeetingsCollection(meetingId);
    clearCursorCollection(meetingId);
    return callback();
  } else {
    funct = function(localCallback) {
      Meteor.log.error(`Error! There was no such meeting ${meetingId}`);
      return localCallback();
    };
    return funct(callback);
  }
};
