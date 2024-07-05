import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';
import BreakoutRemainingTime from '/imports/ui/components/common/remaining-time/breakout-duration/component';

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
              <div aria-hidden>
                <Styled.BreakoutTitle>
                  {intl.formatMessage(intlMessages.breakoutTitle)}
                </Styled.BreakoutTitle>
                <Styled.BreakoutDuration>
                  <BreakoutRemainingTime />
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
