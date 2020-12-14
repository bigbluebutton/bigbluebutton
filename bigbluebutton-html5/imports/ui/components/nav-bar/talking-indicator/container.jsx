import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import { debounce } from 'lodash';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Service from './service';

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
      callerName: 1,
      talking: 1,
      color: 1,
      startTime: 1,
      voiceUserId: 1,
      muted: 1,
      intId: 1,
    },
  }).fetch().sort(Service.sortVoiceUsers);

  if (usersTalking) {
    for (let i = 0; i < usersTalking.length; i += 1) {
      const {
        callerName, talking, color, voiceUserId, muted, intId,
      } = usersTalking[i];

      talkers[`${intId}`] = {
        color,
        talking,
        voiceUserId,
        muted,
        callerName,
      };
    }
  }

  const muteUser = (id) => {
    const user = VoiceUsers.findOne({ meetingId, voiceUserId: id }, {
      fields: {
        muted: 1,
      },
    });
    if (user.muted) return;
    makeCall('toggleVoice', id);
  };

  return {
    talkers,
    muteUser: id => debounce(muteUser(id), 500, { leading: true, trailing: false }),
    openPanel: Session.get('openPanel'),
    isBreakoutRoom: meetingIsBreakout(),
  };
})(TalkingIndicatorContainer);
