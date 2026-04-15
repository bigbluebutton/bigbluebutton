import React, { useEffect, useMemo, memo } from 'react';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/hooks/consts';
import { UserListUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/domain/user-list/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import { getUsersPerUserListPage, makeUserSearchWhere } from '/imports/ui/components/user-list/service';
import UserSearchContainer from '/imports/ui/components/user-list/user-search/container';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Styled from './styles';
import {
  USER_AGGREGATE_COUNT_SUBSCRIPTION,
  UsersCountSubscriptionResponse,
} from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import UserListParticipantsPageContainer from './page/component';
import IntersectionWatcher from './intersection-watcher/intersectionWatcher';
import { setLocalUserList } from '/imports/ui/core/hooks/useLoadedUserList';
import roveBuilder from '/imports/ui/core/utils/keyboardRove';

interface UserListParticipantsProps {
  count: number;
  parentRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  isModerator: boolean;
  onSearchChange: (query: string) => void;
  isQueryLoading: boolean;
}

const UserListParticipants: React.FC<UserListParticipantsProps> = ({
  count,
  parentRef,
  searchQuery,
  isModerator,
  onSearchChange,
  isQueryLoading,
}) => {
  const [visibleUsers, setVisibleUsers] = React.useState<{
    [key: number]: User[];
  }>({});
  const selectedUserRef = React.useRef<HTMLElement | null>(null);
  const usersPerUserListPage = getUsersPerUserListPage();

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

  const rove = useMemo(() => roveBuilder(selectedUserRef, 'user-index'), []);

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

  const renderedPaginatedUsers = useMemo(() => {
    // Render one page even if there are no users to show the empty state message if needed
    const amountOfPages = count === 0 ? 1 : Math.ceil(count / usersPerUserListPage);

    return Array.from({ length: amountOfPages }).map((_, i) => {
      const isLastItem = amountOfPages === (i + 1);
      const restOfUsers = count - (i * usersPerUserListPage);
      const key = i;
      return i === 0
        ? (
          <UserListParticipantsPageContainer
            key={key}
            index={i}
            isLastItem={isLastItem}
            restOfUsers={isLastItem ? restOfUsers : usersPerUserListPage}
            setVisibleUsers={setVisibleUsers}
            searchQuery={searchQuery}
          />
        )
        : (
          <IntersectionWatcher
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            ParentRef={parentRef}
            isLastItem={isLastItem}
            restOfUsers={isLastItem ? restOfUsers : usersPerUserListPage}
          >
            <UserListParticipantsPageContainer
              key={key}
              index={i}
              isLastItem={isLastItem}
              restOfUsers={isLastItem ? restOfUsers : usersPerUserListPage}
              setVisibleUsers={setVisibleUsers}
              searchQuery={searchQuery}
            />
          </IntersectionWatcher>
        );
    });
  }, [
    count,
    searchQuery,
    usersPerUserListPage,
    parentRef,
    setVisibleUsers,
  ]);

  return (
    <>
      {isModerator && (
        <UserSearchContainer
          onSearchChange={onSearchChange}
          isQueryLoading={isQueryLoading}
        />
      )}
      <Styled.UserListColumn
        onKeyDown={rove}
        tabIndex={0}
        role="list"
      >
        <Styled.VirtualizedList as="ul">
          {renderedPaginatedUsers}
        </Styled.VirtualizedList>
      </Styled.UserListColumn>
    </>
  );
};

interface UserListParticipantsContainerProps {
  parentRef: React.RefObject<HTMLDivElement | null>;
}

const UserListParticipantsContainer: React.FC<UserListParticipantsContainerProps> = ({
  parentRef,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const where = useMemo(() => makeUserSearchWhere(searchQuery), [searchQuery]);

  const {
    data: countData,
    loading: countLoading,
  } = useDeduplicatedSubscription<UsersCountSubscriptionResponse>(
    USER_AGGREGATE_COUNT_SUBSCRIPTION,
    { variables: { where } },
  );
  const count = countData?.user_aggregate?.aggregate?.count || 0;

  return (
    <UserListParticipants
      count={count}
      parentRef={parentRef}
      searchQuery={searchQuery}
      isModerator={currentUserData?.isModerator ?? false}
      onSearchChange={setSearchQuery}
      isQueryLoading={countLoading}
    />
  );
};

export default memo(UserListParticipantsContainer);
