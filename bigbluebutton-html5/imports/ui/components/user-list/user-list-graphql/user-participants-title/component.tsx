import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import UserTitleOptionsContainer from './user-options-dropdown/component';
import Styled from './styles';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION } from './queries';

interface UserTitleProps {
  count: number;
  countWithAudio: number;
}

const messages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
});

const UserTitle: React.FC<UserTitleProps> = ({
  count,
  countWithAudio,
}) => {
  const intl = useIntl();
  return (
    <Styled.Container>
      <Styled.SmallTitle>
        {intl.formatMessage(messages.usersTitle)}
        <span
          data-test-users-count={count}
          data-test-users-with-audio-count={countWithAudio}
        >
          {` (${count.toLocaleString('en-US', { notation: 'standard' })})`}
        </span>
      </Styled.SmallTitle>
      <UserTitleOptionsContainer />
    </Styled.Container>
  );
};

const UserTitleContainer: React.FC = () => {
  type CountData = {
    user_aggregate: {
      aggregate: {
        count: number;
      };
    };
  };
  const [countDataState, setCountDataState] = useState<CountData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: countData } = await useDeduplicatedSubscription(
        USER_AGGREGATE_COUNT_SUBSCRIPTION,
      );
      setCountDataState(countData || []);
    };

    fetchData();
  }, []);
  const {
    data: audioUsersCountData,
  } = useDeduplicatedSubscription(USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countDataState?.user_aggregate?.aggregate?.count || 0;
  const countWithAudio = audioUsersCountData?.user_aggregate?.aggregate?.count || 0;

  return (
    <UserTitle
      count={count}
      countWithAudio={countWithAudio}
    />
  );
};

export default UserTitleContainer;
