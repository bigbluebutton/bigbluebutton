import React, { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { AutoSizer } from 'react-virtualized';
import { debounce } from 'radash';
import { ListProps } from 'react-virtualized/dist/es/List';
import Styled from './styles';
import ListItem from './list-item/component';
import Skeleton from './list-item/skeleton/component';
import UserActions from './user-actions/component';
import {
  USERS_SUBSCRIPTION,
  MEETING_PERMISSIONS_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';

import { useCurrentUser } from '../../../../../core/hooks/useCurrentUser';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';

interface UserListParticipantsProps {
  users: Array<User>;
  offset: number;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void,
  meeting: Meeting;
  currentUser: Partial<User>;
  count: number;
}
interface RowRendererProps extends ListProps {
  users: Array<User>;
  currentUser: User;
  meeting: Meeting;
  offset: number;
  index: number;
}
const rowRenderer: React.FC<RowRendererProps> = ({
  index, key, style, users, currentUser, offset, meeting,
}) => {
  const userIndex = index - offset;
  const user = users && users[userIndex];
  return (
    <div key={key} style={style}>
      {user && currentUser && meeting ? (
        <UserActions
          user={user}
          currentUser={currentUser}
          lockSettings={meeting.lockSettings}
          usersPolicies={meeting.usersPolicies}
          isBreakout={meeting.isBreakout}
        >
          <ListItem user={user} lockSettings={meeting.lockSettings} />
        </UserActions>
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

const UserListParticipants: React.FC<UserListParticipantsProps> = ({
  users,
  setOffset,
  setLimit,
  offset,
  currentUser,
  meeting,
  count,
}) => {
  const validCurrentUser: Partial<User> | undefined = currentUser && currentUser.userId
    ? currentUser
    : undefined;
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const [previousUsersData, setPreviousUsersData] = React.useState(users);
  useEffect(() => {
    if (users?.length) {
      setPreviousUsersData(users);
    }
  }, [users]);
  return (
    <Styled.UserListColumn>
      <AutoSizer>
        {({ width, height }) => (
          <Styled.VirtualizedList
            rowRenderer={
              (props: RowRendererProps) => rowRenderer(
                { ...props, users: users || previousUsersData, validCurrentUser, offset, meeting }
              )
            }
            noRowRenderer={() => <div>no users</div>}
            rowCount={count}
            height={height - 1}
            width={width - 1}
            onRowsRendered={debounce({ delay: 500 }, ({ overscanStartIndex, overscanStopIndex }) => {
              setOffset(overscanStartIndex);
              const limit = (overscanStopIndex - overscanStartIndex) + 1;
              setLimit(limit < 50 ? 50 : limit);
            })}
            overscanRowCount={10}
            rowHeight={50}
            tabIndex={0}
          />
        )}
      </AutoSizer>
    </Styled.UserListColumn>
  );
};

const UserListParticipantsContainer: React.FC = () => {
  const [offset, setOffset] = React.useState(0);
  const [limit, setLimit] = React.useState(0);

  const { data: usersData } = useSubscription(USERS_SUBSCRIPTION, {
    variables: {
      offset,
      limit,
    },
  });
  const { user: users } = (usersData || {});

  const {
    data: meetingData,
  } = useSubscription(MEETING_PERMISSIONS_SUBSCRIPTION)
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];

  const {
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countData?.user_aggregate?.aggregate?.count || 0;

  const currentUser = useCurrentUser((c: Partial<User>) => ({
    isModerator: c.isModerator,
    userId: c.userId,
    presenter: c.presenter,
  } as Partial<User>));

  return (
    <>
      <UserListParticipants
        users={users}
        offset={offset}
        setOffset={setOffset}
        setLimit={setLimit}
        meeting={meeting}
        currentUser={currentUser}
        count={count}
      />
    </>
  )
};

export default UserListParticipantsContainer;
