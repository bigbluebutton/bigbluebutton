import React from 'react';
import { useSubscription } from '@apollo/client';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
} from 'react-virtualized';
import Styled from './styles';
import ListItem from './list-item/component';
import Skeleton from './list-item/skeleton/component';
import UserActions from './user-actions/component';
import Auth from '/imports/ui/services/auth';
import {
  USERS_SUBSCRIPTION,
  MEETING_PERMISSIONS_SUBSCRIPTION,
  CURRENT_USER_SUBSCRIPTION
} from './queries';
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';

import { ListProps } from 'react-virtualized/dist/es/List';

const cache = new CellMeasurerCache({
  fixedWidth: true,
  keyMapper: () => 1,
});

const SKELETON_COUNT = 10;
interface RowRendererProps extends ListProps {
  users: Array<User>;
  currentUser: User;
  meeting: Meeting;
}

const rowRenderer: React.FC<RowRendererProps>  = (users: Array<User>, currentUser: User, meeting: Meeting, { index, key, parent, }) => {
  const user = users && users[index];
  return (
    <CellMeasurer
      key={key}
      cache={cache}
      columnIndex={0}
      parent={parent}
      rowIndex={index}
    >
      
      {
        (user && currentUser && meeting)
        ? (
        <>
          <UserActions 
            user={user}
            currentUser={currentUser}
            lockSettings={meeting.lockSettings}
            usersPolicies={meeting.usersPolicies}
            isBreakout={meeting.isBreakout}
          >
            <ListItem user={user} />
        </UserActions>
        </>
        ) : <Skeleton />
      }
    </CellMeasurer>
  );
};  


const UserListParticipants: React.FC = () => {
  const { loading: usersLoading, error: usersError, data: usersData } = useSubscription(USERS_SUBSCRIPTION);
  const { user: users } = (usersData || {});
  console.log('users', users, usersLoading, usersError);
  const {
    loading: meetingLoading,
    error: meetingError,
    data: meetingData,
  } = useSubscription(MEETING_PERMISSIONS_SUBSCRIPTION)
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];
  console.log('meeting', meetingData, meetingLoading, meetingError);
  const {
    loading: currentUserLoading,
    error: currentUserError,
    data: currentUserData,
  } = useSubscription(CURRENT_USER_SUBSCRIPTION, {
    variables:{
      userId: Auth.userID,
    }
  });
  const { user: currentUserArr } = (currentUserData || {});
  const currentUser = currentUserArr && currentUserArr[0];
  console.log('currentUser', currentUserData, currentUserLoading, currentUserError);
  return (
    <Styled.UserListColumn>
      {
        <AutoSizer>
          {({ width, height }) => {
            return <Styled.VirtualizedList
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer.bind(null, users, currentUser, meeting)}
                noRowRenderer={() => <div>no users</div>}
                rowCount={(!meetingLoading 
                  && !currentUserLoading 
                  && users?.length)
                  || SKELETON_COUNT}
                height={height - 1}
                width={width - 1}
                overscanRowCount={30}
                deferredMeasurementCache={cache}
                tabIndex={-1}
            />;
          }}
        </AutoSizer>
      }
    </Styled.UserListColumn>
  );
};
export default UserListParticipants;