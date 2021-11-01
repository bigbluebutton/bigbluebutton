import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  sidebarContentPanel,
  layoutContextDispatch,
  intl,
}) => {
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

  if (hasBreakoutRoom) {
    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle>
            {intl.formatMessage(intlMessages.breakoutTitle)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList>
          <Styled.List>
            <Styled.ListItem
              role="button"
              tabIndex={0}
              onClick={toggleBreakoutPanel}
              data-test="breakoutRoomsItem"
              aria-label={intl.formatMessage(intlMessages.breakoutTitle)}
              onKeyPress={() => {}}
            >
              <Icon iconName="rooms" />
              <span aria-hidden>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
            </Styled.ListItem>
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
  return <span />;
};

export default injectIntl(BreakoutRoomItem);

BreakoutRoomItem.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
};
