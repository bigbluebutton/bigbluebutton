import React, { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { AutoSizer } from 'react-virtualized';
import { debounce } from 'radash';
import { ListProps } from 'react-virtualized/dist/es/List';
import { findDOMNode } from 'react-dom';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { UserListUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/user-list/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
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
import Service from '/imports/ui/components/user-list/service';
import { setLocalUserList, useLoadedUserList } from '/imports/ui/core/hooks/useLoadedUserList';
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
  openUserAction: string | null;
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
}
const rowRenderer: React.FC<RowRendererProps> = ({
  index, key, style, users, validCurrentUser, offset, meeting, isRTL, pageId, openUserAction, setOpenUserAction,
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
          open={user.userId === openUserAction}
          setOpenUserAction={setOpenUserAction}
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
  const [openUserAction, setOpenUserAction] = React.useState<string | null>(null);
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

  // --- Plugin related code ---
  useEffect(() => {
    const updateUiDataHookCurrentVolumeForPlugin = () => {
      window.dispatchEvent(new CustomEvent(PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN, {
        detail: {
          value: true,
        } as UserListUiDataPayloads[PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN],
      }));
    };

    window.dispatchEvent(new CustomEvent(PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN, {
      detail: {
        value: true,
      } as UserListUiDataPayloads[PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN],
    }));
    window.addEventListener(
      `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED}`,
      updateUiDataHookCurrentVolumeForPlugin,
    );
    return () => {
      window.removeEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE}`,
        updateUiDataHookCurrentVolumeForPlugin,
      );
      window.dispatchEvent(new CustomEvent(PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN, {
        detail: {
          value: false,
        } as UserListUiDataPayloads[PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN],
      }));
    };
  }, []);
  // --- End of plugin related code ---

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
                  ...props,
                  users: users || previousUsersData,
                  validCurrentUser,
                  offset,
                  meeting,
                  isRTL,
                  pageId,
                  openUserAction,
                  setOpenUserAction,
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
  const [limit, setLimit] = React.useState(50);

  const {
    data: meetingData,
  } = useSubscription(MEETING_PERMISSIONS_SUBSCRIPTION);
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];
  const {
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countData?.user_aggregate?.aggregate?.count || 0;

  useEffect(() => () => {
    setLocalUserList([]);
  }, []);

  const {
    data: usersData,
  } = useLoadedUserList({ offset, limit }, (u) => u) as GraphqlDataHookSubscriptionResponse<Array<User>>;
  const users = usersData ?? [];

  const { data: currentUser } = useCurrentUser((c: Partial<User>) => ({
    isModerator: c.isModerator,
    userId: c.userId,
    presenter: c.presenter,
  }));

  const { data: presentationData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0] || {};
  const pageId = presentationPage?.pageId;

  setLocalUserList(users);
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
