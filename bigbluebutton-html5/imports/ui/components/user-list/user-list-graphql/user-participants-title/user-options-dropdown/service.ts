/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getUserNamesLink } from '/imports/ui/components/user-list/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import { defineMessages, IntlShape } from 'react-intl';
import { User } from '/imports/ui/Types/user';

const intlMessages = defineMessages({
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

export const onSaveUserNames = (intl: IntlShape, meetingName: string, users: [User]) => {
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - temporary while settings are still in .js
  const lang = Settings.application.locale;
  const date = new Date();

  const dateString = lang ? date.toLocaleDateString(lang) : date.toLocaleDateString();
  const timeString = lang ? date.toLocaleTimeString(lang) : date.toLocaleTimeString();

  getUserNamesLink(
    intl.formatMessage(intlMessages.savedNamesListTitle, {
      meetingName,
      dateAndTime: `${dateString}:${timeString}`,
    }),
    intl.formatMessage(intlMessages.sortedFirstNameHeading),
    intl.formatMessage(intlMessages.sortedLastNameHeading),
    users,
    meetingName,
  ).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
};

export const openLearningDashboardUrl = (
  lang: string,
  token?: string,
) => LearningDashboardService.openLearningDashboardUrl(lang, token);
