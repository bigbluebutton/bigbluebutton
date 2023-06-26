import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import { getUserNamesLink } from '/imports/ui/components/user-list/service';
import Settings from '/imports/ui/services/settings';
import { makeCall } from '/imports/ui/services/api';
import { notify } from '/imports/ui/services/notification';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import { defineMessages } from 'react-intl';

const intlMessages = defineMessages({
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
  savedNamesListTitle: {
    id: 'app.userList.userOptions.savedNames.title',
    description: '',
  },
  sortedFirstNameHeading: {
    id: 'app.userList.userOptions.sortedFirstName.heading',
    description: '',
  },
  sortedLastNameHeading: {
    id: 'app.userList.userOptions.sortedLastName.heading',
    description: '',
  },
});

const meetingMuteDisabledLog = () =>
  logger.info(
    {
      logCode: 'useroptions_unmute_all',
      extraInfo: { logType: 'moderator_action' },
    },
    'moderator disabled meeting mute'
  );

export const toggleMuteAllUsers = (isMeetingMuteOnStart: boolean) => {
  UserListService.muteAllUsers(Auth.userID);
  if (isMeetingMuteOnStart) {
    return meetingMuteDisabledLog();
  }
  return logger.info(
    {
      logCode: 'useroptions_mute_all',
      extraInfo: { logType: 'moderator_action' },
    },
    'moderator enabled meeting mute, all users muted'
  );
};
export const toggleMuteAllUsersExceptPresenter = (isMeetingMuteOnStart: boolean) => {
  UserListService.muteAllExceptPresenter(Auth.userID);
  if (isMeetingMuteOnStart) {
    return meetingMuteDisabledLog();
  }
  return logger.info(
    {
      logCode: 'useroptions_mute_all_except_presenter',
      extraInfo: { logType: 'moderator_action' },
    },
    'moderator enabled meeting mute, all users muted except presenter'
  );
};

export const toggleStatus = (intl) => {
  makeCall('clearAllUsersEmoji');

  notify(intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status');
};

export const onSaveUserNames = (intl, meetingName) => {
  const lang = Settings.application.locale;
  const date = new Date();

  const dateString = lang ? date.toLocaleDateString(lang) : date.toLocaleDateString();
  const timeString = lang ? date.toLocaleTimeString(lang) : date.toLocaleTimeString();

  getUserNamesLink(
    intl.formatMessage(intlMessages.savedNamesListTitle, {
      0: meetingName,
      1: `${dateString}:${timeString}`,
    }),
    intl.formatMessage(intlMessages.sortedFirstNameHeading),
    intl.formatMessage(intlMessages.sortedLastNameHeading)
  ).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
};

export const openLearningDashboardUrl = (lang) =>
  LearningDashboardService.openLearningDashboardUrl(lang);
