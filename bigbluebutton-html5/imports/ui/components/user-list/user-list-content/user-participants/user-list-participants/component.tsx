import React, { useEffect } from 'react';

import { findDOMNode } from 'react-dom';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { UserListUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/user-list/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
import Service from '/imports/ui/components/user-list/service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import UserListParticipantsPageContainer from './page/component';
import IntersectionWatcher from './intersection-watcher/intersectionWatcher';
import { setLocalUserList } from '/imports/ui/core/hooks/useLoadedUserList';

interface UserListParticipantsProps {
  count: number;
}

const UserListParticipants: React.FC<UserListParticipantsProps> = ({
  count,
}) => {
  const [visibleUsers, setVisibleUsers] = React.useState<{
    [key: number]: User[];
  }>({});
  const userListRef = React.useRef<HTMLDivElement | null>(null);
  const userItemsRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<HTMLElement>();
  const { roving } = Service;

  React.useEffect(() => {
    const firstChild = (selectedUser as HTMLElement)?.firstChild;

    const fourthChild = firstChild?.firstChild?.firstChild?.firstChild;
    if (fourthChild && fourthChild instanceof HTMLElement) fourthChild.focus();
  }, [selectedUser]);

  useEffect(() => {
    const keys = Object.keys(visibleUsers);
    if (keys.length > 0) {
      // eslint-disable-next-line
      const visibleUserArr = keys.sort().reduce((acc, key) => {
        return [
          ...acc,
          // @ts-ignore
          ...visibleUsers[key],
        ];
      }, [] as User[]);
      // eslint-disable-next-line
      setLocalUserList(visibleUserArr);
    }
  }, [visibleUsers]);

  // --- Plugin related code ---
  useEffect(() => {
    const updateUiDataHookUserListForPlugin = () => {
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
      `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN}`,
      updateUiDataHookUserListForPlugin,
    );
    return () => {
      window.removeEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.UserListUiDataNames.USER_LIST_IS_OPEN}`,
        updateUiDataHookUserListForPlugin,
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
  const amountOfPages = Math.ceil(count / 50);
  return (
    <Styled.UserListColumn onKeyDown={rove} tabIndex={0}>
      <Styled.VirtualizedList ref={userListRef}>
        {
          Array.from({ length: amountOfPages }).map((_, i) => {
            const isLastItem = amountOfPages === (i + 1);
            const restOfUsers = count % 50;
            return i === 0
              ? (
                <UserListParticipantsPageContainer
                  index={i}
                  isLastItem={isLastItem}
                  restOfUsers={isLastItem ? restOfUsers : 50}
                  setVisibleUsers={setVisibleUsers}
                />
              )
              : (
                <IntersectionWatcher
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  ParentRef={userListRef}
                  isLastItem={isLastItem}
                  restOfUsers={isLastItem ? restOfUsers : 50}
                >
                  <UserListParticipantsPageContainer
                    index={i}
                    isLastItem={isLastItem}
                    restOfUsers={isLastItem ? restOfUsers : 50}
                    setVisibleUsers={setVisibleUsers}
                  />
                </IntersectionWatcher>
              );
          })
        }
      </Styled.VirtualizedList>
    </Styled.UserListColumn>
  );
};

const UserListParticipantsContainer: React.FC = () => {
  const {
    data: countData,
  } = useDeduplicatedSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countData?.user_aggregate?.aggregate?.count || 0;

  return (
    <>
      <UserListParticipants
        count={count ?? 0}
      />
    </>
  );
};

export default UserListParticipantsContainer;
