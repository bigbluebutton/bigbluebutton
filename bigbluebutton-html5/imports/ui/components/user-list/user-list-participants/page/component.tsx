import React, {
  useContext,
  useEffect,
  useRef,
  useMemo,
  memo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { setLocalUserList, useLoadedUserList } from '/imports/ui/core/hooks/useLoadedUserList';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { User } from '/imports/ui/Types/user';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { getUsersPerUserListPage } from '/imports/ui/components/user-list/service';
import Styled from '../styles';
import LocalStyled from './styles';
import ListItem from '../list-item/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import SkeletonUserListItem from '../list-item/skeleton/component';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { LockSettings, Meeting, UsersPolicies } from '/imports/ui/Types/meeting';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';
import { USER_LIST_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';

interface UserListParticipantsContainerProps {
  index: number;
  isLastItem: boolean;
  restOfUsers: number;
  setVisibleUsers: React.Dispatch<React.SetStateAction<{ [key: number]: User[]; }>>;
  searchQuery: string;
}

interface UsersListParticipantsPage {
  users: Array<User>;
  meeting: {
    meetingId: string;
    isBreakout: boolean;
    lockSettings: Meeting['lockSettings'];
    usersPolicies: UsersPolicies;
  };
  currentUser: Partial<User>;
  pageId: string;
  offset: number;
  isBreakout: boolean;
}

const intlMessages = defineMessages({
  noSearchResults: {
    id: 'app.userList.noSearchResults',
    description: 'Message shown when a search query is entered but no participants match the query',
  },
});

const UsersListParticipantsPage: React.FC<UsersListParticipantsPage> = ({
  users,
  currentUser,
  meeting,
  pageId,
  offset,
  isBreakout,
}) => {
  const [openUserAction, setOpenUserAction] = React.useState<string | null>(null);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const userListDropdownItems = useMemo<PluginSdk.UserListDropdownInterface[]>(() => (
    pluginsExtensibleAreasAggregatedState.userListDropdownItems
      ? [...pluginsExtensibleAreasAggregatedState.userListDropdownItems]
      : []
  ), [pluginsExtensibleAreasAggregatedState.userListDropdownItems]);

  if (!meeting) return null;

  return (
    <>
      {
        users.map((user, idx) => {
          return (
            <Styled.UserListItem key={user.userId} style={{ direction: isRTL }}>
              <ListItem
                index={offset + idx}
                currentUserIsPresenter={currentUser?.presenter ?? false}
                currentUserIsModerator={currentUser?.isModerator ?? false}
                currentUserLocked={currentUser?.locked ?? false}
                user={user}
                lockSettings={meeting.lockSettings}
                usersPolicies={meeting.usersPolicies}
                pageId={pageId}
                userListDropdownItems={userListDropdownItems}
                open={user.userId === openUserAction}
                setOpenUserAction={setOpenUserAction}
                isBreakout={isBreakout}
                type="participant"
              />
            </Styled.UserListItem>
          );
        })
      }
    </>
  );
};

const UserListParticipantsPageContainer: React.FC<UserListParticipantsContainerProps> = ({
  index,
  isLastItem,
  restOfUsers,
  setVisibleUsers,
  searchQuery,
}) => {
  const intl = useIntl();
  const usersPerUserListPage = getUsersPerUserListPage();
  const offset = index * usersPerUserListPage;
  const limit = useRef(usersPerUserListPage);

  const {
    data: meeting,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
    isBreakout: m.isBreakout,
    meetingId: m.meetingId,
    breakoutPolicies: m.breakoutPolicies,
  }));

  useEffect(() => () => {
    setLocalUserList([]);
  }, []);

  const {
    data: usersData,
    loading: usersLoading,
  } = useLoadedUserList({
    offset,
    limit: limit.current,
    searchQuery,
  }, (u) => u) as GraphqlDataHookSubscriptionResponse<Array<User>>;

  const users = meeting?.meetingId
    ? filterByMeetingId(
      (usersData ?? []) as User[],
      meeting.meetingId,
      USER_LIST_SUBSCRIPTION,
      (u) => ({ mismatchedUserId: u.userId, mismatchedName: u.name }),
    )
    : [];

  const { data: currentUser, loading: currentUserLoading } = useCurrentUser((c: Partial<User>) => ({
    userId: c.userId,
    extId: c.extId,
    voice: c.voice,
    isModerator: c.isModerator,
    presenter: c.presenter,
    guest: c.guest,
    mobile: c.mobile,
    locked: c.locked,
    userLockSettings: c.userLockSettings,
    lastBreakoutRoom: c.lastBreakoutRoom,
    cameras: c.cameras,
    pinned: c.pinned,
    away: c.away,
    reactionEmoji: c.reactionEmoji,
    avatar: c.avatar,
    isDialIn: c.isDialIn,
    name: c.name,
    color: c.color,
    whiteboardWriteAccess: c.whiteboardWriteAccess,
    raiseHand: c.raiseHand,
  }));

  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription<
    CurrentPresentationPagesSubscriptionResponse>(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0];
  const pageId = presentationPage?.pageId || '';

  useEffect(() => {
    setVisibleUsers((prev) => {
      const newList = { ...prev };
      newList[index] = users;
      return newList;
    });
  }, [usersData]);

  useEffect(() => {
    return () => {
      setVisibleUsers((prev) => {
        // eslint-disable-next-line
        prev[index] = [];
        return prev;
      });
    };
  }, []);

  // create a stable meeting prop so child receives a stable reference when
  // nothing relevant changed
  const meetingProp = useMemo(() => ({
    meetingId: meeting?.meetingId ?? '',
    isBreakout: !!meeting?.isBreakout,
    lockSettings: (meeting?.lockSettings ?? ({} as LockSettings)) as LockSettings,
    usersPolicies: (meeting?.usersPolicies ?? ({} as UsersPolicies)) as UsersPolicies,
  }), [meeting?.meetingId, meeting?.isBreakout, meeting?.lockSettings, meeting?.usersPolicies]);

  const displayUsers = useMemo(() => {
    const hasSearch = Boolean(searchQuery?.trim());
    if (hasSearch) {
      return users;
    }

    const usersWithoutCurrent = users.filter((u: User) => u.userId !== currentUser?.userId);
    const shouldPinCurrentUser = offset === 0 && !!currentUser;

    return shouldPinCurrentUser
      ? [currentUser as User, ...usersWithoutCurrent]
      : usersWithoutCurrent;
  }, [offset, currentUser, users, searchQuery]);

  const isLoading = usersLoading
    || meetingLoading
    || !meeting
    || currentUserLoading
    || presentationLoading;

  if (isLoading) {
    return Array.from({ length: isLastItem ? restOfUsers : usersPerUserListPage }).map((_, i) => (
      <Styled.UserListItem key={`not-visible-item-${i + 1}`}>
        {/* eslint-disable-next-line */}
        <SkeletonUserListItem enableAnimation={true} />
      </Styled.UserListItem>
    ));
  }

  if (!meeting || !currentUser) {
    return null;
  }

  if (index === 0 && displayUsers.length === 0) {
    return (
      <LocalStyled.EmptySearchMessage>
        {intl.formatMessage(intlMessages.noSearchResults)}
      </LocalStyled.EmptySearchMessage>
    );
  }

  return (
    <UsersListParticipantsPage
      users={displayUsers ?? []}
      meeting={meetingProp}
      currentUser={currentUser ?? {}}
      pageId={pageId ?? ''}
      offset={offset}
      isBreakout={meeting?.isBreakout ?? false}
    />
  );
};

export default memo(UserListParticipantsPageContainer);
