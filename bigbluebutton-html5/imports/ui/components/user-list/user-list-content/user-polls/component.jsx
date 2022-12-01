import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  pollLabel: {
    id: 'app.poll.pollPaneTitle',
    description: 'label for user-list poll button',
  },
});

const UserPolls = ({
  intl,
  isPresenter,
  pollIsOpen,
  forcePollOpen,
  sidebarContentPanel,
  layoutContextDispatch,
  compact,
}) => {
  if (!isPresenter) return null;
  if (!pollIsOpen && !forcePollOpen) return null;

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
    <Styled.Messages>
      {!compact
        ? (
          <Styled.Container>
            <Styled.SmallTitle>
              {intl.formatMessage(intlMessages.pollLabel)}
            </Styled.SmallTitle>
          </Styled.Container>
        ) : null
      }
      <Styled.List>
        <Styled.ScrollableList>
          <TooltipContainer title={intl.formatMessage(intlMessages.pollLabel)}>
          <Styled.ListItem
            role="button"
            tabIndex={0}
            data-test="pollMenuButton"
            onClick={handleClickTogglePoll}
            onKeyPress={() => {}}
          >
            <Icon iconName="polling" />
            <span>{intl.formatMessage(intlMessages.pollLabel)}</span>
          </Styled.ListItem>
          </TooltipContainer>
        </Styled.ScrollableList>
      </Styled.List>
    </Styled.Messages>
  );
};

export default injectIntl(UserPolls);

UserPolls.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
};
