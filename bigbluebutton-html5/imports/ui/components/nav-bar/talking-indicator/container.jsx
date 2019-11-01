import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import TalkingIndicator from './component';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;

const TalkingIndicatorContainer = (props) => {
  if (!enableTalkingIndicator) return null;
  return (<TalkingIndicator {...props} />);
};

export default withTracker(() => {
  const talkers = {};
  const meetingId = Auth.meetingID;
  const usersTalking = VoiceUsers.find({ meetingId, joined: true, spoke: true }, {
    fields: {
      intId: 1,
      callerName: 1,
      talking: 1,
    },
  }).fetch();

  if (usersTalking) {
    usersTalking.forEach((user) => {
      const { intId, callerName, talking } = user;
      const talker = Users.findOne({ meetingId, userId: intId }, {
        fields: {
          color: 1,
        },
      });

      if (talker) {
        const { color } = talker;
        talkers[`${callerName}`] = {
          color,
          talking,
        };
      }
    });
  }

  return {
    talkers,
  };
})(TalkingIndicatorContainer);
