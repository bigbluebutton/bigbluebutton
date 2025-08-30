import React, { useContext, useEffect, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { setLocalUserList, useLoadedUserList } from '/imports/ui/core/hooks/useLoadedUserList';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { User } from '/imports/ui/Types/user';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import Styled from '../styles';
import UserActions from '../user-actions/component';
import ListItem from '../list-item/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import SkeletonUserListItem from '../list-item/skeleton/component';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { LockSettings, Meeting, UsersPolicies } from '/imports/ui/Types/meeting';

interface UserListParticipantsContainerProps {
  index: number;
  isLastItem: boolean;
  restOfUsers: number;
  setVisibleUsers: React.Dispatch<React.SetStateAction<{ [key: number]: User[]; }>>;
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
  let userListDropdownItems = [] as PluginSdk.UserListDropdownInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListDropdownItems) {
    userListDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.userListDropdownItems,
    ];
  }

  return (
    <>
      {
        users.map((user, idx) => {
          return (
            <Styled.UserListItem key={user.userId} style={{ direction: isRTL }}>
              <UserActions
                user={user}
                currentUser={currentUser as User}
                lockSettings={meeting.lockSettings}
                usersPolicies={meeting.usersPolicies}
                pageId={pageId}
                userListDropdownItems={userListDropdownItems}
                open={user.userId === openUserAction}
                setOpenUserAction={setOpenUserAction}
                isBreakout={isBreakout}
              >
                <ListItem index={offset + idx} user={user} lockSettings={meeting.lockSettings} />
              </UserActions>
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
}) => {
  const offset = index * 50;
  const limit = useRef(50);

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
  } = useLoadedUserList({ offset, limit: limit.current }, (u) => u) as GraphqlDataHookSubscriptionResponse<Array<User>>;
  const users = usersData ?? [];

  const { data: currentUser, loading: currentUserLoading } = useCurrentUser((c: Partial<User>) => ({
    userId: c.userId,
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
    raiseHand: c.raiseHand,
    away: c.away,
    reactionEmoji: c.reactionEmoji,
    avatar: c.avatar,
    isDialIn: c.isDialIn,
    name: c.name,
    color: c.color,
    presPagesWritable: c.presPagesWritable,
  }));

  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0];
  const pageId = presentationPage?.pageId;

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

  if (usersLoading || meetingLoading || !meeting || currentUserLoading || presentationLoading) {
    return Array.from({ length: isLastItem ? restOfUsers : 50 }).map((_, i) => (
      <Styled.UserListItem key={`not-visible-item-${i + 1}`}>
        {/* eslint-disable-next-line */}
        <SkeletonUserListItem enableAnimation={true} />
      </Styled.UserListItem>
    ));
  }

  const currentUserIndex = users.findIndex((u: User) => u.userId === currentUser?.userId);

  if (currentUserIndex !== -1) {
    users.splice(currentUserIndex, 1);
  }

  if (offset === 0) {
    users.unshift(currentUser as User);
  }

  if (!meeting || !currentUser) {
    return null;
  }

  return (
    <UsersListParticipantsPage
      users={users ?? []}
      meeting={{
        meetingId: meeting.meetingId!,
        isBreakout: !!meeting.isBreakout,
        lockSettings: meeting.lockSettings as LockSettings ?? {},
        usersPolicies: (meeting.usersPolicies as UsersPolicies) ?? {},
      }}
      currentUser={currentUser ?? {}}
      pageId={pageId ?? ''}
      offset={offset}
      isBreakout={meeting?.isBreakout ?? false}
    />
  );
};

export default UserListParticipantsPageContainer;
