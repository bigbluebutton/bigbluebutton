import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import Service from './service';
import { uniqueId } from '/imports/utils/string-utils';
import { Meteor } from 'meteor/meteor';
import { useSubscription } from '@apollo/client';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import VoiceUsers from '/imports/api/voice-users';
import {
  USER_IS_TALKING_SUBSCRIPTION,
} from '../queries';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

interface TalkingIndicatorProps {
  talkingUsers: Array<User>;
  isTalking: boolean;
  Intl: object;
  error: string;
}
const NAVBAR_CONFIG = Meteor.settings.public.app;
const TALKIN_INDICATOR_ENABLED = NAVBAR_CONFIG.enableTalkingIndicator;

const TalkingIndicator:
React.FC<TalkingIndicatorProps> = ({
  talkingUsers,
  isTalking,
  intl,
  eror,
}) => {
  console.log({talkingUsers});
  if (!isTalking || talkingUsers) return null;

  const { userCounter } = talkingUsers;

}







const TalkingIndicatorContainer: React.FC = ({ userId, IsTalkingIn, error }) => {
  const intl = useIntl(); 

  const {
    data: talkingUsersData,
  } = useSubscription(USER_IS_TALKING_SUBSCRIPTION, {
    variables: {
      userId,
      chatId: IsTalkingIn,
    }
  });

  const talkingUsers = talkingUsersData?.user_talking_public || [];

  const talkingUsersArray = talkingUsers.map(user => user.user);

  return <TalkingIndicator
  talkingUsers={typingUsersArray}
  indicatorEnabled={USER_IS_TALKING_SUBSCRIPTION}
  intl={intl}
  error={error}
/>
};
export default TalkingIndicatorContainer;

