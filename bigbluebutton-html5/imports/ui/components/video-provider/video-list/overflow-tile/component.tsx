import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import { GridItem } from '/imports/ui/components/video-provider/types';

interface OverflowTileProps {
  overflowCount: number;
  overflowUsers: GridItem[];
}

const intlMessages = defineMessages({
  overflowUsers: {
    id: 'app.video.overflowUsers',
    description: 'display +overflowCount users label',
  },
});

const OverflowTile: React.FC<OverflowTileProps> = ({ overflowCount, overflowUsers }) => {
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();

  const sidebarNavigation = layoutSelectInput((i: Input) => i.sidebarNavigation);

  const isUserListPanelOpen = sidebarNavigation.isOpen
    && sidebarNavigation.sidebarNavPanel === PANELS.USERLIST;

  if (overflowCount <= 0) return null;

  const handleOpenUserList = () => {
    if (isUserListPanelOpen) return;

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
      value: PANELS.USERLIST,
    });
  };

  return (
    <Styled.OverflowTileContainer
      isClickable={!isUserListPanelOpen}
      onClick={() => handleOpenUserList()}
    >
      <Styled.OverflowTileContent>
        {overflowUsers.length > 0 && (
          <Styled.AvatarsContainer $count={overflowUsers.length}>
            {overflowUsers.map((user, index) => (
              <Styled.AvatarWrapper key={user.userId} $index={index}>
                <Styled.Avatar $color={user.color} $avatar={user.avatar} $moderator={user.isModerator}>
                  {!user.avatar && (
                    <Styled.AvatarInitials>
                      {user.name.toLowerCase().slice(0, 2)}
                    </Styled.AvatarInitials>
                  )}
                </Styled.Avatar>
              </Styled.AvatarWrapper>
            ))}
          </Styled.AvatarsContainer>
        )}
        <Styled.OverflowText>
          {intl.formatMessage(intlMessages.overflowUsers, { overflowCount })}
        </Styled.OverflowText>
      </Styled.OverflowTileContent>
    </Styled.OverflowTileContainer>
  );
};

export default OverflowTile;
