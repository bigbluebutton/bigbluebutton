import React, { useEffect } from 'react';

import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { UserListUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/user-list/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
} from './queries';
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
  const selectedUserRef = React.useRef<HTMLElement | null>(null);

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
  const rove = (ev: KeyboardEvent) => {
    if (ev.code === 'Enter' || ev.code === 'Space' || (ev.code === 'ArrowDown' && selectedUserRef.current !== document.activeElement)) {
      if (selectedUserRef.current && (selectedUserRef.current === document.activeElement)) {
        selectedUserRef.current.click();
      } else {
        const userItem = document.getElementById('user-index-0');
        selectedUserRef.current = userItem;

        if (selectedUserRef.current) {
          selectedUserRef.current.focus();
        }
      }
      return;
    }

    if (ev.code === 'ArrowDown' || ev.code === 'ArrowUp') {
      const sum = ev.code === 'ArrowDown' ? 1 : -1;
      const el = selectedUserRef.current;
      if (el) {
        const nextId = Number.parseInt(el.id.split('-')[2], 10) + sum;
        const nextEl = document.getElementById(`user-index-${nextId}`);
        if (nextEl) {
          selectedUserRef.current = nextEl;
          nextEl.focus();
        }
      }
    }
  };

  const amountOfPages = Math.ceil(count / 50);
  return (
    (
      <Styled.UserListColumn
      // @ts-ignore
        onKeyDown={rove}
        tabIndex={0}
      >
        <Styled.VirtualizedList ref={userListRef}>
          {
            Array.from({ length: amountOfPages }).map((_, i) => {
              const isLastItem = amountOfPages === (i + 1);
              const restOfUsers = count % 50;
              const key = i;
              return i === 0
                ? (
                  <UserListParticipantsPageContainer
                    key={key}
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
                      key={key}
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
    )
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
