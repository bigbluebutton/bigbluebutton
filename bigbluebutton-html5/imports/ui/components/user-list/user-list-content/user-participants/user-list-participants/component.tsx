import React, { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  InfiniteLoader
} from 'react-virtualized';
import Styled from './styles';
import ListItem from './list-item/component';
import Skeleton from './list-item/skeleton/component';
import UserActions from './user-actions/component';
import UsersTitle from './users-title/component';
import Auth from '/imports/ui/services/auth';
import {
  USERS_SUBSCRIPTION,
  MEETING_PERMISSIONS_SUBSCRIPTION,
  CURRENT_USER_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';
import  { debounce } from 'radash';

import { ListProps } from 'react-virtualized/dist/es/List';

const cache = new CellMeasurerCache({
  keyMapper: () => 1,
});

const SKELETON_COUNT = 10;

interface UserListParticipantsProps {
  users: Array<User>;
  offset: number;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void,
  meeting: Meeting;
  currentUser: User;
  count: number;
}
interface RowRendererProps extends ListProps {
  users: Array<User>;
  currentUser: User;
  meeting: Meeting;
  offset: number;
}

const rowRenderer: React.FC<RowRendererProps>  = (users, currentUser, offset, meeting, { index, key, parent, style }) => {
  const user = users && users[index - offset];
  return <div
    key={key}
    index={index}
    style={style}
  >
    {
      (user && currentUser && meeting)
        ? (
          <UserActions
            user={user}
            currentUser={currentUser}
            lockSettings={meeting.lockSettings}
            usersPolicies={meeting.usersPolicies}
            isBreakout={meeting.isBreakout}
          >
            <ListItem user={user} lockSettings={meeting.lockSettings} />
          </UserActions>
        )
        :
        <Skeleton />
    }
  </div>
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
  const [previousUsersData, setPreviousUsersData] = React.useState(users);
  useEffect(() => {
    if (users?.length){
      setPreviousUsersData(users);
    }
  }, [users]);
  return (
    <Styled.UserListColumn>
      {
        <AutoSizer>
          {({ width, height }) => {
                return (
                  <Styled.VirtualizedList
                  rowRenderer={rowRenderer.bind(null, (users || previousUsersData), currentUser, offset, meeting)}
                  noRowRenderer={() => <div>no users</div>}
                  rowCount={count}
                  height={height - 1}
                  width={width - 1}
                  onRowsRendered={debounce({delay: 500}, ({ startIndex, stopIndex, overscanStartIndex, overscanStopIndex }) => {
                    setOffset(overscanStartIndex);
                    const limit = (overscanStopIndex - overscanStartIndex) + 1;
                    setLimit(limit < 50 ? 50 : limit);
                  })}
                  overscanRowCount={10}
                  rowHeight={50}
                  tabIndex={0}
                  />
                );
              }}
        </AutoSizer>
      }
    </Styled.UserListColumn>
  );
};

const UserListParticipantsContainer: React.FC = () => {
  const [offset, setOffset] = React.useState(0);
  const [limit, setLimit] = React.useState(0);

  const { loading: usersLoading, error: usersError, data: usersData } = useSubscription(USERS_SUBSCRIPTION, {
    variables:{
      offset,
      limit,
    },
  });
  const { user: users } = (usersData || {});

  const {
    loading: meetingLoading,
    error: meetingError,
    data: meetingData,
  } = useSubscription(MEETING_PERMISSIONS_SUBSCRIPTION)
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];

  const {
    loading: currentUserLoading,
    error: currentUserError,
    data: currentUserData,
  } = useSubscription(CURRENT_USER_SUBSCRIPTION);

  const { user_current: currentUserArr } = (currentUserData || {});
  const currentUser = currentUserArr && currentUserArr[0];

  const {
    loading: countLoading,
    error: countError,
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION)
  const count = countData?.user_aggregate?.aggregate?.count || 0;
  console.log('users', users);
  return <>
    <UsersTitle count={count} />
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
};

export default UserListParticipantsContainer;
