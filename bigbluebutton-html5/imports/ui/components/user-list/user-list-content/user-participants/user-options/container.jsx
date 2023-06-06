import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import UserListService from '/imports/ui/components/user-list/service';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import logger from '/imports/startup/client/logger';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import UserOptions from './component';
import { layoutSelect } from '/imports/ui/components/layout/context';

const intlMessages = defineMessages({
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
});

const { dynamicGuestPolicy } = Meteor.settings.public.app;

const meetingMuteDisabledLog = () => logger.info({
  logCode: 'useroptions_unmute_all',
  extraInfo: { logType: 'moderator_action' },
}, 'moderator disabled meeting mute');

const UserOptionsContainer = (props) => {
  const isRTL = layoutSelect((i) => i.isRTL);
  return ( 
    <UserOptions
      {...props}
      {...{
        isRTL
      }}
    />
  )
};

export default injectIntl(withTracker((props) => {
  const {
    users,
    clearAllEmojiStatus,
    intl,
    isMeetingMuteOnStart,
  } = props;

  const toggleStatus = () => {
    clearAllEmojiStatus(users);

    notify(
      intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
    );
  };

  const getMeetingName = () => {
    const { meetingProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'meetingProp.name': 1 } });
    const { name } = meetingProp;
    return name;
  };
  return {
    toggleMuteAllUsers: () => {
      UserListService.muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      UserListService.muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
    toggleStatus,
    isMeetingMuted: isMeetingMuteOnStart,
    amIModerator: ActionsBarService.amIModerator(),
    hasBreakoutRoom: UserListService.hasBreakoutRoom(),
    isBreakoutRecordable: ActionsBarService.isBreakoutRecordable(),
    guestPolicy: WaitingUsersService.getGuestPolicy(),
    isMeteorConnected: Meteor.status().connected,
    meetingName: getMeetingName(),
    openLearningDashboardUrl: LearningDashboardService.openLearningDashboardUrl,
    dynamicGuestPolicy,
  };
})(UserOptionsContainer));
