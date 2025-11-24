import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION, UsersCountSubscriptionResponse } from '/imports/ui/core/graphql/queries/users';
import UserTitleOptionsContainer from './user-options-dropdown/component';
import Styled from './styles';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION, UsersWithAudioCountSubscriptionResponse } from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { User } from '/imports/ui/Types/user';

interface UserTitleProps {
  count: number;
  countWithAudio: number;
  hideUserList?: boolean;
}

const messages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  lockedUsersTitle: {
    id: 'app.userList.lockedUsersTitle',
    description: 'Title for the locked users',
  },
});

const UserTitle: React.FC<UserTitleProps> = ({
  count,
  countWithAudio,
  hideUserList,
}) => {
  const intl = useIntl();
  const userListLabel = hideUserList ? messages.lockedUsersTitle : messages.usersTitle;

  return (
    <Styled.Container>
      <Styled.SmallTitle>
        <span
          data-test-users-count={count}
          data-test-users-with-audio-count={countWithAudio}
        >
          {intl.formatMessage(
            userListLabel,
            {
              userCount: count.toLocaleString('en-US', { notation: 'standard' }),
            },
          )}
        </span>
      </Styled.SmallTitle>
      <UserTitleOptionsContainer />
    </Styled.Container>
  );
};

const UserTitleContainer: React.FC = () => {
  const getCountData = () => {
    const { data: countData } = useDeduplicatedSubscription<UsersCountSubscriptionResponse>(
      USER_AGGREGATE_COUNT_SUBSCRIPTION,
    );
    const count = countData?.user_aggregate?.aggregate?.count || 0;
    return count;
  };

  const {
    data: audioUsersCountData,
  } = useDeduplicatedSubscription<UsersWithAudioCountSubscriptionResponse>(
    USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION,
  );

  const countWithAudio = audioUsersCountData?.user_aggregate?.aggregate?.count || 0;

  const { data: currentUser } = useCurrentUser((u: Partial<User>) => ({
    locked: u?.locked ?? false,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));

  const hideUserList = currentUser?.locked && currentMeeting?.lockSettings?.hideUserList;

  return (
    <UserTitle
      count={getCountData() as number}
      countWithAudio={countWithAudio}
      hideUserList={hideUserList}
    />
  );
};

export default UserTitleContainer;
