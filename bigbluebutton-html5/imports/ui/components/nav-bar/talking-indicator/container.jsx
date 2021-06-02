import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import { debounce } from 'lodash';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Service from './service';
import { NLayoutContext } from '../../layout/context/context';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;
const TALKING_INDICATOR_MUTE_INTERVAL = 500;

const TalkingIndicatorContainer = (props) => {
  if (!enableTalkingIndicator) return null;
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { input } = newLayoutContextState;
  const { sidebarContent, sidebarNavigation } = input;
  const { sidebarNavPanel } = sidebarNavigation;
  const { sidebarContentPanel } = sidebarContent;
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;
  return (
    <TalkingIndicator
      {...{
        sidebarNavPanel,
        sidebarNavigationIsOpen,
        sidebarContentPanel,
        sidebarContentIsOpen,
        newLayoutContextDispatch,
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

  const muteUser = debounce((id) => {
    const user = VoiceUsers.findOne({ meetingId, voiceUserId: id }, {
      fields: {
        muted: 1,
      },
    });
    if (user.muted) return;
    makeCall('toggleVoice', id);
  }, TALKING_INDICATOR_MUTE_INTERVAL, { leading: true, trailing: false });

  return {
    talkers,
    muteUser,
    isBreakoutRoom: meetingIsBreakout(),
  };
})(TalkingIndicatorContainer);
