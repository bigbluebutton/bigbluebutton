import React from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from '/imports/ui/components/sidebar-navigation/styles';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

interface BreakoutRoomsListItemProps {
  sidebarContentPanel: string,
  layoutContextDispatch: DispatcherFunction,
  intl: IntlShape,
  hasBreakoutRoom: boolean,
}

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

const BreakoutRoomsListItem = ({
  sidebarContentPanel,
  layoutContextDispatch,
  intl,
  hasBreakoutRoom,
}: BreakoutRoomsListItemProps) => {
  const toggleBreakoutPanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.BREAKOUT,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.BREAKOUT
        ? PANELS.NONE
        : PANELS.BREAKOUT,
    });
  };

  if (!hasBreakoutRoom) return null;

  return (
    <TooltipContainer
      title={intl.formatMessage(intlMessages.breakoutTitle)}
      position="right"
    >
      <Styled.ListItem
        id="breakout-rooms-toggle-button"
        role="button"
        tabIndex={0}
        active={sidebarContentPanel === PANELS.BREAKOUT}
        onClick={toggleBreakoutPanel}
        data-test="breakoutRoomsItem"
        aria-label={intl.formatMessage(intlMessages.breakoutTitle)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            toggleBreakoutPanel();
          }
        }}
      >
        <Icon iconName="rooms" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default injectIntl(BreakoutRoomsListItem);
