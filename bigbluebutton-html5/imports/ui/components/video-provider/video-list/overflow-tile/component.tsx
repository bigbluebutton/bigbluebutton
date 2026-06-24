import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

interface OverflowTileProps {
  overflowCount: number;
}

const intlMessages = defineMessages({
  overflowUsers: {
    id: 'app.video.overflowUsers',
    description: 'display +overflowCount users label',
  },
});

const OverflowTile: React.FC<OverflowTileProps> = ({ overflowCount }) => {
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

  const displayCount = Math.min(overflowCount, 3);

  return (
    <Styled.OverflowTileContainer data-test="overflowTile" isClickable={!isUserListPanelOpen} onClick={() => handleOpenUserList()}>
      <Styled.OverflowTileContent>
        <Styled.AvatarsContainer $count={displayCount}>
          {Array.from({ length: displayCount }, (_, index) => (
            <Styled.AvatarWrapper key={index} $index={index}>
              <Styled.Avatar $color="#4a148c">
                <Styled.AvatarInitials>
                  Us
                </Styled.AvatarInitials>
              </Styled.Avatar>
            </Styled.AvatarWrapper>
          ))}
        </Styled.AvatarsContainer>
        <Styled.OverflowText>
          {intl.formatMessage(intlMessages.overflowUsers, { overflowCount })}
        </Styled.OverflowText>
      </Styled.OverflowTileContent>
    </Styled.OverflowTileContainer>
  );
};

export default OverflowTile;
