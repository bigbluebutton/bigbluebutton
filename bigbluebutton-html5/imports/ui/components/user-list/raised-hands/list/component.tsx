import React, { useState } from 'react';
import Styled from '../styles';
import { User, RaisedHandUser } from '/imports/ui/Types/user';
import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import RaisedHandsListItem from '../list-item/component';
import deviceInfo from '/imports/utils/deviceInfo';

const { isMobile } = deviceInfo;

interface RaisedHandsListProps {
  raisedHands: RaisedHandUser[];
  currentUser: User;
  meeting: {
    isBreakout: boolean;
    lockSettings: LockSettings;
    usersPolicies: UsersPolicies;
  };
  pageId: string;
}

const RaisedHandsList: React.FC<RaisedHandsListProps> = ({
  raisedHands,
  currentUser,
  meeting,
  pageId,
}) => {
  const [openUserAction, setOpenUserAction] = useState<string | null>(null);

  if (raisedHands.length === 0) return null;

  const listContent = raisedHands.map((user, index) => (
    <Styled.RaisedHandsItem key={user.userId}>
      <RaisedHandsListItem
        index={index}
        user={user}
        currentUser={currentUser}
        lockSettings={meeting.lockSettings}
        usersPolicies={meeting.usersPolicies}
        isBreakout={meeting.isBreakout}
        pageId={pageId}
        openUserAction={openUserAction}
        setOpenUserAction={setOpenUserAction}
      />
    </Styled.RaisedHandsItem>
  ));

  return !isMobile ? (
    <Styled.ScrollableList role="tabpanel" tabIndex={0}>
      <Styled.List>{listContent}</Styled.List>
    </Styled.ScrollableList>
  ) : (
    <>{listContent}</>
  );
};

export default RaisedHandsList;
