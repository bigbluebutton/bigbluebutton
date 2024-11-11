import React from 'react';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from '../styles';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  pollLabel: {
    id: 'app.poll.pollPaneTitle',
    description: 'label for user-list poll button',
  },
});

interface PollsListItemProps {
  intl: IntlShape;
  isPresenter: boolean;
  sidebarContentPanel: string;
  layoutContextDispatch: DispatcherFunction;
}

const PollsListItem = ({
  intl,
  isPresenter = false,
  sidebarContentPanel,
  layoutContextDispatch,
}: PollsListItemProps) => {
  if (!isPresenter) return null;

  const handleClickTogglePoll = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.POLL,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.POLL
        ? PANELS.NONE
        : PANELS.POLL,
    });
  };

  return (
    <TooltipContainer
      title={intl.formatMessage(intlMessages.pollLabel)}
      position="right"
    >
      <Styled.ListItem
        id="polls-toggle-button"
        role="button"
        tabIndex={0}
        data-test="pollMenuButton"
        active={sidebarContentPanel === PANELS.POLL}
        onClick={handleClickTogglePoll}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleClickTogglePoll();
          }
        }}
      >
        <Icon iconName="polling" />
      </Styled.ListItem>
    </TooltipContainer>
  );
};

export default injectIntl(PollsListItem);
