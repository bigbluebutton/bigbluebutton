import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';
import BreakoutRemainingTime from '/imports/ui/components/breakout-room/breakout-remaining-time/container';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutTimeRemaining: {
    id: 'app.createBreakoutRoom.duration',
    description: 'Message that tells how much time is remaining for the breakout room',
  },
});

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  breakoutRoom,
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
              <div aria-hidden>
                <Styled.BreakoutTitle>
                  {intl.formatMessage(intlMessages.breakoutTitle)}
                </Styled.BreakoutTitle>
                <Styled.BreakoutDuration>
                  <BreakoutRemainingTime
                    messageDuration={intlMessages.breakoutTimeRemaining}
                    breakoutRoom={breakoutRoom}
                  />
                </Styled.BreakoutDuration>
              </div>
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
