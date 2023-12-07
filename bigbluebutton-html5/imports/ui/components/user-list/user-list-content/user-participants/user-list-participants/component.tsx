import React, { useEffect, useContext } from 'react';
import { useSubscription } from '@apollo/client';
import { AutoSizer } from 'react-virtualized';
import { debounce } from 'radash';
import { ListProps } from 'react-virtualized/dist/es/List';
import { findDOMNode } from 'react-dom';
import Styled from './styles';
import ListItem from './list-item/component';
import Skeleton from './list-item/skeleton/component';
import UserActions from './user-actions/component';
import {
  MEETING_PERMISSIONS_SUBSCRIPTION,
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import Service from '/imports/ui/components/user-list/service';
import useLoadedUserList from '/imports/ui/core/hooks/useLoadedUserList';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

interface UserListParticipantsProps {
  users: Array<User>;
  offset: number;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void,
  meeting: Meeting;
  currentUser: Partial<User>;
  count: number;
  pageId: string;
}
interface RowRendererProps extends ListProps {
  users: Array<User>;
  validCurrentUser: Partial<User>;
  meeting: Meeting;
  offset: number;
  index: number;
}
const rowRenderer: React.FC<RowRendererProps> = ({
  index, key, style, users, validCurrentUser, offset, meeting, isRTL, pageId,
}) => {
  const userIndex = index - offset;
  const user = users && users[userIndex];
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <div key={key} style={{ ...style, direction }}>
      {user && validCurrentUser && meeting ? (
        <UserActions
          user={user}
          currentUser={validCurrentUser as User}
          lockSettings={meeting.lockSettings}
          usersPolicies={meeting.usersPolicies}
          isBreakout={meeting.isBreakout}
          pageId={pageId}
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
  pageId,
}) => {
  const validCurrentUser: Partial<User> = currentUser && currentUser.userId
    ? currentUser
    : { userId: '', isModerator: false, presenter: false };

  const userListRef = React.useRef<HTMLDivElement | null>(null);
  const userItemsRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<HTMLElement>();
  const { roving } = Service;

  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const [previousUsersData, setPreviousUsersData] = React.useState(users);
  useEffect(() => {
    if (users?.length) {
      setPreviousUsersData(users);
    }
  }, [users]);

  React.useEffect(() => {
    const firstChild = (selectedUser as HTMLElement)?.firstChild;

    const fourthChild = firstChild?.firstChild?.firstChild?.firstChild;
    if (fourthChild && fourthChild instanceof HTMLElement) fourthChild.focus();
  }, [selectedUser]);

  const rove = (event: React.KeyboardEvent) => {
    // eslint-disable-next-line react/no-find-dom-node
    const usrItemsRef = findDOMNode(userItemsRef.current);
    const usrItemsRefChild = usrItemsRef?.firstChild;

    roving(event, setSelectedUser, usrItemsRefChild, selectedUser);

    event.stopPropagation();
  };

  return (
    <Styled.UserListColumn onKeyDown={rove} tabIndex={0} ref={userListRef}>
      <AutoSizer>
        {({ width, height }) => (
          <Styled.VirtualizedList
            rowRenderer={
              (props: RowRendererProps) => rowRenderer(
                {
                  ...props, users: users || previousUsersData, validCurrentUser, offset, meeting, isRTL, pageId,
                },
              )
            }
            ref={userItemsRef}
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
          />
        )}
      </AutoSizer>
    </Styled.UserListColumn>
  );
};

const UserListParticipantsContainer: React.FC = () => {
  const [offset, setOffset] = React.useState(0);
  const [limit, setLimit] = React.useState(0);

  const {
    data: meetingData,
  } = useSubscription(MEETING_PERMISSIONS_SUBSCRIPTION);
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];

  const { setUserListGraphqlVariables } = useContext(PluginsContext);
  const {
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countData?.user_aggregate?.aggregate?.count || 0;

  const {
    data: users,
  } = useLoadedUserList((u) => u) as GraphqlDataHookSubscriptionResponse<Array<User>>;

  const { data: currentUser } = useCurrentUser((c: Partial<User>) => ({
    isModerator: c.isModerator,
    userId: c.userId,
    presenter: c.presenter,
  }));

  const { data: presentationData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0] || {};
  const pageId = presentationPage?.pageId;

  useEffect(() => {
    setUserListGraphqlVariables({
      offset,
      limit,
    });
  }, [offset, limit]);

  return (
    <>
      <UserListParticipants
        users={users ?? []}
        offset={offset ?? 0}
        setOffset={setOffset}
        setLimit={setLimit}
        meeting={meeting ?? {}}
        currentUser={currentUser ?? {}}
        count={count ?? 0}
        pageId={pageId}
      />
    </>
  );
};

export default UserListParticipantsContainer;
