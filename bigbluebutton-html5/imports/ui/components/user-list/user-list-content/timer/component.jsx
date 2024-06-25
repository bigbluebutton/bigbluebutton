import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  stopwatch: PropTypes.bool.isRequired,
  sidebarContentPanel: PropTypes.shape().isRequired,
  layoutContextDispatch: PropTypes.shape().isRequired,
  isModerator: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.timerTitle',
    description: 'Title for the time',
  },
  timer: {
    id: 'app.timer.timer.title',
    description: 'Title for the timer',
  },
  stopwatch: {
    id: 'app.timer.stopwatch.title',
    description: 'Title for the stopwatch',
  },
});

class Timer extends PureComponent {
  render() {
    const {
      intl,
      isModerator,
      stopwatch,
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;

    if (!isModerator) return null;

    const message = stopwatch ? intlMessages.stopwatch : intlMessages.timer;

    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle>
            {intl.formatMessage(intlMessages.title)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList>
          <Styled.List>
            <Styled.ListItem
              role="button"
              tabIndex={0}
              active={sidebarContentPanel === PANELS.TIMER}
              onClick={() => {
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                  value: sidebarContentPanel !== PANELS.TIMER,
                });
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                  value: sidebarContentPanel === PANELS.TIMER
                    ? PANELS.NONE
                    : PANELS.TIMER,
                });
              }}
            >
              <Icon iconName="time" />
              <span>
                {intl.formatMessage(message)}
              </span>
            </Styled.ListItem>
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

Timer.propTypes = propTypes;

export default injectIntl(Timer);
