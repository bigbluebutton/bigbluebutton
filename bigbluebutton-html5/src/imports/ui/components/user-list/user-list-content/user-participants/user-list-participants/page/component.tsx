import React, { useEffect, useRef } from 'react';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { MEETING_PERMISSIONS_SUBSCRIPTION } from '../queries';
import { setLocalUserList, useLoadedUserList } from '/imports/ui/core/hooks/useLoadedUserList';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import { User } from '/imports/ui/Types/user';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Meeting } from '/imports/ui/Types/meeting';
import Styled from '../styles';
import UserActions from '../user-actions/component';
import ListItem from '../list-item/component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import SkeletonUserListItem from '../list-item/skeleton/component';

interface UserListParticipantsContainerProps {
  index: number;
  isLastItem: boolean;
  restOfUsers: number;
  setVisibleUsers: React.Dispatch<React.SetStateAction<{ [key: number]: User[]; }>>;
}

interface UsersListParticipantsPage {
  users: Array<User>;
  meeting: Meeting;
  currentUser: Partial<User>;
  pageId: string;
}

const UsersListParticipantsPage: React.FC<UsersListParticipantsPage> = ({
  users,
  currentUser,
  meeting,
  pageId,
}) => {
  const [openUserAction, setOpenUserAction] = React.useState<string | null>(null);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  return (
    <>
      {
        users.map((user) => {
          return (
            <Styled.UserListItem key={user.userId} style={{ direction: isRTL }}>
              <UserActions
                user={user}
                currentUser={currentUser as User}
                lockSettings={meeting.lockSettings}
                usersPolicies={meeting.usersPolicies}
                isBreakout={meeting.isBreakout}
                pageId={pageId}
                open={user.userId === openUserAction}
                setOpenUserAction={setOpenUserAction}
              >
                <ListItem user={user} lockSettings={meeting.lockSettings} />
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
    data: meetingData,
    loading: meetingLoading,
  } = useDeduplicatedSubscription(MEETING_PERMISSIONS_SUBSCRIPTION);
  const { meeting: meetingArray } = (meetingData || {});
  const meeting = meetingArray && meetingArray[0];

  useEffect(() => () => {
    setLocalUserList([]);
  }, []);

  const {
    data: usersData,
    loading: usersLoading,
  } = useLoadedUserList({ offset, limit: limit.current }, (u) => u) as GraphqlDataHookSubscriptionResponse<Array<User>>;
  const users = usersData ?? [];

  const { data: currentUser, loading: currentUserLoading } = useCurrentUser((c: Partial<User>) => ({
    isModerator: c.isModerator,
    userId: c.userId,
    presenter: c.presenter,
  }));

  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0] || {};
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

  if (usersLoading || meetingLoading || currentUserLoading || presentationLoading) {
    return Array.from({ length: isLastItem ? restOfUsers : 50 }).map((_, i) => (
      <Styled.UserListItem key={`not-visible-item-${i + 1}`}>
        {/* eslint-disable-next-line */}
        <SkeletonUserListItem enableAnimation={true} />
      </Styled.UserListItem>
    ));
  }

  return (
    <UsersListParticipantsPage
      users={users ?? []}
      meeting={meeting ?? {}}
      currentUser={currentUser ?? {}}
      pageId={pageId}
    />
  );
};

export default UserListParticipantsPageContainer;
