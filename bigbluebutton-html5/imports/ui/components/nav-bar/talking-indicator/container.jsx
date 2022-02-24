import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import { debounce } from 'lodash';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;
const TALKING_INDICATOR_MUTE_INTERVAL = 500;
const TALKING_INDICATORS_MAX = 8;

const TalkingIndicatorContainer = (props) => {
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
        callerName, talking, color, muted, intId,
      } = usersTalking[i];

      talkers[`${intId}`] = {
        color,
        talking,
        muted,
        callerName,
      };
    }
  }

  const muteUser = debounce((id) => {
    const user = VoiceUsers.findOne({ meetingId, intId: id }, {
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
    moreThanMaxIndicators: usersTalking.length > TALKING_INDICATORS_MAX,
  };
})(TalkingIndicatorContainer);
