import Breakouts from '/imports/api/breakouts';
import { Meteor } from 'meteor/meteor';

Meteor.publish('breakouts', credentials =>
  Breakouts.find({
    $or: [
      { parentMeetingId: credentials.meetingId },
      { breakoutMeetingId: credentials.meetingId },
    ],
  })
);
