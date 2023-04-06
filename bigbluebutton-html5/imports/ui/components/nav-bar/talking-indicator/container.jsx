import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import { debounce } from 'radash';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;
const TALKING_INDICATOR_MUTE_INTERVAL = 500;
const TALKING_INDICATORS_MAX = 8;

const TalkingIndicatorContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;

  if (!enableTalkingIndicator) return null;

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { sidebarNavPanel } = sidebarNavigation;
  const layoutContextDispatch = layoutDispatch();

  return (
    <TalkingIndicator
      {...{
        sidebarNavPanel,
        sidebarContentPanel,
        layoutContextDispatch,
        users: users[Auth.meetingID],
        ...props,
      }}
    />
  );
};

export default withTracker(() => {
  const talkers = {};
  const meetingId = Auth.meetingID;
  const usersTalking = VoiceUsers.find({ meetingId, joined: true, spoke: true }, {
    fields: {
      callerName: 1,
      talking: 1,
      floor: 1,
      color: 1,
      startTime: 1,
      muted: 1,
      intId: 1,
    },
    sort: {
      startTime: 1,
    },
    limit: TALKING_INDICATORS_MAX + 1,
  }).fetch();

  if (usersTalking) {
    const maxNumberVoiceUsersNotification = usersTalking.length < TALKING_INDICATORS_MAX
      ? usersTalking.length
      : TALKING_INDICATORS_MAX;

    for (let i = 0; i < maxNumberVoiceUsersNotification; i += 1) {
      const {
        callerName, talking, floor, color, muted, intId,
      } = usersTalking[i];

      talkers[`${intId}`] = {
        color,
        transcribing: SpeechService.hasSpeechLocale(intId),
        floor,
        talking,
        muted,
        callerName,
      };
    }
  }

  const muteUser = debounce({ delay: TALKING_INDICATOR_MUTE_INTERVAL }, (id) => {
    const user = VoiceUsers.findOne({ meetingId, intId: id }, {
      fields: {
        muted: 1,
      },
    });
    if (user.muted) return;
    makeCall('toggleVoice', id);
  });

  return {
    talkers,
    muteUser,
    isBreakoutRoom: meetingIsBreakout(),
    moreThanMaxIndicators: usersTalking.length > TALKING_INDICATORS_MAX,
  };
})(TalkingIndicatorContainer);
