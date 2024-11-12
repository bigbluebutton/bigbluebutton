import React from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';
import TooltipContainer from '../../common/tooltip/container';

interface TimerListItemProps {
  intl: IntlShape;
  sidebarContentPanel: string;
  layoutContextDispatch: DispatcherFunction;
  isModerator: boolean;
}

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

const TimerListItem = ({
  intl,
  isModerator,
  sidebarContentPanel,
  layoutContextDispatch,
}: TimerListItemProps) => {
  if (!isModerator) return null;

  return (
    <TooltipContainer
      title={intl.formatMessage(intlMessages.timer)}
      position="right"
    >
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
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default injectIntl(TimerListItem);
